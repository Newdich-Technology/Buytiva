import { COOKIE_CONSENT_VERSION, COOKIE_PREFERENCES_STORAGE_KEY } from '../constants/cookieConsent.js';
import type { CookiePreferenceRecord, CookiePreferenceSelection } from '../constants/cookieConsent.js';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

export function parseCookiePreferenceRecord(value: string | null): CookiePreferenceRecord | null {
	if (!value) return null;
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isCookiePreferenceRecord(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function readCookiePreferences(storage: ReadableStorage): CookiePreferenceRecord | null {
	return parseCookiePreferenceRecord(storage.getItem(COOKIE_PREFERENCES_STORAGE_KEY));
}

export function saveCookiePreferences(storage: WritableStorage, selection: CookiePreferenceSelection, updatedAt = new Date()): CookiePreferenceRecord {
	const record: CookiePreferenceRecord = { ...selection, version: COOKIE_CONSENT_VERSION, essential: true, updatedAt: updatedAt.toISOString() };
	storage.setItem(COOKIE_PREFERENCES_STORAGE_KEY, JSON.stringify(record));
	return record;
}

export function hasFunctionalStorageConsent(storage: ReadableStorage): boolean {
	return readCookiePreferences(storage)?.functional === true;
}

function isCookiePreferenceRecord(value: unknown): value is CookiePreferenceRecord {
	if (!value || typeof value !== 'object') return false;
	const record = value as Partial<CookiePreferenceRecord>;
	return record.version === COOKIE_CONSENT_VERSION && record.essential === true &&
		typeof record.functional === 'boolean' && typeof record.analytics === 'boolean' &&
		typeof record.marketing === 'boolean' && typeof record.updatedAt === 'string' &&
		!Number.isNaN(Date.parse(record.updatedAt));
}
