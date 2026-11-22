import { describe, expect, it } from 'vitest';
import { COOKIE_PREFERENCES_STORAGE_KEY } from '../../../apps/web/src/lib/constants/cookieConsent.js';
import { hasFunctionalStorageConsent, parseCookiePreferenceRecord, readCookiePreferences, saveCookiePreferences } from '../../../apps/web/src/lib/utils/cookiePreferences.js';

function createMemoryStorage(): Storage {
	const values = new Map<string, string>();
	return {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value),
		removeItem: (key) => values.delete(key),
		clear: () => values.clear(),
		key: (index) => [...values.keys()][index] ?? null,
		get length() { return values.size; }
	} as Storage;
}

describe('cookie preference storage', () => {
	it('stores explicit choices and always keeps essential preferences enabled', () => {
		const storage = createMemoryStorage();
		const saved = saveCookiePreferences(storage, { functional: true, analytics: false, marketing: false });
		expect(saved.essential).toBe(true);
		expect(readCookiePreferences(storage)).toEqual(saved);
		expect(hasFunctionalStorageConsent(storage)).toBe(true);
		expect(storage.getItem(COOKIE_PREFERENCES_STORAGE_KEY)).toContain('"analytics":false');
	});

	it('rejects malformed, expired-version, and invalid-date preference records', () => {
		expect(parseCookiePreferenceRecord('{')).toBeNull();
		expect(parseCookiePreferenceRecord(JSON.stringify({ version: 0, essential: true }))).toBeNull();
		expect(parseCookiePreferenceRecord(JSON.stringify({ version: 1, essential: true, functional: true, analytics: false, marketing: false, updatedAt: 'invalid' }))).toBeNull();
	});
});
