import { describe, expect, it, vi } from 'vitest';
import { verifyEmailOtpCommand } from '../../../src/services/auths/commands/verifyEmailOtp.command.js';
import { createOtpDigest } from '../../../src/lib/security/otpHasher.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';
import type { EmailOtpRecord } from '../../../src/models/auths/auth.model.js';

const pepper = 'test-otp-pepper';
const valid: EmailOtpRecord = {
  id: 'challenge', emailNormalized: 'customer@example.com', purpose: 'EMAIL_VERIFICATION',
  digest: createOtpDigest({ challengeId: 'challenge', email: 'customer@example.com', purpose: 'EMAIL_VERIFICATION', code: '123456', pepper }),
  userId: 'user', applicationId: null, attempts: 0, maxAttempts: 5,
  expiresAt: new Date(Date.now() + 60_000), consumedAt: null, supersededAt: null
};
const input = { email: ' Customer@Example.com ', challengeId: 'challenge', code: '123456' };
function fixture(record: EmailOtpRecord | null) {
  const repository = {
    findOtpChallenge: vi.fn().mockResolvedValue(record),
    incrementOtpAttempt: vi.fn().mockResolvedValue(true),
    consumeEmailVerification: vi.fn().mockResolvedValue(true)
  };
  return { repository, dependencies: { config: { otpPepper: pepper }, repository } as unknown as AuthDependencies };
}

describe('email verification challenge', () => {
  it('normalizes email, verifies the digest and consumes the challenge', async () => {
    const { repository, dependencies } = fixture(valid);
    await expect(verifyEmailOtpCommand(dependencies, input)).resolves.toEqual({ verified: true });
    expect(repository.findOtpChallenge).toHaveBeenCalledWith('challenge', 'customer@example.com', 'EMAIL_VERIFICATION');
    expect(repository.consumeEmailVerification).toHaveBeenCalledWith('challenge', 0, 'user', expect.any(Date));
  });
  it('records a wrong code and never verifies the account', async () => {
    const { repository, dependencies } = fixture(valid);
    await expect(verifyEmailOtpCommand(dependencies, { ...input, code: '000000' })).rejects.toThrow();
    expect(repository.incrementOtpAttempt).toHaveBeenCalledWith('challenge', 0, expect.any(Date));
    expect(repository.consumeEmailVerification).not.toHaveBeenCalled();
  });
  it.each([
    null, { ...valid, expiresAt: new Date(0) }, { ...valid, attempts: 5 },
    { ...valid, consumedAt: new Date() }, { ...valid, supersededAt: new Date() }, { ...valid, userId: null }
  ])('rejects missing, expired, exhausted or invalid challenges', async (record) => {
    const { repository, dependencies } = fixture(record);
    await expect(verifyEmailOtpCommand(dependencies, input)).rejects.toThrow();
    expect(repository.consumeEmailVerification).not.toHaveBeenCalled();
  });
  it('rejects a code when another request already consumed the challenge', async () => {
    const { repository, dependencies } = fixture(valid);
    repository.consumeEmailVerification.mockResolvedValue(false);
    await expect(verifyEmailOtpCommand(dependencies, input)).rejects.toThrow();
  });
});
