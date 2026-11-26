import { describe, expect, it, vi } from 'vitest';
import { refreshSessionCommand } from '../../../src/services/auths/commands/refreshSession.command.js';
import type { AuthDependencies } from '../../../src/types/authDependencies.type.js';

describe('refresh account eligibility', () => {
  it.each([{ userStatus: 'SUSPENDED', emailVerifiedAt: new Date() }, { userStatus: 'ACTIVE', emailVerifiedAt: null }])('rejects and revokes a session when account is unavailable', async (principal) => {
    const repository = { rotateRefreshToken: vi.fn().mockResolvedValue({ status: 'ROTATED', userId: 'u', sessionId: 's' }),
      findAccountById: vi.fn().mockResolvedValue({ id: 'u' }), getAccessPrincipal: vi.fn().mockResolvedValue(principal), revokeSession: vi.fn().mockResolvedValue(undefined) };
    const dependencies = { repository, config: {} } as unknown as AuthDependencies;
    await expect(refreshSessionCommand(dependencies, 'refresh-token')).rejects.toThrow();
    expect(repository.revokeSession).toHaveBeenCalledWith('s', 'u', 'ACCOUNT_UNAVAILABLE', expect.any(Date));
  });
});
