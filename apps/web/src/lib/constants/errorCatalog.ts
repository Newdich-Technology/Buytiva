import catalog from './errorCatalog.data.json' with { type: 'json' };

export type ErrorState = {
  id: string;
  httpStatus: number | null;
  presentation: string;
  title: string;
  body: string;
  primaryAction: string;
  illustration: string;
  severity: 'info' | 'warning' | 'critical';
  statusLabel: string;
};

export const BACKEND_ERROR_STATE_MAP: Record<string, string> = {
	INTERNAL_ERROR: 'server_error', NOT_FOUND: 'not_found', VALIDATION_ERROR: 'validation_failed',
	CONFLICT: 'request_conflict', UNAUTHORIZED: 'unauthenticated', FORBIDDEN: 'forbidden',
	EMAIL_NOT_VERIFIED: 'email_verification_required', PENDING_MFA: 'mfa_required',
	PENDING_PASSWORD_CHANGE: 'password_change_required', ACCOUNT_SUSPENDED: 'account_locked',
	PROCURER_PENDING_REVIEW: 'application_pending', PROCURER_PENDING_COMPLIANCE: 'application_pending',
	RATE_LIMITED: 'rate_limited', MFA_REQUIRED: 'mfa_required', APPLICATION_CONFLICT: 'request_conflict',
	APPLICATION_UNAVAILABLE: 'application_unavailable', INVITATION_INVALID: 'invitation_invalid'
};

export const ERROR_ACTION_LABELS: Record<string, string> = {
	fix_fields: 'Review this form', login: 'Sign in', role_home: 'Go to your overview',
	go_home: 'Back to Buytiva', go_back: 'Go back', retry_safe: 'Try again',
	review_quote: 'Get help with this quote', request_invitation: 'Get help with this invitation',
	choose_file: 'Choose another file', contact_support: 'View help options', wait: 'Return to Buytiva',
	check_status: 'View your account', reconnect: 'Check again', change_area: 'View delivery coverage',
	add_item: 'Create an account', track_application: 'Track your application', view_application: 'View application status',
	check_payment: 'View help options', view_fund_status: 'View help options', view_upload_status: 'View help options',
	verify_email: 'Verify your email', change_password: 'Change your password'
};

export const ERROR_CATALOG = Object.fromEntries(
  catalog.states.map((state) => [state.id, {
    id: state.id,
    httpStatus: state.httpStatus,
    presentation: state.presentation,
    title: state.title,
    body: state.body,
    primaryAction: state.primaryAction,
    illustration: state.illustration,
    severity: state.id.includes('payment') || state.id.includes('payout') || state.id === 'account_locked' ? 'warning' : state.id === 'server_error' || state.id === 'bad_gateway' ? 'critical' : 'info',
    statusLabel: state.id.replaceAll('_', ' ')
  } satisfies ErrorState])
) as Record<string, ErrorState>;

export function resolveBuytivaError(code: string, status: number): ErrorState {
	const stateId = BACKEND_ERROR_STATE_MAP[code.toUpperCase()] ?? code.toLowerCase();
	const matchingCode = ERROR_CATALOG[stateId];
  if (matchingCode) return matchingCode;
  return Object.values(ERROR_CATALOG).find((state) => state.httpStatus === status) ??
    (ERROR_CATALOG as Record<string, ErrorState>).server_error!;
}
