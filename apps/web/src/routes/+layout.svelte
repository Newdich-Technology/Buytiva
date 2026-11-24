<script lang="ts">
	import '../lib/styles/app.css';
	import SiteHeader from '../lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '../lib/components/layout/SiteFooter.svelte';
	import CookieConsent from '../lib/components/layout/CookieConsent.svelte';
	let { children, data } = $props();
</script>

<svelte:head><meta name="author" content="Oluwayemi Oyinlola" /></svelte:head>
<div id="top" class="application-shell"><a class="skip-link" href="#route-content">Skip to page content</a><SiteHeader user={data.user} /><div id="route-content" class="route-content" tabindex="-1">{@render children()}</div><SiteFooter /><CookieConsent /></div>

<style>
	.application-shell{display:flex;min-height:100vh;flex-direction:column;background:var(--background-canvas)}.route-content{flex:1;min-width:0}.skip-link{position:fixed;z-index:1000;top:-80px;left:16px;padding:12px 18px;border-radius:8px;color:var(--action-on-primary);background:var(--action-primary);font-weight:700;text-decoration:none}.skip-link:focus{top:12px;outline:3px solid var(--focus-ring);outline-offset:3px}
</style>
