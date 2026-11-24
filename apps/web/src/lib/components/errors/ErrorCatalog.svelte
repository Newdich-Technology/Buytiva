<script lang="ts">
	import { ERROR_ACTION_LABELS, ERROR_CATALOG } from '../../constants/errorCatalog.js';
	import type { ErrorState } from '../../constants/errorCatalog.js';
	import ThemeIllustration from '../marketing/ThemeIllustration.svelte';
	let { stateId, detail }: { stateId: string; detail?: string } = $props();
	let errorState: ErrorState = $derived(ERROR_CATALOG[stateId] ?? ERROR_CATALOG.server_error);
	let isInline = $derived(['form', 'field', 'inline'].includes(errorState.presentation));
	let recoveryHref = $derived(getRecoveryHref(errorState.primaryAction));
	let recoveryLabel = $derived(ERROR_ACTION_LABELS[errorState.primaryAction] ?? 'Go to Buytiva');

	function getRecoveryHref(action: string): string | null {
		const recoveryPaths: Record<string, string> = {
			login: '/login', role_home: '/overview', go_home: '/', check_status: '/overview',
			request_invitation: '/support', contact_support: '/support', review_quote: '/support',
			check_payment: '/support', view_fund_status: '/support', view_upload_status: '/support',
			change_area: '/coverage', track_application: '/application/status', view_application: '/application/status',
			wait: '/', verify_email: '/verifyEmail', change_password: '/changePassword', add_item: '/register'
		};
		return recoveryPaths[action] ?? null;
	}

	function runRecoveryAction() {
		if (errorState.primaryAction === 'fix_fields') {
			const field = document.querySelector<HTMLElement>('[aria-invalid="true"], :invalid');
			if (field) { field.focus(); field.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
		}
		if (errorState.primaryAction === 'choose_file') {
			const input = document.querySelector<HTMLInputElement>('input[type="file"]');
			if (input) { input.click(); return; }
		}
		if (errorState.primaryAction === 'go_back' && history.length > 1) { history.back(); return; }
		window.location.reload();
	}
</script>

{#if isInline}
	<section class="error-inline" role="alert" aria-labelledby="error-title"><span class="inline-mark" aria-hidden="true">!</span><div><p class="status">{errorState.statusLabel}</p><h2 id="error-title">{errorState.title}</h2><p>{detail ?? errorState.body}</p>{#if ['fix_fields', 'choose_file'].includes(errorState.primaryAction)}<button onclick={runRecoveryAction}>{recoveryLabel}</button>{:else if recoveryHref}<a href={recoveryHref}>{recoveryLabel}</a>{/if}</div></section>
{:else}
	<section class="error-card" class:serious={errorState.severity === 'critical'} role="alert" aria-labelledby="error-title"><ThemeIllustration class="illustration" scene="list" alt="A customer and local procurer review a shopping list in their neighborhood." /><div><p class="status">{errorState.statusLabel}</p><h1 id="error-title">{errorState.title}</h1><p>{detail ?? errorState.body}</p>{#if ['retry_safe', 'reconnect', 'go_back'].includes(errorState.primaryAction)}<button onclick={runRecoveryAction}>{recoveryLabel}</button>{:else if recoveryHref}<a href={recoveryHref}>{recoveryLabel}</a>{:else}<a href="/">Back to Buytiva</a>{/if}</div></section>
{/if}

<style>
	.error-card{display:grid;grid-template-columns:minmax(340px,1.1fr) minmax(320px,.9fr);align-items:center;gap:clamp(24px,5vw,78px);width:min(1400px,calc(100% - 48px));min-height:min(76vh,760px);padding:clamp(30px,6vw,92px);margin:4vh auto;border:1px solid var(--border-default);border-radius:34px;color:var(--text-primary);background:var(--background-surface);overflow:hidden}.error-card :global(.illustration){width:100%;max-height:min(64vh,560px);overflow:hidden}.status{margin:0 0 12px;color:var(--action-primary);font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.error-card h1{max-width:620px;margin:0;font:750 clamp(42px,6.2vw,82px)/.96 var(--font-display),serif;letter-spacing:-.065em}.error-card p:not(.status){max-width:560px;color:var(--text-secondary);font-size:clamp(16px,1.5vw,20px);line-height:1.6}.error-card button,.error-card a,.error-inline button,.error-inline a{display:inline-flex;min-height:48px;align-items:center;margin-top:8px;padding:0 19px;border:0;border-radius:999px;color:var(--action-on-primary);background:var(--action-primary);font:inherit;font-weight:750;text-decoration:none;cursor:pointer}.error-card button:focus-visible,.error-card a:focus-visible,.error-inline button:focus-visible,.error-inline a:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}.serious{border-color:var(--status-error-foreground)}.serious .status{color:var(--status-error-foreground)}
	.error-inline{display:grid;grid-template-columns:38px 1fr;gap:13px;max-width:760px;padding:16px;border:1px solid var(--status-error-foreground);border-radius:14px;color:var(--text-primary);background:var(--status-error-surface)}.inline-mark{display:grid;width:32px;height:32px;place-items:center;border-radius:50%;color:var(--status-error-foreground);background:var(--background-surface);font-weight:850}.error-inline .status{margin:0 0 5px;font-size:10px}.error-inline h2{margin:0;font:700 18px/1.2 var(--font-display),serif}.error-inline p:not(.status){margin:7px 0 0;color:var(--text-secondary);font-size:13px;line-height:1.5}.error-inline button,.error-inline a{min-height:38px;padding:0 14px;font-size:12px}
	@media(max-width:760px){.error-card{grid-template-columns:1fr;gap:12px;width:calc(100% - 28px);min-height:0;padding:25px 20px;margin:16px auto;border-radius:24px}.error-card :global(.illustration){max-height:260px}.error-card h1{font-size:clamp(42px,12vw,64px)}.error-card p:not(.status){font-size:16px}}
</style>
