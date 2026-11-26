import { Type } from 'typebox';

const emailField = Type.String({ format: 'email', maxLength: 320 });
const passwordField = Type.String({ minLength: 12, maxLength: 128 });
const codeField = Type.String({ minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$' });
const challengeField = Type.String({ minLength: 32, maxLength: 128 });

export const updateCustomerProfileBody = Type.Object({ displayName: Type.String({ minLength: 2, maxLength: 120 }) }, { additionalProperties: false });

export const registerUserBody = Type.Object({
  email: emailField,
  displayName: Type.String({ minLength: 2, maxLength: 120 }),
  password: passwordField,
  termsAccepted: Type.Literal(true)
}, { additionalProperties: false });

export const verifyEmailOtpBody = Type.Object({
  email: emailField,
  challengeId: Type.String({ format: 'uuid' }),
  code: codeField
}, { additionalProperties: false });

export const emailBody = Type.Object({ email: emailField }, { additionalProperties: false });

export const loginBody = Type.Object({
  email: emailField,
  password: Type.String({ minLength: 1, maxLength: 128 }),
  deviceLabel: Type.Optional(Type.String({ maxLength: 80 }))
}, { additionalProperties: false });

export const completeLoginBody = Type.Object({
  challengeToken: challengeField,
  code: codeField,
  deviceLabel: Type.Optional(Type.String({ maxLength: 80 }))
}, { additionalProperties: false });

export const refreshSessionBody = Type.Object({ refreshToken: challengeField }, { additionalProperties: false });

export const resetPasswordBody = Type.Object({
  token: challengeField,
  password: passwordField,
  confirmPassword: passwordField
}, { additionalProperties: false });

export const changePasswordBody = Type.Object({
  currentPassword: Type.String({ minLength: 1, maxLength: 128 }),
  password: passwordField,
  confirmPassword: passwordField
}, { additionalProperties: false });

export const enrollTotpBody = Type.Object({
  challengeToken: Type.Optional(challengeField),
  currentPassword: Type.Optional(Type.String({ minLength: 1, maxLength: 128 }))
}, { additionalProperties: false });

export const verifyTotpEnrollmentBody = Type.Object({
  challengeToken: Type.Optional(challengeField),
  code: codeField,
  deviceLabel: Type.Optional(Type.String({ maxLength: 80 }))
}, { additionalProperties: false });

export const disableMfaBody = Type.Object({
  password: Type.String({ minLength: 1, maxLength: 128 }),
  code: codeField
}, { additionalProperties: false });
