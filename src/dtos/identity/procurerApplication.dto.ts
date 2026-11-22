import { Type } from 'typebox';
import { AUTH_APPLICATION_CATEGORIES_MAX, AUTH_APPLICATION_EXPERIENCE_MAX, AUTH_APPLICATION_NAME_MAX, AUTH_APPLICATION_PHONE_MAX } from '../../constants/auths/auth.constants.js';

export const submitProcurerApplicationBody = Type.Object({
  email: Type.String({ format: 'email', maxLength: 320 }),
  firstName: Type.String({ minLength: 1, maxLength: AUTH_APPLICATION_NAME_MAX }),
  lastName: Type.String({ minLength: 1, maxLength: AUTH_APPLICATION_NAME_MAX }),
  phone: Type.String({ minLength: 7, maxLength: AUTH_APPLICATION_PHONE_MAX }),
  proposedCountry: Type.String({ minLength: 2, maxLength: 80 }),
  proposedRegion: Type.Optional(Type.String({ maxLength: 80 })),
  proposedCity: Type.String({ minLength: 1, maxLength: 80 }),
  proposedArea: Type.Optional(Type.String({ maxLength: 80 })),
  categories: Type.Array(Type.String({ minLength: 1, maxLength: 80 }), { minItems: 1, maxItems: AUTH_APPLICATION_CATEGORIES_MAX }),
  experience: Type.Optional(Type.String({ maxLength: AUTH_APPLICATION_EXPERIENCE_MAX })),
  consentAccepted: Type.Literal(true)
}, { additionalProperties: false });

export const verifyApplicationEmailBody = Type.Object({
  email: Type.String({ format: 'email', maxLength: 320 }),
  challengeId: Type.String({ format: 'uuid' }),
  code: Type.String({ minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$' })
}, { additionalProperties: false });

export const applicationStatusRequestBody = Type.Object({
  email: Type.String({ format: 'email', maxLength: 320 }),
  reference: Type.String({ minLength: 8, maxLength: 64 })
}, { additionalProperties: false });

export const acceptProcurerInvitationBody = Type.Object({
  token: Type.String({ minLength: 32, maxLength: 128 }),
  password: Type.Optional(Type.String({ minLength: 12, maxLength: 128 })),
  confirmPassword: Type.Optional(Type.String({ minLength: 12, maxLength: 128 }))
}, { additionalProperties: false });

export const invitationPreviewBody = Type.Object({ token: Type.String({ minLength: 32, maxLength: 128 }) }, { additionalProperties: false });

export const applicationReviewBody = Type.Object({ reason: Type.String({ minLength: 8, maxLength: 1000 }) }, { additionalProperties: false });

export const identityCheckBody = Type.Object({
  identityEvidenceReference: Type.String({ minLength: 16, maxLength: 128 }),
  complianceEvidenceReference: Type.String({ minLength: 16, maxLength: 128 })
}, { additionalProperties: false });

export const applicationIdParams = Type.Object({ id: Type.String({ format: 'uuid' }) });

export const procurerApplicationResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  publicReference: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  applicantEmail: Type.String({ format: 'email' }),
  phone: Type.Union([Type.String(), Type.Null()]),
  proposedCountry: Type.String(),
  proposedRegion: Type.Union([Type.String(), Type.Null()]),
  proposedCity: Type.String(),
  proposedArea: Type.Union([Type.String(), Type.Null()]),
  categories: Type.Array(Type.String()),
  experience: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  emailVerifiedAt: Type.Union([Type.String(), Type.Null()]),
  identityVerifiedAt: Type.Union([Type.String(), Type.Null()]),
  complianceVerifiedAt: Type.Union([Type.String(), Type.Null()]),
  submittedAt: Type.String(),
  updatedAt: Type.String(),
  statusHistory: Type.Array(Type.Object({ status: Type.String(), reason: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String() }))
});

export const applicationStatusLookupResponse = Type.Object({
  reference: Type.String(),
  status: Type.String(),
  history: Type.Array(Type.Object({ status: Type.String(), reason: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String() }))
});
