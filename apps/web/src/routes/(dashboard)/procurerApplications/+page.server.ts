import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IDENTITY_API_PATHS } from '../../../lib/constants/auth.js';
import { getAuthSession, requestAuthApi } from '../../../lib/auth/server.js';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	const path = IDENTITY_API_PATHS.adminApplications + (url.searchParams.has('status') ? `?status=${encodeURIComponent(url.searchParams.get('status') ?? '')}` : '');
	const [result, currentUser] = await Promise.all([
		requestAuthApi(fetch, path, 'GET', undefined, session.accessToken),
		requestAuthApi(fetch, '/me', 'GET', undefined, session.accessToken)
	]);
	const roles = currentUser.ok ? currentUser.data.roles as string[] : [];
	const permissions = currentUser.ok ? currentUser.data.permissions as string[] : [];
	return { applications: result.ok ? result.data : [], error: [result, currentUser].find((item) => !item.ok)?.data.message, canReview: roles.includes('SUPER_ADMIN') || permissions.includes('procurerApplication.review') };
};

export const actions: Actions = {
	checks: async ({ request, cookies, fetch }) => sendReviewAction(request, cookies, fetch, (form) => IDENTITY_API_PATHS.recordChecks(String(form.get('applicationId') ?? '')), (form) => ({
		identityEvidenceReference: String(form.get('identityEvidenceReference') ?? ''), complianceEvidenceReference: String(form.get('complianceEvidenceReference') ?? '')
	})),
	requestInformation: async ({ request, cookies, fetch }) => sendReviewAction(request, cookies, fetch, (form) => IDENTITY_API_PATHS.requestInformation(String(form.get('applicationId') ?? ''))),
	approve: async ({ request, cookies, fetch }) => sendReviewAction(request, cookies, fetch, (form) => IDENTITY_API_PATHS.approve(String(form.get('applicationId') ?? ''))),
	reject: async ({ request, cookies, fetch }) => sendReviewAction(request, cookies, fetch, (form) => IDENTITY_API_PATHS.reject(String(form.get('applicationId') ?? '')))
};

async function sendReviewAction(request: Request, cookies: Parameters<PageServerLoad>[0]['cookies'], fetch: typeof globalThis.fetch, pathFor: (form: FormData) => string, extraFor: (form: FormData) => Record<string, string> = () => ({})) {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	const form = await request.formData();
	const result = await requestAuthApi(fetch, pathFor(form), 'POST', { ...extraFor(form), reason: String(form.get('reason') ?? '') }, session.accessToken);
	return result.ok ? { updated: true, message: result.data.status ?? 'Application updated.' } : fail(result.status, { error: result.data.message ?? 'Application review could not be saved.' });
}
