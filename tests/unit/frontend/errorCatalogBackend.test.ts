import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BACKEND_ERROR_STATE_MAP, ERROR_CATALOG, resolveBuytivaError } from '../../../apps/web/src/lib/constants/errorCatalog.js';
import { resolveErrorIllustration } from '../../../apps/web/src/lib/constants/errorIllustrations.js';
import { createBuytivaFastifyApplication } from '../../../src/app.js';
import { AppError } from '../../../src/errors/app.error.js';
import { ErrorCode } from '../../../src/enums/errorCode.enum.js';

describe('frontend error contract', () => {
	it('resolves every backend error code to a catalog state', () => {
		for (const code of Object.values(ErrorCode)) {
			const state = resolveBuytivaError(code, 500);
			expect(ERROR_CATALOG[state.id]).toBeDefined();
			expect(BACKEND_ERROR_STATE_MAP[code]).toBe(state.id);
		}
	});

	it('provides fifteen distinct scene symbols in the original illustration asset', () => {
		const scenes = new Set(Object.values(ERROR_CATALOG).map((state) => resolveErrorIllustration(state.illustration)));
		const svg = readFileSync('apps/web/static/illustrations/errors/error_scenes.svg', 'utf8');
		expect(scenes.size).toBeGreaterThanOrEqual(15);
		for (const scene of scenes) expect(svg).toContain(`id="${scene}"`);
	});

	it('uses stable backend codes before generic HTTP status fallbacks', () => {
		expect(resolveBuytivaError('EMAIL_NOT_VERIFIED', 401).id).toBe('email_verification_required');
		expect(resolveBuytivaError('MFA_REQUIRED', 401).id).toBe('mfa_required');
		expect(resolveBuytivaError('RATE_LIMITED', 429).id).toBe('rate_limited');
	});

	it('renders the backend serialized error with the matching frontend state', async () => {
		const app = createBuytivaFastifyApplication();
		app.get('/api/v1/frontend-error-contract', () => {
			throw new AppError(ErrorCode.EMAIL_NOT_VERIFIED, 403, 'Email verification is required.');
		});
		const response = await app.inject({ method: 'GET', url: '/api/v1/frontend-error-contract' });
		const backendCode = response.json<{ error: { code: string } }>().error.code;
		expect(response.statusCode).toBe(403);
		expect(resolveBuytivaError(backendCode, response.statusCode).id).toBe('email_verification_required');
		await app.close();
	});
});
