import { THEME_PREFERENCE_STORAGE_KEY } from '../constants/cookieConsent.js';

export type ThemePreference = 'light' | 'dark';
export type ThemeMode = ThemePreference | 'system';
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readThemePreference(storage: ThemeStorage): ThemePreference | null {
	const value = storage.getItem(THEME_PREFERENCE_STORAGE_KEY);
	return value === 'light' || value === 'dark' ? value : null;
}

export function saveThemePreference(storage: ThemeStorage, mode: ThemeMode): void {
	if (mode === 'system') storage.removeItem(THEME_PREFERENCE_STORAGE_KEY);
	else storage.setItem(THEME_PREFERENCE_STORAGE_KEY, mode);
}

export function resolveThemePreference(mode: ThemeMode, systemPrefersDark: boolean): ThemePreference {
	if (mode !== 'system') return mode;
	return systemPrefersDark ? 'dark' : 'light';
}
