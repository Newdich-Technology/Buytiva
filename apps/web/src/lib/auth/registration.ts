import { AUTH_FORM_MESSAGES } from '../constants/auth.js';

export function getPasswordConfirmationError(password: string, confirmPassword: string): string | null {
	return password === confirmPassword ? null : AUTH_FORM_MESSAGES.passwordMismatch;
}
