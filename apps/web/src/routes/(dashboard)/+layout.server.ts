import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AUTH_WEB_PATHS } from '../../lib/constants/auth.js';

export const load: LayoutServerLoad = async ({ parent, url }) => {
	const parentData = await parent();
	if (!parentData.user) throw redirect(303, '/login');
	if (parentData.passwordChangeRequired && url.pathname !== AUTH_WEB_PATHS.changePassword) throw redirect(303, AUTH_WEB_PATHS.changePassword);
	return { user: parentData.user, roles: parentData.roles };
};
