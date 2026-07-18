export type OfflineCommandStatus = 'PENDING' | 'SYNCING' | 'FAILED';

export interface OfflineCommand {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  idempotencyKey: string;
  correlationId: string;
  createdAt: string;
  attempts: number;
  status: OfflineCommandStatus;
  lastError?: string;
}
