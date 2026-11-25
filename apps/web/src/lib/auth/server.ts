import { normalizeApiError } from './apiError.js';
import { API_BASE_URL } from '$app/env/private';
import type { Cookies } from '@sveltejs/kit';
import { AUTH_API_VERSION, AUTH_FORM_MESSAGES } from '../constants/auth.js';

export const SESSION_COOKIE = 'buytiva_session';

export type AuthSession = {
	accessToken: string;
	refreshToken: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
	user: { id: string; email: string; displayName: string | null; roles: string[]; currentRole: string | null; permissions?: string[] };
};

export async function requestAuthApi(fetcher: typeof fetch, path: string, method: string, body?: unknown, accessToken?: string) {
	const baseUrl = API_BASE_URL;
	if (!baseUrl) return { ok: false, status: 503, data: { message: AUTH_FORM_MESSAGES.serviceUnavailable } };
	let response: Response;
	try {
		response = await fetcher(`${baseUrl.replace(/\/$/, '')}${AUTH_API_VERSION}${path}`, {
		method,
		headers: {
			...(body ? { 'content-type': 'application/json' } : {}),
			...(accessToken ? { authorization: `Bearer ${accessToken}` } : {})
		},
		...(body ? { body: JSON.stringify(body) } : {})
		});
	} catch {
		return { ok: false, status: 503, data: { message: AUTH_FORM_MESSAGES.serviceUnavailable } };
	}
	const data = await response.json().catch(() => ({ message: AUTH_FORM_MESSAGES.invalidResponse }));
	return { ok: response.ok, status: response.status, data: response.ok ? data : normalizeApiError(data) };
}

export function setAuthSession(cookies: Cookies, session: AuthSession) {
	cookies.set(SESSION_COOKIE, JSON.stringify(session), {
		path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'strict',
		expires: new Date(session.refreshTokenExpiresAt)
	});
}

export function getAuthSession(cookies: Cookies): AuthSession | null {
	const value = cookies.get(SESSION_COOKIE);
	if (!value) return null;
	try { return JSON.parse(value) as AuthSession; } catch { return null; }
}

export function clearAuthSession(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
