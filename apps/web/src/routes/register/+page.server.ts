import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../lib/constants/auth.js';
import { requestAuthApi } from '../../lib/auth/server.js';
import { getPasswordConfirmationError } from '../../lib/auth/registration.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const confirmPassword = String(form.get('confirmPassword') ?? '');
		const confirmationError = getPasswordConfirmationError(password, confirmPassword);
		if (confirmationError) return fail(400, { error: confirmationError });
		const result = await requestAuthApi(fetch, AUTH_ROUTES.register, 'POST', {
			email, displayName: String(form.get('displayName') ?? ''), password,
			termsAccepted: form.get('termsAccepted') === 'on'
		});
		return result.ok ? { registered: true, email } : fail(result.status, { error: result.data.message ?? 'Registration could not be completed.' });
	}
};
