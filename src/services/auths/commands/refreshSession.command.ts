import { randomBytes } from 'node:crypto';
import { AUTH_DAY_MS, AUTH_REFRESH_TOKEN_DAYS } from '../../../constants/auths/auth.constants.js';
import { invalidChallengeError } from '../../../errors/auths/auth.error.js';
import { UserRole } from '../../../enums/userRole.enum.js';
import { createAccessCredential } from '../../../lib/security/sessionIssuer.js';
import { hashOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function refreshSessionCommand(dependencies: AuthDependencies, refreshToken: string) {
  const now = new Date();
  const nextRefreshToken = randomBytes(48).toString('base64url');
  const nextRefreshExpiresAt = new Date(now.getTime() + AUTH_REFRESH_TOKEN_DAYS * AUTH_DAY_MS);
  const rotated = await dependencies.repository.rotateRefreshToken(
    hashOneTimeToken(refreshToken),
    { tokenHash: hashOneTimeToken(nextRefreshToken), refreshExpiresAt: nextRefreshExpiresAt },
    now
  );
  if (rotated.status !== 'ROTATED' || !rotated.userId || !rotated.sessionId) throw invalidChallengeError();
  const [account, principal] = await Promise.all([
    dependencies.repository.findAccountById(rotated.userId),
    dependencies.repository.getAccessPrincipal(rotated.sessionId, rotated.userId, now)
  ]);
  if (!account || !principal) throw invalidChallengeError();
  const access = createAccessCredential(account.id, rotated.sessionId, principal.mfaAt, dependencies.config, now);
  return {
    accessToken: access.token,
    refreshToken: nextRefreshToken,
    accessTokenExpiresAt: access.expiresAt.toISOString(),
    refreshTokenExpiresAt: nextRefreshExpiresAt.toISOString(),
    user: {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      roles: [...account.roles],
      currentRole: account.roles.includes(UserRole.CUSTOMER) ? UserRole.CUSTOMER : account.roles[0] ?? null
    }
  };
}
