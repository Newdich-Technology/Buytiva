import type { LayoutServerLoad } from './$types';
import { AUTH_ROUTES } from '../lib/constants/auth.js';
import { clearAuthSession, getAuthSession, requestAuthApi, setAuthSession } from '../lib/auth/server.js';
import type { AuthSession } from '../lib/auth/server.js';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const session = getAuthSession(cookies);
	if (!session) return { user: null, roles: [] as string[] };
	let activeSession: AuthSession = session;
	let result = await requestAuthApi(fetch, AUTH_ROUTES.currentUser, 'GET', undefined, activeSession.accessToken);
	if (!result.ok && result.status === 401) {
		const refresh = await requestAuthApi(fetch, AUTH_ROUTES.refresh, 'POST', { refreshToken: activeSession.refreshToken });
		if (!refresh.ok) {
			clearAuthSession(cookies);
			return { user: null, roles: [] as string[] };
		}
		activeSession = refresh.data;
		setAuthSession(cookies, activeSession);
		result = await requestAuthApi(fetch, AUTH_ROUTES.currentUser, 'GET', undefined, activeSession.accessToken);
	}
	if (result.ok) {
		const user = result.data as AuthSession['user'] & { permissions?: string[]; currentRole?: string | null };
		return { user: { ...user, currentRole: user.currentRole ?? activeSession.user.currentRole }, roles: user.roles };
	}
	if (result.status === 403) return { user: session.user, roles: session.user.roles, passwordChangeRequired: true };
	if (result.status === 401) clearAuthSession(cookies);
	return { user: null, roles: [] as string[] };
};
