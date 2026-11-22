import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../lib/constants/auth.js';
import { requestAuthApi } from '../../lib/auth/server.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.register, 'POST', {
			email: String(form.get('email') ?? ''), displayName: String(form.get('displayName') ?? ''),
			password: String(form.get('password') ?? ''), termsAccepted: form.get('termsAccepted') === 'on'
		});
		return result.ok ? { registered: true, email: String(form.get('email') ?? '') } : fail(result.status, { error: result.data.message ?? 'Registration could not be completed.' });
	}
};
