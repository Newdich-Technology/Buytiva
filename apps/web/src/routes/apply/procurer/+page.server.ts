import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '../../../lib/constants/auth.js';
import { requestAuthApi } from '../../../lib/auth/server.js';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.procurerApplication, 'POST', {
			email: String(form.get('email') ?? ''), firstName: String(form.get('firstName') ?? ''), lastName: String(form.get('lastName') ?? ''),
			phone: String(form.get('phone') ?? ''), proposedCountry: String(form.get('proposedCountry') ?? ''),
			proposedRegion: String(form.get('proposedRegion') ?? '') || undefined, proposedCity: String(form.get('proposedCity') ?? ''),
			proposedArea: String(form.get('proposedArea') ?? '') || undefined,
			categories: String(form.get('categories') ?? '').split(',').map((value) => value.trim()).filter(Boolean),
			experience: String(form.get('experience') ?? '') || undefined, consentAccepted: form.get('consentAccepted') === 'on'
		});
		return result.ok ? { submitted: true, ...result.data } : fail(result.status, { error: result.data.message ?? 'Application could not be submitted.' });
	}
};
