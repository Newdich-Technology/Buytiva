import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../../../lib/constants/auth.js';
import { requestAuthApi } from '../../../../lib/auth/server.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.verifyApplication, 'POST', {
			email: String(form.get('email') ?? ''), challengeId: String(form.get('challengeId') ?? ''), code: String(form.get('code') ?? '')
		});
		return result.ok ? { verified: true } : fail(result.status, { error: result.data.message ?? 'Application email verification failed.' });
	}
};
