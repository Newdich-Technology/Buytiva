import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AUTH_ROUTES, AUTH_WEB_PATHS } from '../../lib/constants/auth.js';
import { clearAuthSession, getAuthSession, requestAuthApi, setAuthSession } from '../../lib/auth/server.js';
import type { AuthSession } from '../../lib/auth/server.js';

export const load: LayoutServerLoad = async ({ cookies, fetch, url }) => {
	const savedSession = getAuthSession(cookies);
	if (!savedSession) throw redirect(303, '/login');
	if (url.pathname === AUTH_WEB_PATHS.changePassword) return { user: savedSession.user, roles: savedSession.user.roles };
	let session: AuthSession = savedSession;
	let currentUser = await requestAuthApi(fetch, AUTH_ROUTES.currentUser, 'GET', undefined, session.accessToken);
	if (!currentUser.ok) {
		const refreshed = await requestAuthApi(fetch, AUTH_ROUTES.refresh, 'POST', { refreshToken: session.refreshToken });
		if (!refreshed.ok) {
			clearAuthSession(cookies);
			throw redirect(303, '/login');
		}
		session = refreshed.data;
		setAuthSession(cookies, session);
		currentUser = await requestAuthApi(fetch, AUTH_ROUTES.currentUser, 'GET', undefined, session.accessToken);
	}
	if (!currentUser.ok) {
		clearAuthSession(cookies);
		throw redirect(303, '/login');
	}
	return { user: currentUser.data, roles: session.user.roles };
};
