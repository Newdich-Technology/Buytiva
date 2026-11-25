import { describe, expect, it, vi } from 'vitest';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { signAccessToken } from '../../../src/lib/security/tokenSigner.js';
import { AUTH_TOKEN_ISSUER } from '../../../src/constants/auths/auth.constants.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

const id = '00000000-0000-4000-8000-000000000001';
const secret = 'independent-test-secret-over-thirty-two-characters';
describe('sensitive application review requires recent MFA', () => {
  it('denies all review decisions before accessing the identity repository', async () => {
    const now = Math.floor(Date.now() / 1000);
    const getAccessPrincipal = vi.fn().mockResolvedValue({ userStatus: 'ACTIVE', emailVerifiedAt: new Date(), mustChangePassword: false,
      roles: ['ADMIN'], staffStatus: 'ACTIVE', permissions: ['procurerApplication.review'], mfaAt: new Date(Date.now() - 11 * 60_000) });
    const deps = { config: { tokenSecret: secret }, repository: { getAccessPrincipal }, identityRepository: {} } as unknown as AuthDependencies;
    const app = createBuytivaFastifyApplication({ authDependencies: deps });
    const token = signAccessToken({ sub: id, sid: id, iss: AUTH_TOKEN_ISSUER, iat: now, exp: now + 3600, auth_time: now, amr: ['pwd'] }, secret);
    try {
      for (const [action, payload] of [
        ['identity-checks', { identityEvidenceReference: 'evidence-identity-reference-001', complianceEvidenceReference: 'evidence-compliance-reference-001' }],
        ['request-information', { reason: 'Additional information required.' }],
        ['approve', { reason: 'Identity and compliance documents reviewed.' }],
        ['reject', { reason: 'Identity and compliance documents reviewed.' }]
      ] as const) {
        const response = await app.inject({ method: 'POST', url: `/api/v1/admin/procurer-applications/${id}/${action}`, headers: { authorization: `Bearer ${token}` }, payload });
        expect(response.statusCode, action).toBe(403);
        expect(response.json().error.code).toBe('MFA_REQUIRED');
      }
      expect(getAccessPrincipal).toHaveBeenCalledTimes(4);
    } finally { await app.close(); }
  });
});
