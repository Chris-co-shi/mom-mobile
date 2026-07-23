import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOBILE_CLIENT_ID, type MobileAccessContext } from '@/auth';
import { loadCommands } from './repository';
import {
  applyCommandHttpResult,
  evaluateCommandForSync,
  markUnknownResult,
  prepareCommandRequest,
  transitionCommand,
} from './service';
import type { OfflineCommand } from './types';

const memory = new Map<string, unknown>();
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => memory.get(key),
  setStorageSync: (key: string, value: unknown) => memory.set(key, value),
  removeStorageSync: (key: string) => memory.delete(key),
});

const context: MobileAccessContext = {
  userId: 'user-a', username: 'a', displayName: 'A', userType: 'INTERNAL',
  clientId: MOBILE_CLIENT_ID, sid: 'sid-a', mobileAccessEnabled: true,
  roles: [], permissions: ['wms:receipt:create'], factoryIds: ['factory-a'],
  partyType: null, partyId: null, currentFactoryId: 'factory-a',
};

const command: OfflineCommand = {
  id: 'command-1', commandType: 'RECEIVE_MATERIAL', payload: { deliveryCode: 'ASN-1' },
  userId: 'user-a', sid: 'sid-a', clientId: MOBILE_CLIENT_ID, factoryId: 'factory-a',
  partyType: null, partyId: null, requiredPermission: 'wms:receipt:create',
  createdAt: '2026-07-22T00:00:00Z', updatedAt: '2026-07-22T00:00:00Z',
  idempotencyKey: 'idem-1', correlationId: 'corr-1', schemaVersion: 2,
  attempts: 0, nextAttemptAt: null, status: 'PENDING',
};

beforeEach(() => memory.clear());

describe('offline business command isolation and state machine', () => {
  it('persists no endpoint or HTTP method and derives the request from the handler registry', () => {
    const syncing = { ...command, status: 'SYNCING' as const };
    expect(JSON.stringify(syncing)).not.toMatch(/endpoint|"method"/u);
    expect(prepareCommandRequest(syncing)).toEqual({
      path: '/api/wms/receipts',
      method: 'POST',
      body: { deliveryCode: 'ASN-1' },
      headers: {
        'Idempotency-Key': 'idem-1',
        'X-Correlation-Id': 'corr-1',
        'X-Factory-Id': 'factory-a',
      },
    });
  });

  it('allows only the exact active user, session, client, factory, party and permission context', () => {
    expect(evaluateCommandForSync(command, context, 'factory-a')).toEqual({ allowed: true });
    for (const [reason, change] of [
      ['USER_MISMATCH', { userId: 'user-b' }],
      ['SESSION_MISMATCH', { sid: 'sid-b' }],
      ['CLIENT_MISMATCH', { clientId: 'other-client' }],
    ] as const) {
      expect(evaluateCommandForSync({ ...command, ...change } as OfflineCommand, context, 'factory-a'))
        .toEqual({ allowed: false, reason });
    }
  });

  it('fails closed after factory, permission or session revocation', () => {
    expect(evaluateCommandForSync(command, context, 'factory-b')).toEqual({ allowed: false, reason: 'FACTORY_MISMATCH' });
    expect(evaluateCommandForSync(command, { ...context, factoryIds: [] }, 'factory-a'))
      .toEqual({ allowed: false, reason: 'FACTORY_REVOKED' });
    expect(evaluateCommandForSync(command, { ...context, permissions: [] }, 'factory-a'))
      .toEqual({ allowed: false, reason: 'PERMISSION_REVOKED' });
    expect(evaluateCommandForSync(command, context, 'factory-a', false))
      .toEqual({ allowed: false, reason: 'SESSION_REVOKED' });
  });

  it('keeps UNKNOWN_RESULT non-retryable and reuses the original idempotency key for status checking', () => {
    const syncing = transitionCommand(command, 'SYNCING');
    const unknown = markUnknownResult(syncing, 'timeout');
    expect(evaluateCommandForSync(unknown, context, 'factory-a'))
      .toEqual({ allowed: false, reason: 'STATUS_NOT_SYNCABLE' });
    expect(() => transitionCommand(unknown, 'PENDING')).toThrow(/不允许/u);
    const checking = transitionCommand(unknown, 'CHECKING_STATUS');
    expect(prepareCommandRequest(checking).headers['Idempotency-Key']).toBe('idem-1');
  });

  it('maps 409 to CONFLICT and never automatically returns protected states to PENDING', () => {
    const syncing = transitionCommand(command, 'SYNCING');
    const conflict = applyCommandHttpResult(syncing, 409, { version: 2 });
    expect(conflict.status).toBe('CONFLICT');
    expect(() => transitionCommand(conflict, 'PENDING')).toThrow(/不允许/u);
  });

  it('migrates exact legacy commands deterministically and quarantines unsafe records', () => {
    memory.set('mom-mobile:offline-command-queue:v1', [
      { ...command, schemaVersion: 1, endpoint: '/api/wms/receipts', method: 'POST' },
      { ...command, id: 'legacy-unsafe', schemaVersion: 1, endpoint: '/api/future', method: 'DELETE' },
    ]);
    const migrated = loadCommands();
    expect(migrated[0]).toMatchObject({ commandType: 'RECEIVE_MATERIAL', status: 'PENDING', schemaVersion: 2 });
    expect(migrated[1]).toMatchObject({ commandType: 'LEGACY_UNMAPPED', status: 'MANUAL_REQUIRED', schemaVersion: 2 });
    expect(JSON.stringify(migrated)).not.toMatch(/endpoint|"method"/u);
    expect(memory.has('mom-mobile:offline-command-queue:v1')).toBe(false);
  });
});
