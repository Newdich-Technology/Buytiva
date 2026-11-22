import { AUTH_ERROR_MESSAGES, AUTH_SECURITY_EVENT_CODES } from '../../constants/auths/auth.constants.js';

export class EmailOutboxError extends Error {
	constructor(readonly code: string, message: string) {
		super(message);
		this.name = 'EmailOutboxError';
	}
}

export function invalidEmailOutboxPayloadError(): EmailOutboxError {
	return new EmailOutboxError(AUTH_SECURITY_EVENT_CODES.invalidMailPayload, AUTH_ERROR_MESSAGES.invalidMailPayload);
}

export function invalidEmailOutboxContentError(): EmailOutboxError {
	return new EmailOutboxError(AUTH_SECURITY_EVENT_CODES.invalidMailContent, AUTH_ERROR_MESSAGES.invalidMailContent);
}
