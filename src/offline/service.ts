import type { MobileAccessContext } from '@/auth';
import { createRequestId } from '@/idempotency';
import { loadCommands, removeCommand, upsertCommand } from './repository';
import type {
  OfflineCommand,
  OfflineCommandCreationInput,
  OfflineCommandHandler,
  OfflineCommandStatus,
  OfflineSyncDecision,
  PreparedOfflineRequest,
  ReceiveMaterialPayload,
} from './types';

const receiveMaterialHandler: OfflineCommandHandler = {
  commandType: 'RECEIVE_MATERIAL',
  schemaVersion: 2,
  requiredPermission: 'wms:receipt:create',
  path: '/api/wms/receipts',
  method: 'POST',
  statusQueryStrategy: 'IDEMPOTENCY_KEY',
  validatePayload(payload: unknown): payload is ReceiveMaterialPayload {
    return Boolean(payload && typeof payload === 'object'
      && typeof (payload as ReceiveMaterialPayload).deliveryCode === 'string'
      && (payload as ReceiveMaterialPayload).deliveryCode.trim());
  },
};
export const commandHandlerRegistry = new Map([
  [receiveMaterialHandler.commandType, receiveMaterialHandler],
] as const);

const transitions: Record<OfflineCommandStatus, readonly OfflineCommandStatus[]> = {
  PENDING: ['SYNCING', 'AUTH_REQUIRED', 'CANCELLED'],
  SYNCING: ['COMPLETED', 'FAILED_RETRYABLE', 'CONFLICT', 'UNKNOWN_RESULT', 'AUTH_REQUIRED', 'MANUAL_REQUIRED'],
  COMPLETED: [],
  FAILED_RETRYABLE: ['PENDING', 'MANUAL_REQUIRED', 'CANCELLED'],
  CONFLICT: ['MANUAL_REQUIRED', 'CANCELLED'],
  UNKNOWN_RESULT: ['CHECKING_STATUS', 'MANUAL_REQUIRED'],
  CHECKING_STATUS: ['COMPLETED', 'FAILED_RETRYABLE', 'CONFLICT', 'MANUAL_REQUIRED'],
  AUTH_REQUIRED: ['PENDING', 'MANUAL_REQUIRED', 'CANCELLED'],
  MANUAL_REQUIRED: ['PENDING', 'CANCELLED'],
  CANCELLED: [],
};

export function enqueueCommand(input: OfflineCommandCreationInput): OfflineCommand {
  const handler = commandHandlerRegistry.get(input.commandType);
  if (!handler || !handler.validatePayload(input.payload)) throw new Error('离线领域命令 Payload 无效');
  if (!input.context.factoryIds.includes(input.currentFactoryId)) {
    throw new Error('不能为未授权 Factory 创建离线命令');
  }
  if (!input.context.permissions.includes(handler.requiredPermission)) {
    throw new Error('不能为缺少的 Permission 创建离线命令');
  }
  const now = new Date().toISOString();
  const command: OfflineCommand = {
    id: createRequestId('cmd'),
    commandType: handler.commandType,
    schemaVersion: 2,
    payload: input.payload,
    userId: input.context.userId,
    sid: input.context.sid,
    clientId: 'mom-mobile-pda',
    factoryId: input.currentFactoryId,
    partyType: input.context.partyType,
    partyId: input.context.partyId,
    requiredPermission: handler.requiredPermission,
    idempotencyKey: createRequestId('idem'),
    correlationId: createRequestId('corr'),
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    nextAttemptAt: null,
    status: 'PENDING',
  };
  upsertCommand(command);
  return command;
}

export function evaluateCommandForSync(
  command: OfflineCommand,
  context: MobileAccessContext,
  currentFactoryId: string | null,
  sessionActive = true,
): OfflineSyncDecision {
  if (command.status !== 'PENDING') return { allowed: false, reason: 'STATUS_NOT_SYNCABLE' };
  if (!commandHandlerRegistry.has(command.commandType as 'RECEIVE_MATERIAL')) {
    return { allowed: false, reason: 'HANDLER_UNAVAILABLE' };
  }
  if (!sessionActive) return { allowed: false, reason: 'SESSION_REVOKED' };
  if (command.userId !== context.userId) return { allowed: false, reason: 'USER_MISMATCH' };
  if (command.sid !== context.sid) return { allowed: false, reason: 'SESSION_MISMATCH' };
  if (command.clientId !== context.clientId) return { allowed: false, reason: 'CLIENT_MISMATCH' };
  if (command.factoryId !== currentFactoryId) return { allowed: false, reason: 'FACTORY_MISMATCH' };
  if (!context.factoryIds.includes(command.factoryId)) return { allowed: false, reason: 'FACTORY_REVOKED' };
  if (!context.permissions.includes(command.requiredPermission)) {
    return { allowed: false, reason: 'PERMISSION_REVOKED' };
  }
  if (command.partyType !== context.partyType || command.partyId !== context.partyId) {
    return { allowed: false, reason: 'PARTY_MISMATCH' };
  }
  return { allowed: true };
}

export function prepareCommandRequest(command: OfflineCommand): PreparedOfflineRequest {
  if (command.status !== 'SYNCING' && command.status !== 'CHECKING_STATUS') {
    throw new Error('只有 SYNCING 或 CHECKING_STATUS 命令可以生成网络请求');
  }
  const handler = commandHandlerRegistry.get(command.commandType as 'RECEIVE_MATERIAL');
  if (!handler) throw new Error('命令 Handler 不存在');
  return {
    path: handler.path,
    method: handler.method,
    body: command.payload,
    headers: {
      'Idempotency-Key': command.idempotencyKey,
      'X-Correlation-Id': command.correlationId,
      'X-Factory-Id': command.factoryId,
    },
  };
}

export function transitionCommand(
  command: OfflineCommand,
  next: OfflineCommandStatus,
  patch: Partial<Pick<OfflineCommand,
    'lastErrorCode' | 'lastErrorMessage' | 'serverSnapshot' | 'nextAttemptAt'>> = {},
): OfflineCommand {
  if (!transitions[command.status].includes(next)) {
    throw new Error(`不允许离线命令从 ${command.status} 转换为 ${next}`);
  }
  const updated = {
    ...command,
    ...patch,
    status: next,
    updatedAt: new Date().toISOString(),
    attempts: next === 'SYNCING' ? command.attempts + 1 : command.attempts,
  };
  upsertCommand(updated);
  return updated;
}

export function applyCommandHttpResult(
  command: OfflineCommand,
  status: number,
  serverSnapshot?: unknown,
): OfflineCommand {
  if (status >= 200 && status < 300) return transitionCommand(command, 'COMPLETED', { serverSnapshot });
  if (status === 401 || status === 403) return transitionCommand(command, 'AUTH_REQUIRED', { serverSnapshot });
  if (status === 409) return transitionCommand(command, 'CONFLICT', { serverSnapshot });
  if (status === 429 || status >= 500) return transitionCommand(command, 'FAILED_RETRYABLE', { serverSnapshot });
  return transitionCommand(command, 'MANUAL_REQUIRED', { serverSnapshot });
}

export function markUnknownResult(command: OfflineCommand, message: string): OfflineCommand {
  return transitionCommand(command, 'UNKNOWN_RESULT', {
    lastErrorCode: 'NETWORK_RESULT_UNKNOWN',
    lastErrorMessage: message,
  });
}

export function countUnsyncedCommands(): number {
  return loadCommands().filter((command) => !['COMPLETED', 'CANCELLED'].includes(command.status)).length;
}

export function commandsEligibleForSync(
  context: MobileAccessContext,
  currentFactoryId: string | null,
): OfflineCommand[] {
  return loadCommands().filter((command) => evaluateCommandForSync(command, context, currentFactoryId).allowed);
}

export const offlineQueue = {
  list: loadCommands,
  enqueue: enqueueCommand,
  countUnsynced: countUnsyncedCommands,
  eligibleForSync: commandsEligibleForSync,
  remove: removeCommand,
  retryAfterManualReview(id: string): void {
    const command = loadCommands().find((item) => item.id === id);
    if (!command) return;
    transitionCommand(command, 'PENDING', {
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      nextAttemptAt: null,
    });
  },
};
