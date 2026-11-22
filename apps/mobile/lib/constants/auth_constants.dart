const authApiPath = '/auth';
const identityApiPath = '/procurer-applications';
const invitationApiPath = '/invitations';
const mobileDeviceLabel = 'BUYTIVA Mobile';
const registrationPasswordMinimumLength = 12;
const authClientErrorMessages = {
  'apiBaseRequired': 'Set API_BASE_URL when building the mobile app.',
  'requestFailed': 'Request failed.',
  'unexpected': 'Unable to complete authentication.',
  'sessionRequired': 'Sign in again to continue.',
  'staffLoadFailed': 'Staff information could not be loaded.',
  'staffInviteFailed': 'The staff invitation could not be sent.',
  'staffActionFailed': 'The staff action could not be completed.',
};
const authApiPaths = {
  'register': '$authApiPath/register',
  'login': '$authApiPath/login',
  'completeLogin': '$authApiPath/login/complete',
  'emailVerify': '$authApiPath/email-otp/verify',
  'forgotPassword': '$authApiPath/password/forgot',
  'changePassword': '$authApiPath/password/change',
  'resetPassword': '$authApiPath/password/reset',
  'enrollTotp': '$authApiPath/mfa/totp/enroll',
  'verifyTotp': '$authApiPath/mfa/totp/verify',
  'logout': '$authApiPath/logout',
  'refresh': '$authApiPath/refresh',
  'currentUser': '/me',
};
const identityApiPaths = {
  'submitApplication': identityApiPath,
  'verifyApplicationEmail': '$identityApiPath/email/verify',
  'previewInvitation': '$invitationApiPath/preview',
  'acceptInvitation': '$invitationApiPath/accept',
};
const staffApiPaths = {
  'inviteAdmin': '/super-admin/staff/invite-admin',
  'inviteSuperAdmin': '/super-admin/staff/invite-super-admin',
  'staff': '/super-admin/staff',
  'permissions': '/super-admin/permissions',
  'suspend': '/super-admin/staff/{id}/suspend',
  'revoke': '/super-admin/staff/{id}/revoke',
};
const passwordRecoveryMessages = {
  'sent': 'If the account exists, password recovery instructions have been sent.',
  'invalidToken': 'The recovery token is invalid or expired.',
};
