<script lang="ts">
	import BuytivaLordicon from '../lib/components/design/BuytivaLordicon.svelte';
	import EditorialHero from '../lib/components/marketing/EditorialHero.svelte';
	import HowItWorks from '../lib/components/marketing/HowItWorks.svelte';
	import ProcurerSection from '../lib/components/marketing/ProcurerSection.svelte';
	import QuestionsAndDownload from '../lib/components/marketing/QuestionsAndDownload.svelte';
	import ScrollReveal from '../lib/components/motion/ScrollReveal.svelte';
	import '../lib/styles/landing.css';
</script>

<svelte:head>
	<title>Buytiva — You list it. They get it.</title>
	<meta name="description" content="Create your shopping list, choose a verified procurer near your delivery location, and get your shopping handled." />
	<meta property="og:title" content="Buytiva — You list it. They get it." />
	<meta property="og:description" content="A considered way to connect your shopping list with local procuring help." />
	<meta property="og:image" content="/brand/buytiva-og-banner.svg" />
</svelte:head>

<main class="landing-page">
	<EditorialHero />
	<ScrollReveal><HowItWorks /></ScrollReveal>
	<ScrollReveal><section class="clarity-section" aria-labelledby="clarity-title"><div class="clarity-art"><img src="/illustrations/marketing/checkout-clarity.svg" alt="A clear quote shows shopping costs before the customer confirms the next step." loading="lazy" /></div><div class="clarity-copy"><p class="section-eyebrow">Thoughtful from the first item</p><h2 id="clarity-title">Clear choices. <span>At every step.</span></h2><p>Choose from procurers serving your delivery area. Review the request and quote before checkout. Keep messages and updates close to the journey.</p><a class="clarity-link" href="/register">Make your first list <BuytivaLordicon name="directions" width={21} height={21} animationState="hover-slide" /></a></div></section></ScrollReveal>
	<ScrollReveal><ProcurerSection /></ScrollReveal>
	<ScrollReveal><QuestionsAndDownload /></ScrollReveal>
</main>
