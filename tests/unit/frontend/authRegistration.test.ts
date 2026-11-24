import { describe, expect, it } from 'vitest';
import { getPasswordConfirmationError } from '../../../apps/web/src/lib/auth/registration.js';
import { AUTH_FORM_MESSAGES } from '../../../apps/web/src/lib/constants/auth.js';

describe('registration password confirmation', () => {
	it('rejects mismatched passwords and accepts an exact match', () => {
		expect(getPasswordConfirmationError('first-password', 'second-password')).toBe(AUTH_FORM_MESSAGES.passwordMismatch);
		expect(getPasswordConfirmationError('same-password', 'same-password')).toBeNull();
	});
});
