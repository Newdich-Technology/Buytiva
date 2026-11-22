<script lang="ts">
	import { onMount } from 'svelte';
	import { COOKIE_PREFERENCE_CATEGORIES, COOKIE_PREFERENCES_UPDATED_EVENT, OPEN_COOKIE_PREFERENCES_EVENT, THEME_PREFERENCE_STORAGE_KEY } from '../../constants/cookieConsent.js';
	import type { CookiePreferenceRecord, CookiePreferenceSelection } from '../../constants/cookieConsent.js';
	import { readCookiePreferences, saveCookiePreferences } from '../../utils/cookiePreferences.js';
	let bannerVisible = $state(false);
	let dialog: HTMLDialogElement | undefined = $state();
	let message = $state('');
	let selection = $state<CookiePreferenceSelection>({ functional: false, analytics: false, marketing: false });
	let messageTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		const openSettings = () => openPreferences();
		window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openSettings);
		try {
			const saved = readCookiePreferences(localStorage);
			if (!saved) {
				localStorage.removeItem(THEME_PREFERENCE_STORAGE_KEY);
				bannerVisible = true;
			} else selection = toSelection(saved);
		} catch {
			bannerVisible = true;
		}
		return () => {
			window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openSettings);
			if (messageTimer) clearTimeout(messageTimer);
		};
	});

	function openPreferences() {
		try {
			const saved = readCookiePreferences(localStorage);
			if (saved) selection = toSelection(saved);
			dialog?.showModal();
		} catch {
			message = 'Cookie preferences are unavailable because browser storage is blocked.';
		}
	}

	function saveSelection(next: CookiePreferenceSelection) {
		try {
			saveCookiePreferences(localStorage, next);
			window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_UPDATED_EVENT));
			selection = next;
			bannerVisible = false;
			showMessage('Your cookie preferences are saved.');
			if (dialog?.open) dialog.close();
			if (!next.functional) localStorage.removeItem(THEME_PREFERENCE_STORAGE_KEY);
		} catch {
			showMessage('Your browser could not save this choice. Please check its storage settings.');
		}
	}

	function showMessage(nextMessage: string) {
		message = nextMessage;
		if (messageTimer) clearTimeout(messageTimer);
		messageTimer = setTimeout(() => message = '', 4000);
	}

	function toSelection(record: CookiePreferenceRecord): CookiePreferenceSelection {
		return { functional: record.functional, analytics: record.analytics, marketing: record.marketing };
	}
</script>

{#if bannerVisible}<aside class="consent-banner" aria-label="Cookie preferences">
	<div><p class="eyebrow">Your privacy choices</p><h2>Choose your browser storage</h2><p>Buytiva uses required sign-in storage. Optional analytics and marketing trackers are not active. Functional storage can remember your theme.</p></div>
	<div class="banner-actions"><button class="secondary" onclick={() => saveSelection({ functional: false, analytics: false, marketing: false })}>Reject optional</button><button class="secondary" onclick={openPreferences}>Customize</button><button class="primary" onclick={() => saveSelection({ functional: true, analytics: true, marketing: true })}>Accept all</button></div>
</aside>{/if}
{#if message}<p class="consent-message" role="status">{message}</p>{/if}
<dialog bind:this={dialog} class="consent-dialog" aria-labelledby="consent-title">
	<div class="dialog-heading"><div><p class="eyebrow">Your privacy choices</p><h2 id="consent-title">Cookie preferences</h2></div><button class="close" type="button" aria-label="Close preferences" onclick={() => dialog?.close()}>×</button></div>
	<p class="dialog-intro">Required sign-in and security storage is always on. Choose whether Buytiva may remember functional settings or use optional trackers. No analytics or marketing trackers are currently enabled.</p>
	<div class="preference-row"><div><strong>Strictly necessary</strong><p>Sign-in, session security, and saving your consent choice.</p></div><span class="always-on">Always on</span></div>
	{#each COOKIE_PREFERENCE_CATEGORIES as category (category.key)}<label class="preference-row"><div><strong>{category.label}</strong><p>{category.detail}</p></div><input type="checkbox" bind:checked={selection[category.key]} aria-label={category.label} /></label>{/each}
	<div class="dialog-actions"><button class="secondary" onclick={() => saveSelection({ functional: false, analytics: false, marketing: false })}>Reject optional</button><button class="secondary" onclick={() => saveSelection(selection)}>Save choices</button><button class="primary" onclick={() => saveSelection({ functional: true, analytics: true, marketing: true })}>Accept all</button></div>
</dialog>

<style>
	.consent-banner{position:fixed;right:20px;bottom:20px;z-index:80;display:grid;width:min(960px,calc(100% - 40px));grid-template-columns:1fr auto;align-items:center;gap:24px;padding:22px 24px;border:1px solid var(--border-strong);border-radius:20px;color:var(--text-primary);background:var(--background-surface);box-shadow:var(--shadow-overlay)}.eyebrow{margin:0 0 7px;color:var(--action-primary);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.consent-banner h2,.consent-dialog h2{margin:0;font:700 24px/1.1 'Space Grotesk',sans-serif;letter-spacing:-.04em}.consent-banner p:not(.eyebrow),.dialog-intro,.preference-row p{margin:8px 0 0;color:var(--text-secondary);font-size:13px;line-height:1.5}.banner-actions,.dialog-actions{display:flex;flex-wrap:wrap;gap:9px}.consent-banner button,.consent-dialog button{min-height:44px;padding:0 14px;border:1px solid var(--border-strong);border-radius:999px;color:var(--text-primary);background:var(--background-surface);font:inherit;font-size:12px;font-weight:750;cursor:pointer}.consent-banner button.primary,.consent-dialog button.primary{border-color:var(--action-primary);color:var(--action-on-primary);background:var(--action-primary)}.consent-banner button:focus-visible,.consent-dialog button:focus-visible,.consent-dialog input:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}.consent-message{position:fixed;right:20px;bottom:18px;z-index:70;padding:12px 16px;border-radius:12px;color:var(--text-primary);background:var(--background-surface);box-shadow:var(--shadow-overlay)}.consent-dialog{width:min(620px,calc(100% - 28px));max-height:min(85vh,760px);padding:26px;border:1px solid var(--border-strong);border-radius:22px;color:var(--text-primary);background:var(--background-surface);box-shadow:var(--shadow-overlay)}.consent-dialog::backdrop{background:var(--overlay-scrim)}.dialog-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.consent-dialog .close{width:42px;padding:0;border-radius:50%;font-size:24px}.dialog-intro{margin:14px 0 20px}.preference-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 0;border-top:1px solid var(--border-default)}.preference-row strong{font-size:14px}.preference-row p{max-width:470px}.preference-row input{width:20px;height:20px;flex:0 0 auto;accent-color:var(--action-primary)}.always-on{color:var(--text-muted);font-size:12px;font-weight:700}.dialog-actions{justify-content:flex-end;margin-top:20px}.consent-dialog button{font-size:13px}
	@media(max-width:760px){.consent-banner{right:10px;bottom:10px;width:calc(100% - 20px);grid-template-columns:1fr;gap:13px;padding:18px;border-radius:18px}.banner-actions{display:grid;grid-template-columns:1fr 1fr}.banner-actions .primary{grid-column:1/-1}.consent-banner h2,.consent-dialog h2{font-size:21px}.consent-dialog{padding:20px}.dialog-actions{display:grid;grid-template-columns:1fr 1fr}.dialog-actions .primary{grid-column:1/-1}.preference-row{align-items:flex-start}}
</style>
