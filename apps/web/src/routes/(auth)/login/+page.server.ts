import { fail, redirect } from '@sveltejs/kit';
import { clearAuthSession, getAuthSession, requestAuthApi, setAuthSession } from '../../../lib/auth/server.js';
import { AUTH_ROUTES, AUTH_WEB_PATHS } from '../../../lib/constants/auth.js';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ fetch, cookies }) => {
		const session = getAuthSession(cookies);
		if (session) await requestAuthApi(fetch, AUTH_ROUTES.logout, 'POST', undefined, session.accessToken);
		clearAuthSession(cookies);
		throw redirect(303, '/login');
	},
	default: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const challengeToken = String(form.get('challengeToken') ?? '');
		const code = String(form.get('code') ?? '');
		if (form.get('step') === 'enroll') {
			const result = await requestAuthApi(fetch, AUTH_ROUTES.enrollTotp, 'POST', { challengeToken });
			const passwordChangeRequired = form.get('passwordChangeRequired') === 'true';
			return result.ok ? { challengeToken, enrollmentUri: result.data.authenticatorUri, secret: result.data.secret, passwordChangeRequired } : fail(result.status, { error: result.data.message ?? 'Unable to start MFA setup.', challengeToken, passwordChangeRequired });
		}
		if (form.get('step') === 'verify-enrollment') {
			const result = await requestAuthApi(fetch, AUTH_ROUTES.verifyTotp, 'POST', { challengeToken, code, deviceLabel: 'BUYTIVA Web' });
			if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Unable to verify MFA.', challengeToken, enrollmentUri: String(form.get('enrollmentUri') ?? ''), secret: String(form.get('secret') ?? ''), passwordChangeRequired: form.get('passwordChangeRequired') === 'true' });
			setAuthSession(cookies, result.data.session);
			throw redirect(303, form.get('passwordChangeRequired') === 'true' ? AUTH_WEB_PATHS.changePassword : AUTH_WEB_PATHS.dashboardOverview);
		}
		if (challengeToken) {
			const result = await requestAuthApi(fetch, AUTH_ROUTES.completeLogin, 'POST', { challengeToken, code, deviceLabel: 'BUYTIVA Web' });
			if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Authentication failed.', challengeToken, passwordChangeRequired: form.get('passwordChangeRequired') === 'true' });
			if (result.data.authenticationRequired) return { challengeToken: result.data.challengeToken, challengeType: result.data.challengeType, passwordChangeRequired: result.data.passwordChangeRequired };
			setAuthSession(cookies, result.data.session);
			throw redirect(303, form.get('passwordChangeRequired') === 'true' ? AUTH_WEB_PATHS.changePassword : AUTH_WEB_PATHS.dashboardOverview);
		}
		const result = await requestAuthApi(fetch, AUTH_ROUTES.login, 'POST', {
			email: String(form.get('email') ?? ''), password: String(form.get('password') ?? ''), deviceLabel: 'BUYTIVA Web'
		});
		if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Unable to sign in.' });
		if (result.data.authenticationRequired) return { challengeToken: result.data.challengeToken, challengeType: result.data.challengeType, passwordChangeRequired: result.data.passwordChangeRequired };
		setAuthSession(cookies, result.data.session);
		throw redirect(303, '/dashboard/overview');
	}
};
