<script lang="ts">
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
	import ThemeIllustration from '../../lib/components/marketing/ThemeIllustration.svelte';
</script>

<svelte:head>
	<title>Delivery coverage | Buytiva</title>
	<meta name="description" content="Learn how Buytiva matches delivery destinations to approved procurer service areas and how to ask about your location." />
</svelte:head>

<PublicPageFrame eyebrow="Delivery coverage" title="Good local help starts with your destination." description="Buytiva is designed to match a delivery location with independent, approved procurers who serve that area. Here is what coverage means and how to get started.">
	<section class="coverage-story" aria-labelledby="coverage-story-title">
		<div class="coverage-art">
			<ThemeIllustration class="coverage-world" scene="match" alt="A customer and an independent procurer meet along a neighborhood shopping route." />
			<div class="destination-note"><span aria-hidden="true">⌖</span><p><b>Destination first</b><br />Local availability shapes the next step.</p></div>
		</div>
		<div class="coverage-copy"><p class="section-label">How matching is intended to work</p><h2 id="coverage-story-title">The delivery address guides the match.</h2><p>When shopping requests are available, you will enter the place where the order should arrive. Buytiva can then show procurers whose approved, active service areas cover that destination.</p><p>Your current location does not have to be the delivery location. You can plan a delivery for a family member or another address, subject to supported areas.</p><a class="page-cta" href="/register">Create an account <span aria-hidden="true">↗</span></a></div>
	</section>

	<section class="availability" aria-labelledby="availability-title">
		<div><p class="section-label">Coverage availability</p><h2 id="availability-title">A public live coverage directory is not available yet.</h2></div>
		<div class="availability-copy"><p>We can’t confirm a specific city or neighborhood from this page today. The live discovery and shopping flow is not enabled in this web release, so we won’t ask you to trust an unverified location list.</p><p>Procurer applications can include a proposed service area. Each application and area is reviewed before it can be approved for service.</p><a href="/apply/procurer">Apply to serve your area <span aria-hidden="true">↗</span></a></div>
	</section>

	<section class="coverage-steps" aria-label="What happens next">
		<article><span>01</span><h3>Share the delivery area</h3><p>Customers choose where the order should go before matching.</p></article>
		<article><span>02</span><h3>See eligible local help</h3><p>Only approved and available service areas should appear.</p></article>
		<article><span>03</span><h3>Review before deciding</h3><p>See the procurer and quote details before accepting an order.</p></article>
	</section>
	<a class="text-link" href="/how-it-works">See how the planned journey works <span aria-hidden="true">↗</span></a>
</PublicPageFrame>

<style>
	.coverage-story{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:center;gap:clamp(28px,6vw,76px);margin-bottom:clamp(72px,10vw,120px)}
	.coverage-art{position:relative;min-height:360px;overflow:hidden;border-radius:34px;background:var(--illustration-hero-ground)}
	.coverage-art :global(.coverage-world){position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
	.destination-note{position:absolute;right:22px;bottom:18px;display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid var(--border-default);border-radius:16px;background:var(--background-surface);box-shadow:0 12px 36px color-mix(in srgb,var(--text-primary) 14%,transparent)}
	.destination-note>span{display:grid;width:38px;height:38px;place-items:center;border-radius:50%;color:var(--action-on-primary);background:var(--action-primary);font-size:22px}
	.destination-note p{margin:0;color:var(--text-secondary);font-size:11px;line-height:1.5}
	.destination-note b{color:var(--text-primary);font-size:12px}
	.section-label{margin:0 0 12px;color:var(--action-primary);font-size:11px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}
	.coverage-copy h2,.availability h2{margin:0;font:750 clamp(30px,4.2vw,48px)/1.02 var(--font-display),serif;letter-spacing:-.055em}
	.coverage-copy>p:not(.section-label),.availability-copy p{color:var(--text-secondary);font-size:15px;line-height:1.75}
	.availability{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,7vw,90px);padding:clamp(26px,5vw,54px);margin-bottom:clamp(65px,9vw,105px);border:1px solid var(--border-default);border-radius:26px;background:var(--background-subtle)}
	.availability h2{font-size:clamp(27px,3.5vw,40px)}
	.availability-copy p:first-child{margin-top:0}
	.availability-copy a,.text-link{display:inline-flex;align-items:center;gap:14px;color:var(--action-primary);font-size:14px;font-weight:800;text-underline-offset:4px}
	.coverage-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:28px}
	.coverage-steps article{min-height:190px;padding:21px;border:1px solid var(--border-default);border-radius:20px;background:var(--background-surface)}
	.coverage-steps article>span{display:grid;width:35px;height:35px;place-items:center;border-radius:12px;color:var(--action-on-primary);background:var(--action-primary);font-size:10px;font-weight:850}
	.coverage-steps h3{margin:21px 0 8px;font:700 19px/1.2 var(--font-display),serif;letter-spacing:-.03em}
	.coverage-steps p{margin:0;color:var(--text-secondary);font-size:13px;line-height:1.6}
	@media(max-width:760px){.coverage-story,.availability{grid-template-columns:1fr}.coverage-story{gap:24px}.coverage-art{min-height:260px}.availability{gap:10px;padding:24px;margin-bottom:64px}.coverage-steps{grid-template-columns:1fr}.coverage-steps article{min-height:150px}.coverage-steps h3{margin-top:15px}}
</style>
