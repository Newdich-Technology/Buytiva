import { randomUUID } from 'node:crypto';
import { AUTH_MINUTE_MS, AUTH_OTP_EXPIRY_MINUTES, AUTH_OTP_RESEND_SECONDS, AUTH_SECOND_MS } from '../../../constants/auths/auth.constants.js';
import { createVerificationEmail } from '../../../lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createOtpDigest, generateEmailOtp } from '../../../lib/security/otpHasher.js';
import { invalidInputError, invalidRegistrationError, passwordPolicyError } from '../../../errors/auths/auth.error.js';
import { validatePasswordStrength } from '../../../validators/auths/password.validator.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export interface RegisterUserInput {
  readonly email: string;
  readonly displayName: string;
  readonly password: string;
  readonly termsAccepted: boolean;
}

export async function registerUserCommand(dependencies: AuthDependencies, input: RegisterUserInput) {
  if (!input.termsAccepted || input.displayName.trim().length < 2 || input.displayName.length > 120) {
    throw invalidRegistrationError();
  }
  try {
    validatePasswordStrength(input.password, dependencies.config.passwordMinLength, dependencies.config.passwordMaxLength);
  } catch {
    throw passwordPolicyError();
  }
  const emailNormalized = normalizeEmail(input.email);
  const challengeId = randomUUID();
  const code = generateEmailOtp();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AUTH_OTP_EXPIRY_MINUTES * AUTH_MINUTE_MS);
  const resendAt = new Date(now.getTime() + AUTH_OTP_RESEND_SECONDS * AUTH_SECOND_MS);
  const digest = createOtpDigest({
    challengeId,
    email: emailNormalized,
    purpose: 'EMAIL_VERIFICATION',
    code,
    pepper: dependencies.config.otpPepper
  });
  const outbox = createEncryptedEmailOutboxMessage(
    dependencies.config,
    createVerificationEmail(emailNormalized, code, AUTH_OTP_EXPIRY_MINUTES, challengeId)
  );
  await dependencies.repository.registerPendingCustomer({
    id: randomUUID(),
    email: input.email.trim(),
    emailNormalized,
    displayName: input.displayName.trim(),
    passwordHash: await dependencies.passwordHasher.hashPassword(input.password),
    challenge: { id: challengeId, digest, expiresAt, resendAt },
    outbox
  });
  return { accepted: true as const, message: 'If the address can be registered, a verification message will be sent.' };
}
