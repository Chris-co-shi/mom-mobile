import { storage } from '@/platform/storage';
import type { OfflineCommand } from './types';

const STORAGE_KEY = 'mom-mobile:offline-command-queue:v2';
const LEGACY_STORAGE_KEY = 'mom-mobile:offline-command-queue:v1';

interface LegacyHttpCommand {
  id?: string;
  endpoint?: string;
  method?: string;
  payload?: unknown;
  userId?: string;
  sid?: string;
  clientId?: string;
  factoryId?: string;
  partyType?: string | null;
  partyId?: string | null;
  requiredPermission?: string;
  idempotencyKey?: string;
  correlationId?: string;
  createdAt?: string;
  attempts?: number;
}

export function loadCommands(): OfflineCommand[] {
  const current = storage.get<OfflineCommand[]>(STORAGE_KEY, []);
  if (current.length) return current;
  const legacy = storage.get<LegacyHttpCommand[]>(LEGACY_STORAGE_KEY, []);
  if (!legacy.length) return current;
  const migrated = legacy.map(migrateLegacyCommand);
  saveCommands(migrated);
  storage.remove(LEGACY_STORAGE_KEY);
  return migrated;
}

function migrateLegacyCommand(legacy: LegacyHttpCommand): OfflineCommand {
  const exactReceiveMaterial = legacy.endpoint === '/api/wms/receipts'
    && legacy.method === 'POST'
    && legacy.clientId === 'mom-mobile-pda'
    && Boolean(legacy.userId?.trim())
    && Boolean(legacy.sid?.trim())
    && Boolean(legacy.factoryId?.trim())
    && Boolean(legacy.idempotencyKey?.trim())
    && Boolean(legacy.correlationId?.trim())
    && Boolean(legacy.payload && typeof legacy.payload === 'object'
      && typeof (legacy.payload as { deliveryCode?: unknown }).deliveryCode === 'string');
  const now = new Date().toISOString();
  return {
    id: legacy.id ?? `legacy-${crypto.randomUUID()}`,
    commandType: exactReceiveMaterial ? 'RECEIVE_MATERIAL' : 'LEGACY_UNMAPPED',
    schemaVersion: 2,
    payload: legacy.payload ?? {},
    userId: legacy.userId ?? '',
    sid: legacy.sid ?? '',
    clientId: 'mom-mobile-pda',
    factoryId: legacy.factoryId ?? '',
    partyType: legacy.partyType ?? null,
    partyId: legacy.partyId ?? null,
    requiredPermission: exactReceiveMaterial ? 'wms:receipt:create' : '',
    idempotencyKey: legacy.idempotencyKey ?? `legacy-idem-${crypto.randomUUID()}`,
    correlationId: legacy.correlationId ?? `legacy-corr-${crypto.randomUUID()}`,
    createdAt: legacy.createdAt ?? now,
    updatedAt: now,
    attempts: legacy.attempts ?? 0,
    nextAttemptAt: null,
    status: exactReceiveMaterial ? 'PENDING' : 'MANUAL_REQUIRED',
    ...(exactReceiveMaterial ? {} : {
      lastErrorCode: 'LEGACY_COMMAND_UNMAPPED',
      lastErrorMessage: '旧 HTTP 缓存无法安全映射为领域命令，需要人工处理',
    }),
  };
}

export function saveCommands(commands: OfflineCommand[]): void {
  storage.set(STORAGE_KEY, commands);
}

export function upsertCommand(command: OfflineCommand): void {
  const commands = loadCommands();
  const index = commands.findIndex((item) => item.id === command.id);
  if (index >= 0) commands[index] = command;
  else commands.push(command);
  saveCommands(commands);
}

export function removeCommand(id: string): void {
  saveCommands(loadCommands().filter((item) => item.id !== id));
}
