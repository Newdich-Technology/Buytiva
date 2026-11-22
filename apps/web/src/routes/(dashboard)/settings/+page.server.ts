import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '../../../lib/constants/auth.js';
import { clearAuthSession, getAuthSession, requestAuthApi } from '../../../lib/auth/server.js';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	const [mfa, sessions] = await Promise.all([
		requestAuthApi(fetch, AUTH_ROUTES.mfaStatus, 'GET', undefined, session.accessToken),
		requestAuthApi(fetch, AUTH_ROUTES.sessions, 'GET', undefined, session.accessToken)
	]);
	return { mfa: mfa.ok ? mfa.data : null, sessions: sessions.ok ? sessions.data : [], loadError: !mfa.ok || !sessions.ok };
};

export const actions: Actions = {
	revoke: async ({ cookies, fetch, request }) => {
		const session = getAuthSession(cookies);
		if (!session) throw redirect(303, '/login');
		const form = await request.formData();
		const id = String(form.get('sessionId') ?? '');
		const result = await requestAuthApi(fetch, AUTH_ROUTES.session(id), 'DELETE', undefined, session.accessToken);
		return result.ok ? { success: 'Session revoked.' } : fail(result.status, { error: result.data.message ?? 'Session could not be revoked.' });
	},
	logoutAll: async ({ cookies, fetch }) => {
		const session = getAuthSession(cookies);
		if (!session) throw redirect(303, '/login');
		const result = await requestAuthApi(fetch, AUTH_ROUTES.logoutAll, 'POST', undefined, session.accessToken);
		if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Sessions could not be revoked.' });
		clearAuthSession(cookies);
		throw redirect(303, '/login');
	},
	disableMfa: async ({ cookies, fetch, request }) => {
		const session = getAuthSession(cookies);
		if (!session) throw redirect(303, '/login');
		const form = await request.formData();
		const result = await requestAuthApi(fetch, AUTH_ROUTES.disableTotp, 'POST', {
			password: String(form.get('password') ?? ''), code: String(form.get('code') ?? '')
		}, session.accessToken);
		if (!result.ok) return fail(result.status, { error: result.data.message ?? 'Multi-factor authentication could not be disabled.' });
		clearAuthSession(cookies);
		throw redirect(303, '/login');
	}
};
