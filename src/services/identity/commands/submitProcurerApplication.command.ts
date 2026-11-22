import { randomBytes, randomUUID } from 'node:crypto';
import { AUTH_APPLICATION_CATEGORIES_MAX, AUTH_APPLICATION_EXPERIENCE_MAX, AUTH_APPLICATION_NAME_MAX, AUTH_APPLICATION_PHONE_MAX, AUTH_APPLICATION_REFERENCE_PREFIX, AUTH_MINUTE_MS, AUTH_OTP_EXPIRY_MINUTES, AUTH_OTP_RESEND_SECONDS, AUTH_SECOND_MS } from '../../../constants/auths/auth.constants.js';
import { invalidApplicationInputError } from '../../../errors/identity/procurerApplication.error.js';
import { AUTH_ERROR_MESSAGES } from '../../../constants/auths/auth.constants.js';
import { createApplicationVerificationEmail } from '../../../lib/email/emailTemplates.js';
import { createEncryptedEmailOutboxMessage } from '../../../lib/email/encryptedOutboxMessage.js';
import { createOtpDigest, generateEmailOtp } from '../../../lib/security/otpHasher.js';
import { normalizeEmail } from '../../../utils/auths/normalizeEmail.js';
import type { AuthDependencies } from '../../../types/authDependencies.type.js';
import type { AuthPrincipal } from '../../../models/auths/auth.model.js';

export interface SubmitProcurerApplicationInput {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly proposedCountry: string;
  readonly proposedRegion?: string;
  readonly proposedCity: string;
  readonly proposedArea?: string;
  readonly categories: readonly string[];
  readonly experience?: string;
  readonly consentAccepted: boolean;
}

export async function submitProcurerApplicationCommand(dependencies: AuthDependencies, input: SubmitProcurerApplicationInput, principal?: AuthPrincipal) {
  const emailNormalized = normalizeEmail(input.email);
  if (principal && (!principal.emailVerifiedAt || normalizeEmail(principal.email) !== emailNormalized)) throw invalidApplicationInputError(AUTH_ERROR_MESSAGES.verifiedEmailRequired);
  if (!input.consentAccepted || !input.categories.length || input.categories.length > AUTH_APPLICATION_CATEGORIES_MAX || input.firstName.trim().length > AUTH_APPLICATION_NAME_MAX || input.lastName.trim().length > AUTH_APPLICATION_NAME_MAX || input.phone.trim().length > AUTH_APPLICATION_PHONE_MAX || (input.experience?.length ?? 0) > AUTH_APPLICATION_EXPERIENCE_MAX) {
    throw invalidApplicationInputError();
  }
  const applicationId = randomUUID();
  const publicReference = AUTH_APPLICATION_REFERENCE_PREFIX + randomBytes(16).toString('hex').toUpperCase();
  const challengeId = randomUUID();
  const code = generateEmailOtp();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + AUTH_OTP_EXPIRY_MINUTES * AUTH_MINUTE_MS);
  const outbox = createEncryptedEmailOutboxMessage(dependencies.config, createApplicationVerificationEmail(input.email, publicReference, code, AUTH_OTP_EXPIRY_MINUTES));
  const result = await dependencies.identityRepository.submitApplication({
    id: applicationId, publicReference, email: input.email.trim(), emailNormalized,
    firstName: input.firstName.trim(), lastName: input.lastName.trim(), phone: input.phone.trim(),
    proposedCountry: input.proposedCountry.trim(), proposedRegion: input.proposedRegion?.trim() || null,
    proposedCity: input.proposedCity.trim(), proposedArea: input.proposedArea?.trim() || null,
    categories: input.categories.map((category) => category.trim()), experience: input.experience?.trim() || null,
    linkedUserId: principal?.userId ?? null, consentAt: now,
    challenge: { id: challengeId, digest: createOtpDigest({ challengeId, email: emailNormalized, purpose: 'APPLICATION_EMAIL_VERIFICATION', code, pepper: dependencies.config.otpPepper }), expiresAt, resendAt: new Date(now.getTime() + AUTH_OTP_RESEND_SECONDS * AUTH_SECOND_MS) },
    verificationEmail: outbox
  });
  return { accepted: true as const, challengeId, reference: result.publicReference };
}
