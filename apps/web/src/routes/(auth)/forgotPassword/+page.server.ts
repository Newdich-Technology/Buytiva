import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requestAuthApi } from '../../../lib/auth/server.js';
import { AUTH_ROUTES } from '../../../lib/constants/auth.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? '');
		if (token) {
			const result = await requestAuthApi(fetch, AUTH_ROUTES.resetPassword, 'POST', {
				token, password: String(form.get('password') ?? ''), confirmPassword: String(form.get('confirmPassword') ?? '')
			});
			return result.ok ? { complete: true } : fail(result.status, { error: result.data.message ?? 'Unable to reset password.', token });
		}
		const result = await requestAuthApi(fetch, AUTH_ROUTES.forgotPassword, 'POST', { email: String(form.get('email') ?? '') });
		return result.ok ? { requested: true } : fail(result.status, { error: result.data.message ?? 'Unable to process request.' });
	}
};
