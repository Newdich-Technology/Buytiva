import { randomUUID } from 'node:crypto';
import { AUTH_DUMMY_PASSWORD_VALUE, AUTH_LOGIN_CHALLENGE_MINUTES, AUTH_MINUTE_MS, AUTH_SECOND_MS } from '../../../constants/auths/auth.constants.js';
import { UserRole } from '../../../enums/userRole.enum.js';
import { UserStatus } from '../../../enums/userStatus.enum.js';
import { accountUnavailableError, emailNotVerifiedError, invalidCredentialsError } from '../../../errors/auths/auth.error.js';
import { hashOneTimeToken, generateOneTimeToken } from '../../../lib/security/oneTimeToken.js';
import { issueAuthenticatedSession } from '../../../lib/security/sessionIssuer.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

const dummyHashByHasher = new WeakMap<object, Promise<string>>();

export async function loginUserCommand(
  dependencies: AuthDependencies,
  input: { email: string; password: string; deviceLabel?: string }
) {
  const emailNormalized = normalizeEmail(input.email);
  const account = await dependencies.repository.findAccountByEmail(emailNormalized);
  let dummyHash = dummyHashByHasher.get(dependencies.passwordHasher);
  if (!dummyHash) {
    dummyHash = dependencies.passwordHasher.hashPassword(AUTH_DUMMY_PASSWORD_VALUE);
    dummyHashByHasher.set(dependencies.passwordHasher, dummyHash);
  }
  const matches = await dependencies.passwordHasher.verifyPassword(account?.passwordHash ?? await dummyHash, input.password);
  if (!account || !account.passwordHash || !matches) throw invalidCredentialsError();
  if (account.status !== UserStatus.ACTIVE) throw accountUnavailableError();
  if (!account.emailVerifiedAt) throw emailNotVerifiedError();
  if (account.roles.includes(UserRole.PROCURER) && account.procurerStatus === 'SUSPENDED' && !account.roles.includes(UserRole.CUSTOMER)) {
    throw accountUnavailableError();
  }
  if ((account.roles.includes(UserRole.ADMIN) || account.roles.includes(UserRole.SUPER_ADMIN)) &&
    account.staffStatus === 'SUSPENDED' && !account.roles.includes(UserRole.CUSTOMER)) {
    throw accountUnavailableError();
  }
  const privilegedRole = account.roles.some((role) => role !== UserRole.CUSTOMER);
  const challengePurpose: 'LOGIN_MFA' | 'MFA_ENROLLMENT' | null = account.mfaSecret
    ? 'LOGIN_MFA'
    : privilegedRole ? 'MFA_ENROLLMENT' : null;
  if (!challengePurpose) {
    return {
      authenticationRequired: false as const,
      session: await issueAuthenticatedSession(dependencies.repository, dependencies.config, account, null, input.deviceLabel ?? null)
    };
  }
  const challengeToken = generateOneTimeToken();
  await dependencies.repository.createLoginChallenge({
    id: randomUUID(),
    userId: account.id,
    tokenHash: challengeToken.tokenHash,
    purpose: challengePurpose,
    expiresAt: new Date(Date.now() + AUTH_LOGIN_CHALLENGE_MINUTES * AUTH_MINUTE_MS)
  });
  return {
    authenticationRequired: true as const,
    challengeType: challengePurpose,
    challengeToken: challengeToken.rawToken,
    expiresInSeconds: AUTH_LOGIN_CHALLENGE_MINUTES * AUTH_MINUTE_MS / AUTH_SECOND_MS,
    passwordChangeRequired: account.mustChangePassword
  };
}
