<script lang="ts">
	import '../lib/styles/app.css';
	import SiteHeader from '../lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '../lib/components/layout/SiteFooter.svelte';
	import CookieConsent from '../lib/components/layout/CookieConsent.svelte';
	let { children, data } = $props();
</script>

<svelte:head><meta name="author" content="Oluwayemi Oyinlola" /></svelte:head>
<div id="top" class="application-shell"><SiteHeader user={data.user} /><div class="route-content">{@render children()}</div><SiteFooter /><CookieConsent /></div>

<style>
	.application-shell{display:flex;min-height:100vh;flex-direction:column;background:var(--background-canvas)}.route-content{flex:1;min-width:0}
</style>
