import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { UserRole } from '../../src/generated/prisma/client.js';
import { getAuthConfig } from '../../src/configs/auth.config.js';
import { AUTH_BOOTSTRAP_MESSAGES, AUTH_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME, AUTH_MINUTE_MS, AUTH_OTP_EXPIRY_MINUTES, AUTH_OTP_RESEND_SECONDS, AUTH_PASSWORD_MAX_LENGTH, AUTH_PASSWORD_MIN_LENGTH, AUTH_SECOND_MS } from '../../src/constants/auths/auth.constants.js';
import { prismaClient } from '../../src/databases/prismaClient.js';
import { bootstrapConfigurationError, bootstrapConflictError } from '../../src/errors/administration/bootstrap.error.js';
import { createVerificationEmail } from '../../src/lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../src/lib/email/encryptedOutboxMessage.js';
import { Argon2PasswordHasher } from '../../src/lib/security/passwordHasher.js';
import { createOtpDigest, generateEmailOtp } from '../../src/lib/security/otpHasher.js';
import { normalizeEmail } from '../../src/utils/auths/normalizeEmail.js';
import { validatePasswordStrength } from '../../src/validators/auths/password.validator.js';

async function bootstrapSuperAdmin() {
  const config = getAuthConfig();
  const email = requireBootstrapValue(process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL);
  const password = requireBootstrapValue(process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD);
  validatePasswordStrength(password, AUTH_PASSWORD_MIN_LENGTH, AUTH_PASSWORD_MAX_LENGTH);
  const emailNormalized = normalizeEmail(email);
  const existing = await prismaClient.user.findUnique({ where: { emailNormalized }, include: { roleAssignments: true, credential: true, staffProfile: true } });
  if (existing) {
    const isPendingBootstrap = existing.roleAssignments.some((role) => role.role === UserRole.SUPER_ADMIN && !role.revokedAt) && existing.credential?.mustChangePassword === true && existing.emailVerifiedAt === null && existing.staffProfile?.status === 'PENDING_SETUP';
    if (isPendingBootstrap) {
      process.stdout.write(AUTH_BOOTSTRAP_MESSAGES.alreadyCreated + '\n');
      return;
    }
    throw bootstrapConflictError(false);
  }
  const existingSuperAdmin = await prismaClient.roleAssignment.findFirst({ where: { role: UserRole.SUPER_ADMIN, revokedAt: null } });
  if (existingSuperAdmin) throw bootstrapConflictError(true);

  const now = new Date();
  const userId = randomUUID();
  const challengeId = randomUUID();
  const code = generateEmailOtp();
  const expiresAt = new Date(now.getTime() + AUTH_OTP_EXPIRY_MINUTES * AUTH_MINUTE_MS);
  const outbox = createEncryptedEmailOutboxMessage(config, createVerificationEmail(emailNormalized, code, AUTH_OTP_EXPIRY_MINUTES, challengeId));
  const passwordHash = await new Argon2PasswordHasher().hashPassword(password);
  await prismaClient.$transaction(async (tx) => {
    await tx.user.create({ data: { id: userId, email, emailNormalized, displayName: AUTH_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME, status: 'ACTIVE', roleAssignments: { create: { role: UserRole.SUPER_ADMIN } }, credential: { create: { passwordHash, mustChangePassword: true } }, staffProfile: { create: { status: 'PENDING_SETUP' } }, emailOtpChallenges: { create: { id: challengeId, emailNormalized, purpose: 'EMAIL_VERIFICATION', digest: createOtpDigest({ challengeId, email: emailNormalized, purpose: 'EMAIL_VERIFICATION', code, pepper: config.otpPepper }), expiresAt, resendAt: new Date(now.getTime() + AUTH_OTP_RESEND_SECONDS * AUTH_SECOND_MS) } } } });
    await tx.outboxEvent.create({ data: { id: outbox.id, eventType: 'AUTH_EMAIL_VERIFICATION', aggregateType: 'USER', aggregateId: userId, dedupeKey: outbox.dedupeKey, payload: { encryptedMessage: outbox.payload } } });
    await tx.auditLog.create({ data: { action: 'SUPER_ADMIN_BOOTSTRAPPED', resourceType: 'USER', resourceId: userId } });
  });
  process.stdout.write(AUTH_BOOTSTRAP_MESSAGES.created + '\n');
}

function requireBootstrapValue(value: string | undefined): string {
  if (!value?.trim()) throw bootstrapConfigurationError();
  return value.trim();
}

try {
  await bootstrapSuperAdmin();
} catch {
  process.stderr.write(AUTH_BOOTSTRAP_MESSAGES.failed + '\n');
  process.exitCode = 1;
} finally {
  await prismaClient.$disconnect();
}
