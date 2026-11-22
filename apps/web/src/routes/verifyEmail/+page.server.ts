import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '../../lib/constants/auth.js';
import { requestAuthApi } from '../../lib/auth/server.js';

export const load: PageServerLoad = ({ url }) => ({ email: url.searchParams.get('email') ?? '' });
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.verifyEmail, 'POST', {
			email: String(form.get('email') ?? ''), challengeId: String(form.get('challengeId') ?? ''), code: String(form.get('code') ?? '')
		});
		return result.ok ? { verified: true } : fail(result.status, { error: result.data.message ?? 'Email verification failed.' });
	}
};
