import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '../../../apps/web/src/lib/auth/apiError.js';
describe('web auth API error envelope', () => {
  it('preserves the backend code, message and request ID', () => {
    expect(normalizeApiError({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.', requestId: 'r1' } })).toEqual({ code: 'UNAUTHORIZED', message: 'Authentication is required.', requestId: 'r1' });
  });
  it('handles flat and malformed responses safely', () => {
    expect(normalizeApiError({ message: 'Unavailable' })).toEqual({ message: 'Unavailable' });
    expect(normalizeApiError(null)).toEqual({});
  });
});
