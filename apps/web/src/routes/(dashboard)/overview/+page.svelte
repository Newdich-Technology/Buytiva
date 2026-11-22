<script lang="ts">
  let { data } = $props();
  let currentRole = $derived(data.user?.currentRole ?? data.roles?.[0] ?? 'CUSTOMER');
  const roleCopy: Record<string, { title: string; description: string; cards: string[] }> = {
    CUSTOMER: { title: 'Your next list starts here.', description: 'Build a shopping list and find procurers serving your delivery area.', cards: ['Create an account', 'Add a delivery destination', 'Browse eligible procurers'] },
    PROCURER: { title: 'Your work, in one place.', description: 'Manage your application and prepare your service profile.', cards: ['Application status', 'Profile verification', 'Service area setup'] },
    ADMIN: { title: 'A clear view of the work.', description: 'Review only the tasks your account permissions allow.', cards: ['Procurer applications', 'Support conversations', 'Order review'] },
    SUPER_ADMIN: { title: 'Platform oversight.', description: 'Manage staff access and review the platform audit trail.', cards: ['Team access', 'Application review', 'Audit log'] }
  };
  let content = $derived(roleCopy[currentRole] ?? roleCopy.CUSTOMER);
</script>

<svelte:head><title>Overview | Buytiva</title></svelte:head>
<section class="overview" aria-labelledby="overview-title">
  <p class="eyebrow">{currentRole.replace('_', ' ')} workspace</p>
  <h1 id="overview-title">{content.title}</h1>
  <p class="intro">{content.description}</p>
  <div class="cards">{#each content.cards as card, index}<article><span class="count">0{index + 1}</span><h2>{card}</h2><p>Available when the related service is enabled for your account.</p></article>{/each}</div>
  {#if currentRole === 'PROCURER'}<a class="primary" href="/application">View my application</a>{/if}
  {#if currentRole === 'ADMIN' && data.user?.permissions?.includes('procurerApplication.read')}<a class="primary" href="/procurerApplications">Review applications</a>{/if}
  {#if currentRole === 'SUPER_ADMIN'}<a class="primary" href="/administrators">Manage staff</a>{/if}
</section>

<style>
  .overview { max-width: 980px; }.eyebrow { margin: 0 0 13px; color: var(--action-primary); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }h1 { max-width: 760px; margin: 0; font: 700 clamp(36px, 6vw, 62px)/1 'Space Grotesk', sans-serif; letter-spacing: -.06em; }.intro { max-width: 610px; margin: 17px 0 34px; color: var(--text-secondary); font-size: 17px; line-height: 1.6; }.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }.cards article { min-height: 190px; padding: 20px; border: 1px solid var(--border-default); border-radius: 18px; background: var(--background-surface); }.count { color: var(--action-primary); font: 700 12px 'Space Grotesk', sans-serif; }.cards h2 { margin: 27px 0 8px; font: 700 19px 'Space Grotesk', sans-serif; }.cards p { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.5; }.primary { display: inline-flex; min-height: 50px; align-items: center; margin-top: 24px; padding: 0 18px; border-radius: 8px; color: var(--action-on-primary); background: var(--action-primary); text-decoration: none; font-weight: 700; }
  @media (max-width: 760px) { .cards { grid-template-columns: 1fr; }.cards article { min-height: 140px; }.cards h2 { margin-top: 17px; } }
</style>
