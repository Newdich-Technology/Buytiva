<script lang="ts">
  import EditorialHero from '../lib/components/marketing/EditorialHero.svelte';
  import HowItWorks from '../lib/components/marketing/HowItWorks.svelte';
  import ProcurerSection from '../lib/components/marketing/ProcurerSection.svelte';
  import QuestionsAndDownload from '../lib/components/marketing/QuestionsAndDownload.svelte';
</script>

<svelte:head>
  <title>Buytiva — Your list. Someone gets it.</title>
  <meta name="description" content="Make a shopping list, find a verified local procurer and see your quote before you decide to pay." />
  <meta property="og:title" content="Buytiva — Your list. Someone gets it." />
  <meta property="og:description" content="A more thoughtful way to get your everyday shopping done." />
  <meta property="og:image" content="/brand/buytiva-og-banner.svg" />
  <meta name="theme-color" content="var(--action-primary)" />
</svelte:head>

<div class="marketing-page">
  <main>
    <EditorialHero />
    <HowItWorks />
    <section class="clarity" aria-labelledby="clarity-title"><div class="clarity-symbol" aria-hidden="true"><span>↗</span><i></i><b>✓</b></div><div><p class="eyebrow">Thoughtful from the first item</p><h2 id="clarity-title">Clear choices.<br /><span>At every step.</span></h2><p>Choose from procurers serving your delivery area. Review a quote with its costs laid out before checkout. Keep your conversations and order updates together.</p><a href="/register">Make your first list <span aria-hidden="true">↗</span></a></div></section>
    <ProcurerSection />
    <QuestionsAndDownload />
  </main>
</div>

<style>
  .marketing-page { background: var(--background-canvas); color: var(--text-primary); }.clarity { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(38px, 9vw, 130px); padding: clamp(75px, 11vw, 145px) clamp(24px, 10vw, 150px); background: var(--background-surface); }.clarity > div:last-child { max-width: 500px; }.eyebrow { color: var(--action-primary); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }.clarity h2 { margin: 16px 0; font: 700 clamp(40px, 5.5vw, 67px)/.98 'Space Grotesk', sans-serif; letter-spacing: -.065em; }.clarity h2 span { color: var(--action-primary); }.clarity p:not(.eyebrow) { color: var(--text-secondary); font-size: 17px; line-height: 1.65; }.clarity a { display: inline-flex; align-items: center; justify-content: space-between; gap: 30px; min-height: 53px; margin-top: 13px; padding: 0 18px; border-radius: 8px; color: var(--text-inverse); background: var(--action-primary); text-decoration: none; font-weight: 700; }.clarity-symbol { position: relative; display: grid; min-height: 330px; place-items: center; overflow: hidden; border-radius: 50% 45% 42% 50%; background: #e8f1ff; }.clarity-symbol i { width: 230px; height: 230px; border: 3px solid var(--action-primary); border-radius: 48% 52% 50% 47%; transform: rotate(28deg); }.clarity-symbol span, .clarity-symbol b { position: absolute; display: grid; width: 78px; height: 78px; place-items: center; border: 7px solid var(--text-inverse); border-radius: 50%; color: var(--action-secondary); background: var(--accent-orange); font-size: 33px; }.clarity-symbol span { top: 46px; left: 20%; }.clarity-symbol b { right: 16%; bottom: 50px; color: #205328; background: var(--accent-lime); font-size: 23px; }
  @media (max-width: 760px) { .clarity { grid-template-columns: 1fr; gap: 35px; padding: 75px 23px; }.clarity-symbol { min-height: 250px; }.clarity-symbol i { width: 180px; height: 180px; }.clarity-symbol span, .clarity-symbol b { width: 60px; height: 60px; border-width: 5px; }.clarity-symbol span { top: 29px; }.clarity-symbol b { bottom: 30px; } }
</style>
