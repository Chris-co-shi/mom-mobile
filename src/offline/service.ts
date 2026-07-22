import { createRequestId } from '@/idempotency';
import { loadCommands, removeCommand, upsertCommand } from './repository';
import type { MobileAccessContext } from '@/auth';
import type { OfflineCommand, OfflineCommandCreationInput, OfflineSyncDecision } from './types';

export function enqueueCommand(input: OfflineCommandCreationInput): OfflineCommand {
  if (!input.context.factoryIds.includes(input.currentFactoryId)) {
    throw new Error('不能为未授权 Factory 创建离线命令');
  }
  if (!input.context.permissions.includes(input.requiredPermission)) {
    throw new Error('不能为缺少的 Permission 创建离线命令');
  }
  const command: OfflineCommand = {
    endpoint: input.endpoint,
    method: input.method,
    payload: input.payload,
    userId: input.context.userId,
    sid: input.context.sid,
    clientId: 'mom-mobile-pda',
    factoryId: input.currentFactoryId,
    partyType: input.context.partyType,
    partyId: input.context.partyId,
    requiredPermission: input.requiredPermission,
    id: createRequestId('cmd'),
    idempotencyKey: createRequestId('idem'),
    correlationId: createRequestId('corr'),
    createdAt: new Date().toISOString(),
    schemaVersion: 1,
    attempts: 0,
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

export function countUnsyncedCommands(): number {
  return loadCommands().length;
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
  retry(id: string): void {
    const command = loadCommands().find((item) => item.id === id);
    if (!command) return;
    upsertCommand({ ...command, status: 'PENDING', lastError: undefined });
  },
};
