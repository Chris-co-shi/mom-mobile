import { describe, expect, it } from 'vitest';
import { evaluateCommandForSync } from './service';
import type { OfflineCommand } from './types';
import { MOBILE_CLIENT_ID, type MobileAccessContext } from '@/auth';

const context: MobileAccessContext = {
  userId: 'user-a', username: 'a', displayName: 'A', userType: 'INTERNAL',
  clientId: MOBILE_CLIENT_ID, sid: 'sid-a', mobileAccessEnabled: true,
  roles: [], permissions: ['wms:receipt:create'], factoryIds: ['factory-a'],
  partyType: null, partyId: null, currentFactoryId: 'factory-a',
};

const command: OfflineCommand = {
  id: 'command-1', endpoint: '/api/wms/receipts', method: 'POST', payload: {},
  userId: 'user-a', sid: 'sid-a', clientId: MOBILE_CLIENT_ID, factoryId: 'factory-a',
  partyType: null, partyId: null, requiredPermission: 'wms:receipt:create',
  createdAt: '2026-07-22T00:00:00Z', idempotencyKey: 'idem-1', correlationId: 'corr-1',
  schemaVersion: 1, attempts: 0, status: 'PENDING',
};

describe('offline command identity isolation', () => {
  it('allows only the exact active user, session, client, factory, party and permission context', () => {
    expect(evaluateCommandForSync(command, context, 'factory-a')).toEqual({ allowed: true });
  });

  it.each([
    ['USER_MISMATCH', { userId: 'user-b' }],
    ['SESSION_MISMATCH', { sid: 'sid-b' }],
    ['CLIENT_MISMATCH', { clientId: 'other-client' }],
  ] as const)('blocks cross-boundary sync with %s', (reason, change) => {
    expect(evaluateCommandForSync({ ...command, ...change } as OfflineCommand, context, 'factory-a'))
      .toEqual({ allowed: false, reason });
  });

  it('fails closed after factory or permission changes and after session revocation', () => {
    expect(evaluateCommandForSync(command, context, 'factory-b')).toEqual({
      allowed: false, reason: 'FACTORY_MISMATCH',
    });
    expect(evaluateCommandForSync(command, { ...context, factoryIds: [] }, 'factory-a')).toEqual({
      allowed: false, reason: 'FACTORY_REVOKED',
    });
    expect(evaluateCommandForSync(command, { ...context, permissions: [] }, 'factory-a')).toEqual({
      allowed: false, reason: 'PERMISSION_REVOKED',
    });
    expect(evaluateCommandForSync(command, context, 'factory-a', false)).toEqual({
      allowed: false, reason: 'SESSION_REVOKED',
    });
  });
});
