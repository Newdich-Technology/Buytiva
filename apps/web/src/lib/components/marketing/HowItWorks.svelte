<script lang="ts">
	import { revealOnScroll } from '../../actions/revealOnScroll.js';
	import BuytivaLottieMark from '../design/BuytivaLottieMark.svelte';
	import ThemeIllustration from './ThemeIllustration.svelte';
</script>

<section class="how" id="how" aria-labelledby="how-title">
	<header class="section-heading" data-scroll-reveal="copy" use:revealOnScroll>
		<p class="eyebrow">A good plan, made simple</p>
		<h2 id="how-title">From list to doorstep,<br /><span>with you all the way.</span></h2>
		<p>Buytiva is designed around a clear handoff: you make the request, choose local help, review the quote and stay connected through delivery.</p>
	</header>
	<div class="journey-scene" data-scroll-reveal="art" use:revealOnScroll>
		<ThemeIllustration class="journey-art" scene="world" />
		<p><span>01</span> Your list leaves home <i aria-hidden="true">→</i> <span>04</span> Your order arrives
		</p>
	</div>
	<ol class="steps" aria-label="The Buytiva shopping journey">
		<li><span class="step-number">01</span><h3><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16-1 5 5-1L20 9l-4-4L5 16Z"/><path d="m14 7 4 4"/></svg>Make your list</h3><p>Add the items you need and choose where you’d like them delivered.</p></li>
		<li><span class="step-number">02</span><h3><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>Meet your local match</h3><p>See approved procurers whose active service areas cover your destination.</p></li>
		<li><span class="step-number">03</span><h3><BuytivaLottieMark label="Quote confirmed"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></BuytivaLottieMark>Agree on the quote</h3><p>Review the complete breakdown and confirm final prices before checkout.</p></li>
		<li><span class="step-number">04</span><h3><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h6l2 2h8v11H4z"/><path d="M8 12h8m-8 4h5"/></svg>Keep in touch</h3><p>Follow order updates, message your procurer and confirm delivery.</p></li>
	</ol>
</section>

<style>
	.how{padding:clamp(82px,11vw,142px) clamp(20px,7vw,110px);background:var(--background-canvas)}
	.section-heading{max-width:820px;margin:0 auto 52px;text-align:center}.eyebrow{margin:0 0 15px;color:var(--action-secondary);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
	.section-heading h2{margin:0;font:500 clamp(42px,6vw,82px)/.98 var(--font-display),serif;letter-spacing:-.045em;text-wrap:balance}.section-heading h2 span{color:var(--action-primary)}
	.section-heading>p:last-child{max-width:620px;margin:20px auto 0;color:var(--text-secondary);font-size:17px;line-height:1.65}
	.journey-scene{position:relative;max-width:1360px;height:clamp(260px,38vw,510px);margin:0 auto 36px;overflow:hidden;background:var(--illustration-hero-ground)}.journey-scene :global(.journey-art){width:100%;height:100%}.journey-scene>p{position:absolute;right:22px;bottom:18px;margin:0;color:var(--text-primary);font-size:12px;font-weight:700}.journey-scene>p span{color:var(--action-secondary);font-variant-numeric:tabular-nums}.journey-scene>p i{padding:0 10px;color:var(--action-primary);font-style:normal}
	.steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));max-width:1360px;padding:0;margin:0 auto;list-style:none}.steps li{position:relative;padding:22px 24px 0 0;border-top:1px solid var(--border-strong)}.steps li::before{position:absolute;top:-4px;left:0;width:7px;height:7px;border-radius:50%;background:var(--action-primary);content:''}.step-number{color:var(--action-secondary);font-size:12px;font-weight:800;letter-spacing:.08em}.steps h3{display:flex;align-items:center;gap:8px;margin:11px 0 7px;font:600 clamp(20px,2vw,27px)/1.12 var(--font-display),serif;letter-spacing:-.02em}.steps h3 :global(svg){width:27px;height:27px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.steps p{max-width:280px;margin:0;color:var(--text-secondary);font-size:14px;line-height:1.6}
	@media(max-width:780px){.how{padding-inline:24px}.section-heading{text-align:left;margin-bottom:32px}.section-heading>p:last-child{margin-left:0}.journey-scene{height:300px;margin-bottom:30px}.steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 18px}.steps li{padding-right:8px}}
	@media(max-width:520px){.how{padding:70px 20px}.section-heading h2{font-size:clamp(38px,11vw,58px)}.section-heading>p:last-child{font-size:15px}.journey-scene{height:235px;margin-inline:-20px}.journey-scene>p{right:12px;bottom:10px;font-size:10px}.journey-scene>p i{padding:0 4px}.steps{gap:24px 12px}.steps li{padding:16px 5px 0 0}.steps h3{font-size:20px}.steps p{font-size:13px}}
	@media(max-width:520px){.journey-scene>p{display:none}}
</style>
