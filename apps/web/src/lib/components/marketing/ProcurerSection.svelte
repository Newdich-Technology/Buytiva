<script>
	import { revealOnScroll } from '../../actions/revealOnScroll.js';
	import ThemeIllustration from './ThemeIllustration.svelte';
</script>

<section class="procurer-section" id="procurers" aria-labelledby="procurer-title">
	<div class="market-scene" data-scroll-reveal="art" use:revealOnScroll aria-hidden="true">
		<ThemeIllustration class="market-art" scene="market" />
		<p>Local knowledge, good things growing</p>
	</div>
	<div class="copy" data-scroll-reveal="copy" use:revealOnScroll>
		<p class="eyebrow">For independent procurers</p>
		<h2 id="procurer-title">Know your streets.<br /><span>Grow your own business.</span></h2>
		<p>Apply to become a Buytiva procurer. Our team reviews every application before an invitation is sent. You choose your approved coverage and see the service fee before accepting a request.</p>
		<a class="apply" href="/apply/procurer">Apply to become a procurer <span aria-hidden="true">↗</span></a>
		<a class="track" href="/application/status">Already applied? Track your application</a>
	</div>
</section>

<style>
	.procurer-section{display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:clamp(40px,8vw,116px);padding:clamp(80px,11vw,145px) clamp(24px,9vw,140px);color:var(--text-primary);background:var(--background-subtle)}
	.copy{max-width:550px}.eyebrow{margin:0;color:var(--action-secondary);font-size:14px;font-weight:750}
	.copy h2{margin:18px 0;font:700 clamp(39px,5.2vw,68px)/.98 var(--font-display),serif;letter-spacing:-.065em;text-wrap:balance}
	.copy h2 span{color:var(--action-primary)}.copy p:not(.eyebrow){color:var(--text-secondary);font-size:17px;line-height:1.65}
	.apply{display:inline-flex;align-items:center;justify-content:space-between;gap:26px;min-height:54px;margin-top:13px;padding:0 20px;border-radius:999px;color:var(--action-on-primary);background:var(--action-primary);font-weight:750;text-decoration:none;transition:transform 180ms ease,background-color 180ms ease}
	.apply:hover{transform:translateY(-2px);background:var(--action-primary-hover)}.track{display:block;width:fit-content;margin-top:20px;color:var(--text-primary);font-size:14px;text-underline-offset:5px}
	.market-scene{position:relative;min-height:430px;overflow:hidden;border-radius:42% 20px 20px 20px;background:var(--illustration-hero-ground)}.market-scene :global(.market-art){position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}.market-scene p{position:absolute;left:22px;bottom:18px;margin:0;padding:10px 14px;border:1px solid color-mix(in srgb,var(--illustration-paper) 55%,transparent);border-radius:999px;color:var(--illustration-paper);background:color-mix(in srgb,var(--illustration-route) 88%,transparent);font-size:12px;font-weight:700}

	@media(max-width:800px){.procurer-section{grid-template-columns:1fr;gap:35px;padding-inline:24px}.market-scene{order:2;min-height:340px;border-radius:30% 18px 18px 18px}.copy{order:1}}
	@media(max-width:520px){.procurer-section{padding:65px 20px}.market-scene{min-height:300px}.copy h2{font-size:clamp(38px,10vw,54px)}}
	@media(prefers-reduced-motion:reduce){.apply{transition:none}}
</style>
