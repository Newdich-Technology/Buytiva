import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../../lib/constants/auth.js';
import { clearAuthSession, getAuthSession, requestAuthApi } from '../../../lib/auth/server.js';

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const session = getAuthSession(cookies);
		if (!session) throw redirect(303, '/login');
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.changePassword, 'POST', {
			currentPassword: String(form.get('currentPassword') ?? ''), password: String(form.get('password') ?? ''),
			confirmPassword: String(form.get('confirmPassword') ?? '')
		}, session.accessToken);
		if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Password could not be changed.' });
		clearAuthSession(cookies);
		throw redirect(303, '/login');
	}
};
