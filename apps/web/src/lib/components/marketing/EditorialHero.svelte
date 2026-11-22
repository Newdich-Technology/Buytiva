<script lang="ts">
	import BuytivaLordicon from '../design/BuytivaLordicon.svelte';
	import '../../styles/editorial-hero.css';
</script>

<section class="editorial-hero" aria-labelledby="hero-title">
	<div class="hero-grid">
		<div class="hero-copy">
			<p class="hero-eyebrow">A calmer way to get the everyday done</p>
			<h1 id="hero-title"><span>You list it.</span><em>They get it.</em></h1>
			<p class="hero-summary">Create your shopping list, choose a verified procurer near your delivery location, and get your shopping handled.</p>
			<div class="hero-actions">
				<a class="primary" href="/register">Start shopping <BuytivaLordicon name="directions" width={22} height={22} animationState="hover-slide" /></a>
				<a class="secondary" href="/how-it-works">See how it works <BuytivaLordicon name="directions" width={22} height={22} animationState="hover-slide" /></a>
			</div>
			<p class="hero-proof"><BuytivaLordicon name="check" width={23} height={23} trigger="in" loading="lazy" label="" /> The list, quote and next step stay clear.</p>
		</div>
		<div class="hero-visual" aria-label="Buytiva shopping journey illustration">
			<div class="visual-frame">
				<div class="visual-head"><p class="visual-kicker">Buytiva / customer to procurer</p><p class="visual-status">Service journey</p></div>
				<div class="scene-stage">
					<img src="/illustrations/marketing/customer-procurer-scene.svg" alt="A shopping list travels along a route from a customer to a verified local procurer with a parcel ready for delivery." fetchpriority="high" />
					<span class="scene-tag list-tag">Your list</span><span class="scene-tag match-tag">Verified match</span><span class="scene-tag handoff-tag">Ready to deliver</span>
				</div>
				<div class="visual-foot"><span>Local hands · your list</span><span>Scroll to explore <BuytivaLordicon name="vertical" width={18} height={18} animationState="hover-slide" /></span></div>
			</div>
		</div>
	</div>
</section>
