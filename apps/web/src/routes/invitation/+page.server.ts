import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '../../lib/constants/auth.js';
import { requestAuthApi } from '../../lib/auth/server.js';

export const load: PageServerLoad = ({ url }) => ({ token: url.searchParams.get('token') ?? '' });
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? '');
		const preview = await requestAuthApi(fetch, AUTH_ROUTES.previewInvitation, 'POST', { token });
		if (!preview.ok) return fail(preview.status, { error: preview.data.message ?? 'Invitation is invalid or expired.' });
		if (form.get('preview') === 'yes') return { invitation: preview.data, token };
		const result = await requestAuthApi(fetch, AUTH_ROUTES.acceptInvitation, 'POST', {
			token, password: String(form.get('password') ?? ''), confirmPassword: String(form.get('confirmPassword') ?? '')
		});
		return result.ok ? { accepted: true, invitation: preview.data } : fail(result.status, { error: result.data.message ?? 'Invitation could not be accepted.', invitation: preview.data, token });
	}
};
