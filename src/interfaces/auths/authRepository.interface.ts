import type { AuthAccount, AuthPrincipal, EmailOtpRecord, IssuedSession } from '../../models/auths/auth.model.js';

export interface PendingCustomerInput {
  readonly id: string;
  readonly email: string;
  readonly emailNormalized: string;
  readonly displayName: string;
  readonly passwordHash: string;
  readonly challenge: { readonly id: string; readonly digest: string; readonly expiresAt: Date; readonly resendAt: Date };
  readonly outbox: { readonly id: string; readonly payload: string; readonly dedupeKey: string };
}

export interface CreateOtpInput {
  readonly id: string;
  readonly emailNormalized: string;
  readonly purpose: string;
  readonly digest: string;
  readonly userId: string | null;
  readonly applicationId: string | null;
  readonly expiresAt: Date;
  readonly resendAt: Date;
  readonly outbox: { readonly id: string; readonly payload: string; readonly dedupeKey: string };
}

export interface AuthRepository {
  updateCustomerDisplayName(userId: string, displayName: string): Promise<boolean>;
  registerPendingCustomer(input: PendingCustomerInput): Promise<boolean>;
  findAccountByEmail(emailNormalized: string): Promise<AuthAccount | null>;
  findAccountById(userId: string): Promise<AuthAccount | null>;
  findOtpChallenge(id: string, emailNormalized: string, purpose: string): Promise<EmailOtpRecord | null>;
  createOtpChallenge(input: CreateOtpInput): Promise<boolean>;
  incrementOtpAttempt(id: string, expectedAttempts: number, now: Date): Promise<boolean>;
  consumeEmailVerification(id: string, expectedAttempts: number, userId: string, now: Date): Promise<boolean>;
  createLoginChallenge(input: { id: string; userId: string; tokenHash: string; purpose: 'LOGIN_MFA' | 'MFA_ENROLLMENT'; expiresAt: Date }): Promise<void>;
  findLoginChallenge(tokenHash: string): Promise<{ id: string; userId: string; purpose: 'LOGIN_MFA' | 'MFA_ENROLLMENT'; attempts: number; maxAttempts: number; expiresAt: Date; consumedAt: Date | null } | null>;
  incrementLoginAttempt(id: string, expectedAttempts: number, now: Date): Promise<boolean>;
  completeLoginChallenge(id: string, userId: string, expectedAttempts: number, timeStep: bigint, now: Date): Promise<boolean>;
  createSession(input: IssuedSession & { userId: string; tokenHash: string; familyId: string; mfaAt: Date | null; deviceLabel: string | null }): Promise<void>;
  getAccessPrincipal(sessionId: string, userId: string, now: Date): Promise<AuthPrincipal | null>;
  rotateRefreshToken(tokenHash: string, next: { refreshExpiresAt: Date; tokenHash: string }, now: Date): Promise<{ status: 'ROTATED' | 'REUSED' | 'INVALID'; userId?: string; sessionId?: string }>;
  revokeSession(sessionId: string, userId: string, reason: string, now: Date): Promise<void>;
  revokeAllSessions(userId: string, reason: string, now: Date): Promise<number>;
  listSessions(userId: string, now: Date): Promise<readonly { id: string; deviceLabel: string | null; createdAt: Date; lastUsedAt: Date | null; expiresAt: Date }[]>;
  requestPasswordReset(emailNormalized: string, input: { id: string; tokenHash: string; expiresAt: Date; outbox: { id: string; payload: string; dedupeKey: string } }): Promise<void>;
  resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<boolean>;
  changePassword(userId: string, passwordHash: string, now: Date): Promise<boolean>;
  saveMfaEnrollment(userId: string, ciphertext: Uint8Array, factorId: string): Promise<boolean>;
  getMfaFactor(userId: string): Promise<{ id: string; secretCiphertext: Uint8Array; enabledAt: Date | null; lastAcceptedTimeStep: bigint | null } | null>;
  completeMfaEnrollment(userId: string, factorId: string, timeStep: bigint, now: Date, challengeId?: string, expectedAttempts?: number): Promise<boolean>;
  acceptTotpStep(userId: string, factorId: string, expectedStep: bigint | null, nextStep: bigint, now: Date): Promise<boolean>;
  disableMfa(userId: string, factorId: string): Promise<boolean>;
}
