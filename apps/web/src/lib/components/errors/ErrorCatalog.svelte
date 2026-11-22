<script lang="ts">
	import { ERROR_ACTION_LABELS, ERROR_CATALOG } from '../../constants/errorCatalog.js';
	import type { ErrorState } from '../../constants/errorCatalog.js';
	import { resolveErrorIllustration } from '../../constants/errorIllustrations.js';
	import BuytivaLordicon from '../design/BuytivaLordicon.svelte';
	import '../../styles/error-catalog.css';

	let { stateId, detail }: { stateId: string; detail?: string } = $props();
	let errorState: ErrorState = $derived(ERROR_CATALOG[stateId] ?? ERROR_CATALOG.server_error);
	let artworkKey = $derived(resolveErrorIllustration(errorState.illustration));
	let isInline = $derived(['form', 'field', 'inline'].includes(errorState.presentation));
	let recoveryHref = $derived(getRecoveryHref(errorState.primaryAction));
	let recoveryLabel = $derived(ERROR_ACTION_LABELS[errorState.primaryAction] ?? 'Back to Buytiva');

	function getRecoveryHref(action: string): string | null {
		const paths: Record<string, string> = { login: '/login', role_home: '/overview', go_home: '/', check_status: '/overview', request_invitation: '/support', contact_support: '/support', review_quote: '/support', check_payment: '/support', view_fund_status: '/support', view_upload_status: '/support', change_area: '/coverage', track_application: '/application/status', view_application: '/application/status', wait: '/', verify_email: '/verifyEmail', change_password: '/changePassword', add_item: '/register' };
		return paths[action] ?? null;
	}

	function isInlineButton(action: string) { return action === 'fix_fields' || action === 'choose_file'; }
	function isRouteButton(action: string) { return action === 'retry_safe' || action === 'reconnect' || action === 'go_back'; }
	function runRecoveryAction() {
		if (errorState.primaryAction === 'fix_fields') {
			const field = document.querySelector<HTMLElement>('[aria-invalid="true"], :invalid');
			if (field) { field.focus(); field.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
		}
		if (errorState.primaryAction === 'choose_file') { document.querySelector<HTMLInputElement>('input[type="file"]')?.click(); return; }
		if (errorState.primaryAction === 'go_back' && history.length > 1) { history.back(); return; }
		window.location.reload();
	}
</script>

{#if isInline}
	<section class="error-inline" role="alert" aria-labelledby="inline-error-title">
		<span class="inline-mark"><BuytivaLordicon name="warning" width={24} height={24} animationState="in-reveal" label="Error" /></span>
		<div><p class="error-status">{errorState.statusLabel}</p><h2 id="inline-error-title">{errorState.title}</h2><p>{detail ?? errorState.body}</p>
			{#if isInlineButton(errorState.primaryAction)}<button class="error-action" onclick={runRecoveryAction}>{recoveryLabel}</button>{:else}<a class="error-action" href={recoveryHref ?? '/'}>{recoveryLabel}</a>{/if}
		</div>
	</section>
{:else}
	<section class="error-stage" class:critical={errorState.severity === 'critical'} role="alert" aria-labelledby="error-title">
		<div class="error-art"><svg viewBox="0 0 360 250" role="img" aria-label="Original Buytiva illustration for this error"><use href={`/illustrations/errors/error_scenes.svg#${artworkKey}`} /></svg><span class="error-art-label">Buytiva / recovery route</span></div>
		<div class="error-copy"><p class="error-status">{errorState.statusLabel}</p><h1 id="error-title">{errorState.title}</h1><p>{detail ?? errorState.body}</p>
			{#if isRouteButton(errorState.primaryAction)}<button class="error-action" onclick={runRecoveryAction}>{recoveryLabel} <BuytivaLordicon name="directions" width={21} height={21} animationState="hover-slide" /></button>{:else}<a class="error-action" href={recoveryHref ?? '/'}>{recoveryLabel} <BuytivaLordicon name="directions" width={21} height={21} animationState="hover-slide" /></a>{/if}
		</div>
	</section>
{/if}
