import { createRequestId } from '@/idempotency';
import { loadCommands, removeCommand, upsertCommand } from './repository';
import type { OfflineCommand } from './types';

export function enqueueCommand(input: Pick<OfflineCommand, 'endpoint' | 'method' | 'payload'>): OfflineCommand {
  const command: OfflineCommand = {
    ...input,
    id: createRequestId('cmd'),
    idempotencyKey: createRequestId('idem'),
    correlationId: createRequestId('corr'),
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: 'PENDING',
  };
  upsertCommand(command);
  return command;
}

export const offlineQueue = {
  list: loadCommands,
  remove: removeCommand,
  retry(id: string): void {
    const command = loadCommands().find((item) => item.id === id);
    if (!command) return;
    upsertCommand({ ...command, status: 'PENDING', lastError: undefined });
  },
};
