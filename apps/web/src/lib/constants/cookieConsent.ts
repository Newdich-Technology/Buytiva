export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_PREFERENCES_STORAGE_KEY = 'buytiva-cookie-preferences-v1';
export const THEME_PREFERENCE_STORAGE_KEY = 'buytiva-theme';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'buytiva:open-cookie-preferences';
export const COOKIE_PREFERENCES_UPDATED_EVENT = 'buytiva:cookie-preferences-updated';
export const COOKIE_PREFERENCE_CATEGORIES = [
	{ key: 'functional', label: 'Functional storage', detail: 'Optional settings for enhanced interface features.' },
	{ key: 'analytics', label: 'Analytics', detail: 'Optional audience measurement. No analytics service is currently enabled.' },
	{ key: 'marketing', label: 'Marketing', detail: 'Optional campaign measurement. No marketing trackers are currently enabled.' }
] as const;

export interface CookiePreferenceSelection {
	functional: boolean;
	analytics: boolean;
	marketing: boolean;
}

export interface CookiePreferenceRecord extends CookiePreferenceSelection {
	version: number;
	essential: true;
	updatedAt: string;
}
