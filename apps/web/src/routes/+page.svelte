<script lang="ts">
	import { revealOnScroll } from '../lib/actions/revealOnScroll.js';
	import EditorialHero from '../lib/components/marketing/EditorialHero.svelte';
	import HowItWorks from '../lib/components/marketing/HowItWorks.svelte';
	import ProcurerSection from '../lib/components/marketing/ProcurerSection.svelte';
	import ThemeIllustration from '../lib/components/marketing/ThemeIllustration.svelte';
	import QuestionsAndDownload from '../lib/components/marketing/QuestionsAndDownload.svelte';
</script>

<svelte:head>
	<title>Buytiva — Your list. Someone gets it.</title>
	<meta name="description" content="Make a shopping list, find a verified local procurer and see your quote before you decide to pay." />
	<meta property="og:title" content="Buytiva — Your list. Someone gets it." />
	<meta property="og:description" content="A more thoughtful way to get your everyday shopping done." />
	<meta property="og:image" content="/brand/buytiva-og-banner.svg" />
</svelte:head>

<div class="marketing-page">
	<main>
		<EditorialHero />
		<HowItWorks />
		<section class="clarity" aria-labelledby="clarity-title">
			<div class="list-scene" data-scroll-reveal="art" use:revealOnScroll aria-hidden="true">
				<ThemeIllustration class="list-art" scene="list" />
			</div>
			<div class="clarity-copy" data-scroll-reveal="copy" use:revealOnScroll>
				<p class="eyebrow">Thoughtful from the first item</p>
				<h2 id="clarity-title">Clear choices.<br /><span>At every step.</span></h2>
				<p>Choose from procurers serving your delivery area. Review a quote with its costs laid out before checkout. Keep your conversations and order updates together.</p>
				<a href="/register">Make your first list <span aria-hidden="true">↗</span></a>
			</div>
		</section>
		<ProcurerSection />
		<QuestionsAndDownload />
	</main>
</div>

<style>
	.marketing-page{background:var(--background-canvas);color:var(--text-primary)}
	.clarity{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:clamp(38px,9vw,130px);padding:clamp(75px,11vw,145px) clamp(24px,10vw,150px);background:var(--background-surface)}
	.list-scene{position:relative;min-height:350px;overflow:hidden;border-radius:22px 46% 22px 22px;background:var(--surface-hero)}
	.list-scene :global(.list-art){position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 44%}

	.clarity-copy{max-width:520px}.eyebrow{color:var(--action-secondary);font-size:14px;font-weight:750}
	.clarity h2{margin:16px 0;font:700 clamp(40px,5.5vw,67px)/.98 var(--font-display),serif;letter-spacing:-.065em;text-wrap:balance}.clarity h2 span{color:var(--action-primary)}
	.clarity-copy>p:not(.eyebrow){color:var(--text-secondary);font-size:17px;line-height:1.65}
	.clarity a{display:inline-flex;align-items:center;justify-content:space-between;gap:30px;min-height:53px;margin-top:13px;padding:0 18px;border-radius:999px;color:var(--action-on-primary);background:var(--action-primary);font-weight:750;text-decoration:none}
	@media(max-width:760px){.clarity{grid-template-columns:1fr;gap:30px;padding:70px 23px}.list-scene{min-height:260px}.clarity-copy{max-width:620px}}
</style>
