<script lang="ts">
	import BuytivaLordicon from '../../lib/components/design/BuytivaLordicon.svelte';
	import PolicyNotice from '../../lib/components/marketing/PolicyNotice.svelte';
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
</script>

<svelte:head><title>Accessibility | Buytiva</title></svelte:head>
<PublicPageFrame eyebrow="Accessibility" title="Access should be part of the experience." description="Buytiva is being designed for keyboard, screen-reader, reduced-motion and small-screen use.">
	<PolicyNotice documentName="Buytiva accessibility statement" summary="A public accessibility commitment and contact process are awaiting review and approved content." />
	<section class="accessibility-practices"><p class="section-label">Design practices in this release</p><h2>Small details make every task easier.</h2><div class="practice-grid"><article><span>01</span><h3>Keyboard and focus</h3><p>Primary links, buttons and form fields use visible focus styles so keyboard users can follow the current control.</p></article><article><span>02</span><h3>Reduced motion</h3><p>Decorative motion is reduced when the device requests reduced motion, and core information remains available without animation.</p></article><article><span>03</span><h3>Responsive reading</h3><p>Public pages reflow at small widths and use flexible type sizes instead of requiring a fixed desktop canvas.</p></article><article><span>04</span><h3>Clear error recovery</h3><p>Errors use plain language and a next step where the application has a real recovery action.</p></article></div><p class="review-note">These implementation practices do not constitute an accessibility certification. The formal statement and support process still require review.</p><a href="/support">View current help options <BuytivaLordicon name="directions" width={20} height={20} animationState="hover-slide" /></a></section>
</PublicPageFrame>

<style>
	.accessibility-practices{max-width:1000px;margin-top:clamp(52px,8vw,100px)}.section-label{margin:0 0 12px;color:var(--action-primary);font-size:11px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.accessibility-practices h2{max-width:650px;margin:0;font:750 clamp(30px,4.4vw,48px)/1.05 'Space Grotesk',sans-serif;letter-spacing:-.05em}.practice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:25px 0}.practice-grid article{padding:21px;border:1px solid var(--border-default);border-radius:18px;background:var(--background-surface)}.practice-grid span{color:var(--action-primary);font-size:11px;font-weight:850}.practice-grid h3{margin:22px 0 8px;font:700 19px 'Space Grotesk',sans-serif}.practice-grid p,.review-note{color:var(--text-secondary);font-size:14px;line-height:1.65}.accessibility-practices>a{color:var(--action-primary);font-weight:800;text-underline-offset:4px}
	@media(max-width:620px){.practice-grid{grid-template-columns:1fr}.practice-grid article{padding:18px}.practice-grid h3{margin-top:15px}}
</style>
