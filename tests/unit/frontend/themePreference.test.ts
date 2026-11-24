import { describe, expect, it } from 'vitest';
import { COOKIE_PREFERENCES_STORAGE_KEY } from '../../../apps/web/src/lib/constants/cookieConsent.js';
import { saveCookiePreferences } from '../../../apps/web/src/lib/utils/cookiePreferences.js';
import { readThemePreference, resolveThemePreference, saveThemePreference } from '../../../apps/web/src/lib/utils/themePreference.js';

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

describe('theme preference storage', () => {
	it('keeps an explicit theme when optional functional storage is declined', () => {
		const storage = createMemoryStorage();
		saveThemePreference(storage, 'light');
		saveCookiePreferences(storage, { functional: false, analytics: false, marketing: false });
		expect(readThemePreference(storage)).toBe('light');
		expect(storage.getItem(COOKIE_PREFERENCES_STORAGE_KEY)).not.toBeNull();
	});

	it('uses the system only when no explicit preference is set', () => {
		const storage = createMemoryStorage();
		expect(readThemePreference(storage)).toBeNull();
		expect(resolveThemePreference('system', true)).toBe('dark');
		saveThemePreference(storage, 'light');
		expect(resolveThemePreference(readThemePreference(storage) ?? 'system', true)).toBe('light');
	});
});
