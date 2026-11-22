import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { IDENTITY_API_PATHS } from '../../../lib/constants/auth.js';
import { getAuthSession, requestAuthApi } from '../../../lib/auth/server.js';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	if (!session.user.roles.includes('PROCURER')) throw redirect(303, '/dashboard/overview');
	const result = await requestAuthApi(fetch, IDENTITY_API_PATHS.ownApplication, 'GET', undefined, session.accessToken);
	return { application: result.ok ? result.data : null, error: result.ok ? null : result.data.message };
};
