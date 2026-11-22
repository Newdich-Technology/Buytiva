import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { STAFF_API_PATHS } from '../../../lib/constants/auth.js';
import { getAuthSession, requestAuthApi } from '../../../lib/auth/server.js';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	if (!session.user.roles.includes('SUPER_ADMIN')) throw redirect(303, '/dashboard/overview');
	const [staff, permissions, audit] = await Promise.all([
		requestAuthApi(fetch, STAFF_API_PATHS.staff, 'GET', undefined, session.accessToken),
		requestAuthApi(fetch, STAFF_API_PATHS.permissions, 'GET', undefined, session.accessToken),
		requestAuthApi(fetch, STAFF_API_PATHS.auditLogs, 'GET', undefined, session.accessToken)
	]);
	return { staff: staff.ok ? staff.data : [], catalog: permissions.ok ? permissions.data : { codes: [], profiles: {} }, audit: audit.ok ? audit.data : [], error: [staff, permissions, audit].find((result) => !result.ok)?.data.message };
};

export const actions: Actions = {
	invite: async ({ request, cookies, fetch }) => {
		const session = requireStaffSession(cookies);
		const form = await request.formData();
		const role = String(form.get('role') ?? 'ADMIN');
		const body = { email: String(form.get('email') ?? ''), displayName: String(form.get('displayName') ?? ''), reason: String(form.get('reason') ?? ''), permissionProfile: String(form.get('permissionProfile') ?? '') };
		const path = role === 'SUPER_ADMIN' ? STAFF_API_PATHS.inviteSuperAdmin : STAFF_API_PATHS.inviteAdmin;
		const result = await requestAuthApi(fetch, path, 'POST', role === 'SUPER_ADMIN' ? { email: body.email, displayName: body.displayName, reason: body.reason } : body, session.accessToken);
		return result.ok ? { invited: true } : fail(result.status, { error: result.data.message ?? 'Staff invitation could not be sent.' });
	},
	permissions: async ({ request, cookies, fetch }) => {
		const session = requireStaffSession(cookies);
		const form = await request.formData();
		const permissionCodes = form.getAll('permissionCodes').map(String);
		const result = await requestAuthApi(fetch, STAFF_API_PATHS.permissionsFor(String(form.get('userId') ?? '')), 'PATCH', { permissionCodes, reason: String(form.get('reason') ?? '') }, session.accessToken);
		return result.ok ? { updated: true } : fail(result.status, { error: result.data.message ?? 'Permissions could not be updated.' });
	},
	suspend: async ({ request, cookies, fetch }) => updateStaffAccess(request, cookies, fetch, STAFF_API_PATHS.suspend),
	revoke: async ({ request, cookies, fetch }) => updateStaffAccess(request, cookies, fetch, STAFF_API_PATHS.revoke)
};

function requireStaffSession(cookies: Parameters<PageServerLoad>[0]['cookies']) {
	const session = getAuthSession(cookies);
	if (!session) throw redirect(303, '/login');
	return session;
}

async function updateStaffAccess(request: Request, cookies: Parameters<PageServerLoad>[0]['cookies'], fetch: typeof globalThis.fetch, pathFor: (id: string) => string) {
	const session = requireStaffSession(cookies);
	const form = await request.formData();
	const result = await requestAuthApi(fetch, pathFor(String(form.get('userId') ?? '')), 'POST', { reason: String(form.get('reason') ?? '') }, session.accessToken);
	return result.ok ? { completed: true } : fail(result.status, { error: result.data.message ?? 'Staff action could not be completed.' });
}
