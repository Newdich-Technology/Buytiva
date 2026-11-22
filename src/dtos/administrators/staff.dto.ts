import { Type } from 'typebox';
import { AUTH_REVIEW_REASON_MAX, AUTH_REVIEW_REASON_MIN } from '../../constants/auths/auth.constants.js';
import { STAFF_PERMISSION_CODES } from '../../constants/administration/permission.constants.js';

export const staffInvitationBody = Type.Object({
  email: Type.String({ format: 'email', maxLength: 320 }),
  displayName: Type.String({ minLength: 2, maxLength: 120 }),
  reason: Type.String({ minLength: AUTH_REVIEW_REASON_MIN, maxLength: AUTH_REVIEW_REASON_MAX }),
  permissionProfile: Type.Optional(Type.Union([Type.Literal('SUPPORT_ADMIN'), Type.Literal('APPLICATION_REVIEWER'), Type.Literal('OPERATIONS_ADMIN'), Type.Literal('FINANCE_VIEWER'), Type.Literal('PLATFORM_ADMIN')])),
  permissionCodes: Type.Optional(Type.Array(Type.Union(STAFF_PERMISSION_CODES.map((permission) => Type.Literal(permission))), { maxItems: STAFF_PERMISSION_CODES.length }))
}, { additionalProperties: false });

export const staffPermissionsBody = Type.Object({
  permissionCodes: Type.Array(Type.Union(STAFF_PERMISSION_CODES.map((permission) => Type.Literal(permission))), { maxItems: STAFF_PERMISSION_CODES.length }),
  reason: Type.String({ minLength: AUTH_REVIEW_REASON_MIN, maxLength: AUTH_REVIEW_REASON_MAX })
}, { additionalProperties: false });

export const staffDecisionBody = Type.Object({ reason: Type.String({ minLength: AUTH_REVIEW_REASON_MIN, maxLength: AUTH_REVIEW_REASON_MAX }) }, { additionalProperties: false });
export const staffIdParams = Type.Object({ id: Type.String({ format: 'uuid' }) });
export const staffInvitationAcceptBody = Type.Object({ token: Type.String({ minLength: 32, maxLength: 128 }), password: Type.Optional(Type.String({ minLength: 12, maxLength: 128 })), confirmPassword: Type.Optional(Type.String({ minLength: 12, maxLength: 128 })) }, { additionalProperties: false });
