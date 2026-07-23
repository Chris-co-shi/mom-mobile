import type { MobileAccessContext } from '@/auth';

export type OfflineCommandStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'COMPLETED'
  | 'FAILED_RETRYABLE'
  | 'CONFLICT'
  | 'UNKNOWN_RESULT'
  | 'CHECKING_STATUS'
  | 'AUTH_REQUIRED'
  | 'MANUAL_REQUIRED'
  | 'CANCELLED';

export type OfflineCommandType = 'RECEIVE_MATERIAL' | 'LEGACY_UNMAPPED';

export interface ReceiveMaterialPayload {
  deliveryCode: string;
}

export interface OfflineCommandEnvelope<TPayload = unknown> {
  id: string;
  commandType: OfflineCommandType;
  schemaVersion: 2;
  payload: TPayload;
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
  updatedAt: string;
  attempts: number;
  nextAttemptAt: string | null;
  status: OfflineCommandStatus;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  serverSnapshot?: unknown;
}

export type OfflineCommand = OfflineCommandEnvelope;

export interface OfflineCommandCreationInput {
  commandType: Exclude<OfflineCommandType, 'LEGACY_UNMAPPED'>;
  payload: unknown;
  context: MobileAccessContext;
  currentFactoryId: string;
}

export interface OfflineCommandHandler {
  commandType: Exclude<OfflineCommandType, 'LEGACY_UNMAPPED'>;
  schemaVersion: 2;
  requiredPermission: string;
  path: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusQueryStrategy: 'IDEMPOTENCY_KEY';
  validatePayload(payload: unknown): boolean;
}

export type OfflineSyncBlockReason =
  | 'SESSION_REVOKED'
  | 'USER_MISMATCH'
  | 'SESSION_MISMATCH'
  | 'CLIENT_MISMATCH'
  | 'FACTORY_MISMATCH'
  | 'FACTORY_REVOKED'
  | 'PERMISSION_REVOKED'
  | 'PARTY_MISMATCH'
  | 'STATUS_NOT_SYNCABLE'
  | 'HANDLER_UNAVAILABLE';

export type OfflineSyncDecision =
  | { allowed: true }
  | { allowed: false; reason: OfflineSyncBlockReason };

export interface PreparedOfflineRequest {
  path: string;
  method: OfflineCommandHandler['method'];
  body: unknown;
  headers: {
    'Idempotency-Key': string;
    'X-Correlation-Id': string;
    'X-Factory-Id': string;
  };
}
