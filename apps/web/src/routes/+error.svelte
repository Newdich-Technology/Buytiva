<script lang="ts">
	import ErrorCatalog from '../lib/components/errors/ErrorCatalog.svelte';
	import { resolveBuytivaError } from '../lib/constants/errorCatalog.js';
	let { error } = $props();
	let status = $derived(error?.status ?? 500);
	let code = $derived(readStableErrorCode(error));
	let stateId = $derived(resolveBuytivaError(code, status).id);
	function readStableErrorCode(value: unknown): string { return typeof value === 'object' && value !== null && 'code' in value && typeof value.code === 'string' ? value.code : ''; }
</script>

<svelte:head><title>Something went wrong | Buytiva</title></svelte:head>
<main class="route-error"><ErrorCatalog {stateId} /></main>
<style>
	.route-error { min-height: 58vh; background: var(--background-canvas); }
</style>
