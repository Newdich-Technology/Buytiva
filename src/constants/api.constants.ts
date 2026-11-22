export const API_VERSION_PREFIX = '/api/v1';
export const HEALTH_ENDPOINT_PATH = '/health';
export const AUTH_API_PATHS = {
  register: '/auth/register',
  resendEmailOtp: '/auth/email-otp/resend',
  verifyEmailOtp: '/auth/email-otp/verify',
  login: '/auth/login',
  completeLogin: '/auth/login/complete',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  logoutAll: '/auth/logout-all',
  forgotPassword: '/auth/password/forgot',
  resetPassword: '/auth/password/reset',
  changePassword: '/auth/password/change',
  enrollTotp: '/auth/mfa/totp/enroll',
  verifyTotp: '/auth/mfa/totp/verify',
  mfaStatus: '/auth/mfa/status',
  disableTotp: '/auth/mfa/totp/disable',
  sessions: '/auth/sessions',
  currentUser: '/me'
} as const;

export const IDENTITY_API_PATHS = {
  submitApplication: '/procurer-applications',
  verifyApplicationEmail: '/procurer-applications/email/verify',
  requestApplicationStatus: '/procurer-applications/status/request',
  verifyApplicationStatus: '/procurer-applications/status/verify',
  ownApplication: '/procurer-applications/me',
  applicationInformation: '/procurer-applications/:id/information',
  acceptInvitation: '/invitations/accept',
  invitationPreview: '/invitations/preview',
  adminApplications: '/admin/procurer-applications',
  adminApplication: '/admin/procurer-applications/:id',
  recordApplicationChecks: '/admin/procurer-applications/:id/identity-checks',
  requestApplicationInformation: '/admin/procurer-applications/:id/request-information',
  approveApplication: '/admin/procurer-applications/:id/approve',
  rejectApplication: '/admin/procurer-applications/:id/reject'
} as const;

export const STAFF_API_PATHS = {
  inviteAdministrator: '/super-admin/staff/invite-admin',
  inviteSuperAdministrator: '/super-admin/staff/invite-super-admin',
  acceptInvitation: '/staff/invitations/accept',
  staff: '/super-admin/staff',
  permissions: '/super-admin/permissions',
  auditLogs: '/super-admin/audit-logs',
  updatePermissions: '/super-admin/staff/:id/permissions',
  suspendStaff: '/super-admin/staff/:id/suspend',
  revokeStaff: '/super-admin/staff/:id/revoke'
} as const;

export const OPENAPI_ROUTE_PREFIX = '/api/v1/docs';
