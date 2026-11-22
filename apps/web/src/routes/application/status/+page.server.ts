import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../../lib/constants/auth.js';
import { requestAuthApi } from '../../../lib/auth/server.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const reference = String(form.get('reference') ?? '');
		if (form.get('step') !== 'verify') {
			const result = await requestAuthApi(fetch, AUTH_ROUTES.requestStatus, 'POST', { email, reference });
			return result.ok ? { requested: true, email, reference, challengeId: result.data.challengeId } : fail(result.status, { error: result.data.message ?? 'Status access could not be requested.' });
		}
		const result = await requestAuthApi(fetch, AUTH_ROUTES.verifyStatus, 'POST', { email, challengeId: String(form.get('challengeId') ?? ''), code: String(form.get('code') ?? '') });
		return result.ok ? { statusResult: result.data } : fail(result.status, { error: result.data.message ?? 'Status verification failed.', email, reference, challengeId: String(form.get('challengeId') ?? '') });
	}
};
