import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { requireRecentMfa } from '../../../src/middlewares/authenticate.middleware.js';

const request = (mfaAt: Date | null) => ({ authPrincipal: { mfaAt } }) as unknown as FastifyRequest;
describe('recent MFA enforcement', () => {
  afterEach(() => vi.useRealTimers());
  it('accepts only a valid MFA time within the allowed window', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-22T12:00:00Z'));
    expect(() => requireRecentMfa(request(new Date('2026-11-22T11:50:00Z')))).not.toThrow();
    for (const time of [null, new Date('2026-11-22T11:49:59Z'), new Date('2026-11-22T12:00:01Z'), new Date('invalid')]) {
      expect(() => requireRecentMfa(request(time))).toThrow('Recent authenticator verification is required.');
    }
  });
});
