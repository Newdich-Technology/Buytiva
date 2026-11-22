import { randomUUID, randomBytes } from 'node:crypto';
import { AUTH_ACCESS_TOKEN_MINUTES, AUTH_DAY_MS, AUTH_MINUTE_MS, AUTH_REFRESH_TOKEN_DAYS, AUTH_TOKEN_ISSUER } from '../../constants/auths/auth.constants.js';
import type { AuthConfig } from '../../configs/auth.config.js';
import type { AuthRepository } from '../../interfaces/auths/authRepository.interface.js';
import type { AuthAccount, AuthTokenResponse } from '../../models/auths/auth.model.js';
import { UserRole } from '../../enums/userRole.enum.js';
import { hashOneTimeToken } from './oneTimeToken.js';
import { signAccessToken } from './tokenSigner.js';

export async function issueAuthenticatedSession(
  repository: AuthRepository,
  config: AuthConfig,
  account: AuthAccount,
  mfaAt: Date | null,
  deviceLabel: string | null
): Promise<AuthTokenResponse> {
  const now = new Date();
  const sessionId = randomUUID();
  const familyId = randomUUID();
  const refreshToken = randomBytes(48).toString('base64url');
  const refreshExpires = new Date(now.getTime() + AUTH_REFRESH_TOKEN_DAYS * AUTH_DAY_MS);
  const access = createAccessCredential(account.id, sessionId, mfaAt, config, now);
  await repository.createSession({
    sessionId,
    refreshToken,
    refreshExpiresAt: refreshExpires,
    userId: account.id,
    tokenHash: hashOneTimeToken(sessionId),
    familyId,
    mfaAt,
    deviceLabel
  });
  const roles = [...account.roles];
  return {
    accessToken: access.token,
    refreshToken,
    accessTokenExpiresAt: access.expiresAt.toISOString(),
    refreshTokenExpiresAt: refreshExpires.toISOString(),
    user: {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      roles,
      currentRole: roles.includes(UserRole.CUSTOMER) ? UserRole.CUSTOMER : roles[0] ?? null
    }
  };
}

export function createAccessCredential(
  userId: string,
  sessionId: string,
  mfaAt: Date | null,
  config: AuthConfig,
  now: Date
): { token: string; expiresAt: Date } {
  const expiresAt = new Date(now.getTime() + AUTH_ACCESS_TOKEN_MINUTES * AUTH_MINUTE_MS);
  const token = signAccessToken({
    sub: userId,
    sid: sessionId,
    iss: AUTH_TOKEN_ISSUER,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    auth_time: Math.floor((mfaAt ?? now).getTime() / 1000),
    amr: mfaAt ? ['pwd', 'totp'] : ['pwd']
  }, config.tokenSecret);
  return { token, expiresAt };
}
