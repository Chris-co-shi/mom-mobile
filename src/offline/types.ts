import type { MobileAccessContext } from '@/auth';

export type OfflineCommandStatus = 'PENDING' | 'SYNCING' | 'FAILED' | 'BLOCKED';

export interface OfflineCommand {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  userId: string;
  sid: string;
  clientId: 'mom-mobile-pda';
  factoryId: string;
  partyType: string | null;
  partyId: string | null;
  requiredPermission: string;
  idempotencyKey: string;
  correlationId: string;
  createdAt: string;
  schemaVersion: 1;
  attempts: number;
  status: OfflineCommandStatus;
  lastError?: string;
}

export interface OfflineCommandCreationInput {
  endpoint: string;
  method: OfflineCommand['method'];
  payload: unknown;
  requiredPermission: string;
  context: MobileAccessContext;
  currentFactoryId: string;
}

export type OfflineSyncBlockReason =
  | 'SESSION_REVOKED'
  | 'USER_MISMATCH'
  | 'SESSION_MISMATCH'
  | 'CLIENT_MISMATCH'
  | 'FACTORY_MISMATCH'
  | 'FACTORY_REVOKED'
  | 'PERMISSION_REVOKED'
  | 'PARTY_MISMATCH';

export type OfflineSyncDecision =
  | { allowed: true }
  | { allowed: false; reason: OfflineSyncBlockReason };
