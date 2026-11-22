export const AUTH_API_VERSION = '/api/v1';
export const AUTH_ROUTES = {
	register: '/auth/register', verifyEmail: '/auth/email-otp/verify',
	login: '/auth/login', completeLogin: '/auth/login/complete', logout: '/auth/logout',
	enrollTotp: '/auth/mfa/totp/enroll', verifyTotp: '/auth/mfa/totp/verify',
	forgotPassword: '/auth/password/forgot', resetPassword: '/auth/password/reset', changePassword: '/auth/password/change',
	procurerApplication: '/procurer-applications', verifyApplication: '/procurer-applications/email/verify',
	requestStatus: '/procurer-applications/status/request', verifyStatus: '/procurer-applications/status/verify',
	previewInvitation: '/invitations/preview', acceptInvitation: '/invitations/accept', currentUser: '/me', refresh: '/auth/refresh'
} as const;
export const IDENTITY_API_PATHS = {
	ownApplication: '/procurer-applications/me', adminApplications: '/admin/procurer-applications',
	application: (id: string) => `/admin/procurer-applications/${encodeURIComponent(id)}`,
	recordChecks: (id: string) => `/admin/procurer-applications/${encodeURIComponent(id)}/identity-checks`,
	requestInformation: (id: string) => `/admin/procurer-applications/${encodeURIComponent(id)}/request-information`,
	approve: (id: string) => `/admin/procurer-applications/${encodeURIComponent(id)}/approve`,
	reject: (id: string) => `/admin/procurer-applications/${encodeURIComponent(id)}/reject`
} as const;
export const AUTH_FORM_MESSAGES = {
	serviceUnavailable: 'Authentication service is unavailable.',
	requestFailed: 'The request could not be completed.',
	invalidResponse: 'The authentication service returned an invalid response.'
} as const;
export const AUTH_WEB_PATHS = {
	login: '/login', dashboardOverview: '/dashboard/overview', changePassword: '/dashboard/changePassword'
} as const;
export const STAFF_API_PATHS = {
	inviteAdmin: '/super-admin/staff/invite-admin', inviteSuperAdmin: '/super-admin/staff/invite-super-admin',
	staff: '/super-admin/staff', permissions: '/super-admin/permissions', auditLogs: '/super-admin/audit-logs',
	permissionsFor: (id: string) => `/super-admin/staff/${encodeURIComponent(id)}/permissions`,
	suspend: (id: string) => `/super-admin/staff/${encodeURIComponent(id)}/suspend`,
	revoke: (id: string) => `/super-admin/staff/${encodeURIComponent(id)}/revoke`
} as const;
