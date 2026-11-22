<script lang="ts">
	import { onMount } from 'svelte';
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
	import { COOKIE_PREFERENCES_UPDATED_EVENT, COOKIE_PREFERENCE_CATEGORIES, OPEN_COOKIE_PREFERENCES_EVENT } from '../../lib/constants/cookieConsent.js';
	import type { CookiePreferenceRecord } from '../../lib/constants/cookieConsent.js';
	import { readCookiePreferences } from '../../lib/utils/cookiePreferences.js';
	let preferences = $state<CookiePreferenceRecord | null>(null);

	onMount(() => {
		const updatePreferences = () => { preferences = readCookiePreferences(localStorage); };
		updatePreferences();
		window.addEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, updatePreferences);
		return () => window.removeEventListener(COOKIE_PREFERENCES_UPDATED_EVENT, updatePreferences);
	});

	function openPreferences() { window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT)); }
</script>

<svelte:head><title>Cookies and privacy choices | Buytiva</title></svelte:head>
<PublicPageFrame eyebrow="Cookies and browser storage" title="Choose what Buytiva may remember." description="Your choice is versioned and can be changed at any time from this page.">
	<section class="cookie-page"><p>Required sign-in and security storage is always on. Your consent record is saved in browser storage so Buytiva can remember your choice. Functional storage controls whether your selected theme is remembered.</p><div class="category-list"><article><strong>Strictly necessary</strong><span>Always on</span><p>Sign-in, session security, and remembering your consent choice.</p></article>{#each COOKIE_PREFERENCE_CATEGORIES as category (category.key)}<article><strong>{category.label}</strong><span>{preferences?.[category.key] ? 'Allowed' : 'Not allowed'}</span><p>{category.detail}</p></article>{/each}</div><p class="active-note">No analytics or marketing trackers are currently installed. Allowing those categories does not activate a tracker that is not present.</p>{#if preferences}<p class="saved-note">Last saved {new Date(preferences.updatedAt).toLocaleString()} · Consent version {preferences.version}</p>{:else}<p class="saved-note">You have not saved an optional preference yet.</p>{/if}<button type="button" onclick={openPreferences}>Customize cookie preferences</button></section>
</PublicPageFrame>

<style>
	.cookie-page{max-width:790px;padding:clamp(22px,5vw,42px);border:1px solid var(--border-default);border-radius:24px;background:var(--background-surface)}.cookie-page>p{color:var(--text-secondary);font-size:15px;line-height:1.7}.category-list{margin:25px 0;border-top:1px solid var(--border-default)}.category-list article{display:grid;grid-template-columns:1fr auto;gap:4px 18px;padding:16px 0;border-bottom:1px solid var(--border-default)}.category-list strong{font-size:14px}.category-list span{color:var(--text-muted);font-size:12px;font-weight:750}.category-list p{grid-column:1/-1;margin:0;color:var(--text-secondary);font-size:13px;line-height:1.5}.active-note,.saved-note{font-size:13px!important}.saved-note{color:var(--text-muted)!important}.cookie-page button{min-height:48px;padding:0 18px;border:0;border-radius:999px;color:var(--action-on-primary);background:var(--action-primary);font:inherit;font-size:13px;font-weight:750;cursor:pointer}
</style>
