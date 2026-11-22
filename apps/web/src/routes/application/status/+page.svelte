<script lang="ts">
  import BuytivaLordicon from '../../../lib/components/design/BuytivaLordicon.svelte';

  let { form } = $props();
  const applicationStatusTitles: Record<string, string> = {
    SUBMITTED: 'Application received',
    EMAIL_VERIFICATION_PENDING: 'Confirm your email',
    UNDER_REVIEW: 'Your application is under review',
    MORE_INFO_REQUIRED: 'A little more information is needed',
    APPROVED: 'Your application is approved',
    REJECTED: 'Your application was not approved',
    WITHDRAWN: 'Application withdrawn',
    EXPIRED: 'Application expired',
    SUSPENDED: 'Application suspended'
  };
  let status = $derived(String(form?.statusResult?.status ?? ''));
  let heading = $derived(applicationStatusTitles[status] ?? 'Application status');
</script>

<svelte:head><title>Application status | BUYTIVA</title></svelte:head>
<main class="application-status">
  <p class="eyebrow">Procurer application</p>
  <h1>Check your application</h1>
  {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
  {#if form?.statusResult}
    <section class="result" class:approved={status === 'APPROVED'} class:rejected={status === 'REJECTED'} aria-labelledby="result-title" aria-live="polite">
      <div class="status-art" class:approved={status === 'APPROVED'} class:rejected={status === 'REJECTED'} aria-hidden="true">
        {#if status === 'APPROVED'}<span class="seal"><BuytivaLordicon name="check" width={38} height={38} animationState="in-reveal" label="Approved" /></span>
        {:else if status === 'REJECTED' || status === 'SUSPENDED'}<span class="paused"><BuytivaLordicon name="warning" width={38} height={38} animationState="in-reveal" label="Attention" /></span>
        {:else if status === 'MORE_INFO_REQUIRED'}<span class="page"><BuytivaLordicon name="search" width={38} height={38} animationState="hover-pinch" label="More information" /></span>
        {:else}<span class="pending-icon"><BuytivaLordicon name="spinner" width={58} height={58} trigger="loop" loading="lazy" animationState="loop-cycle" label="Pending" /></span>{/if}
        <span class="orbit"></span>
      </div>
      <div class="result-copy">
        <p class="status-label">{status.replaceAll('_', ' ')}</p>
        <h2 id="result-title">{heading}</h2>
        <p>Your application reference: <strong>{form.statusResult.reference}</strong></p>
      </div>
    </section>
    <section class="history" aria-label="Application status history">
      <h2>Status history</h2>
      {#each form.statusResult.history as item}
        <article><span class="history-dot"></span><div><strong>{item.status.replaceAll('_', ' ')}</strong><p>{item.reason ?? 'Status updated'}</p></div></article>
      {/each}
    </section>
  {:else if form?.requested}
    <section class="verify-note"><div class="status-art"><span class="pending-icon"><BuytivaLordicon name="spinner" width={58} height={58} trigger="loop" loading="lazy" animationState="loop-cycle" label="Verification pending" /></span></div><h2>Check your inbox</h2><p>Enter the verification code sent to the application email. Challenge ID: <strong>{form.challengeId}</strong></p></section>
    <form method="POST">
      <input type="hidden" name="step" value="verify" />
      <input type="hidden" name="email" value={form.email} />
      <label>Challenge ID <input name="challengeId" value={form.challengeId} required /></label>
      <label>Email code <input name="code" inputmode="numeric" minlength="6" maxlength="6" required /></label>
      <button>View status</button>
    </form>
  {:else}
    <form method="POST">
      <label>Email <input name="email" type="email" required /></label>
      <label>Application reference <input name="reference" required /></label>
      <button>Send verification code</button>
    </form>
  {/if}
</main>

<style>
  .application-status { width: min(850px, calc(100% - 40px)); margin: clamp(35px, 8vw, 90px) auto; color: var(--text-primary); }
  .eyebrow, .status-label { color: var(--action-primary); font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin: 8px 0 28px; font: 800 clamp(34px, 7vw, 60px)/.98 'Space Grotesk', sans-serif; letter-spacing: -.06em; }
  .result { display: grid; grid-template-columns: 240px 1fr; align-items: center; gap: 28px; padding: 26px; border: 1px solid var(--border-default); border-radius: 24px; background: var(--background-surface); }
  .status-art { position: relative; display: grid; width: 220px; height: 180px; place-items: center; overflow: hidden; border-radius: 22px; background: color-mix(in srgb, var(--accent-lilac) 34%, var(--background-surface)); }
  .orbit { position: absolute; width: 170px; height: 120px; border: 2px dashed var(--action-primary); border-radius: 50%; rotate: -18deg; opacity: .5; }
  .seal, .paused, .page { z-index: 1; display: grid; width: 60px; height: 60px; place-items: center; border: 4px solid var(--action-secondary); border-radius: 50%; color: var(--action-secondary); background: var(--accent-lime); font-size: 32px; font-weight: 900; }
  .paused { color: var(--status-error-foreground); background: var(--status-error-surface); }.page { border-radius: 10px; background: var(--accent-orange); }
  .approved .status-art { background: color-mix(in srgb, var(--accent-lime) 35%, var(--background-surface)); }.rejected .status-art { background: var(--status-error-surface); }
  .result-copy h2, .verify-note h2 { margin: 8px 0; font: 750 clamp(24px, 3vw, 36px)/1.08 'Space Grotesk', sans-serif; }
  .result-copy p:not(.status-label), .verify-note p { color: var(--text-secondary); line-height: 1.6; }
  .history { margin-top: 30px; padding: 24px; border: 1px solid var(--border-default); border-radius: 20px; background: var(--background-surface); }
  .history h2 { margin: 0 0 18px; font: 700 22px 'Space Grotesk', sans-serif; }
  .history article { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid var(--border-default); }
  .history-dot { flex: 0 0 11px; width: 11px; height: 11px; margin-top: 5px; border-radius: 50%; background: var(--action-primary); }
  .history article p { margin: 4px 0 0; color: var(--text-secondary); }
  .verify-note { display: grid; justify-items: center; max-width: 540px; padding: 22px; text-align: center; }
  .verify-note .status-art { width: 180px; height: 140px; }
  form { display: grid; gap: 16px; max-width: 540px; padding: 24px; border: 1px solid var(--border-default); border-radius: 20px; background: var(--background-surface); }
  label { display: grid; gap: 7px; font-weight: 650; }input { width: 100%; min-height: 48px; padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: 9px; color: var(--text-primary); background: var(--background-canvas); }
  button { width: fit-content; min-height: 48px; padding: 0 18px; border: 0; border-radius: 9px; color: var(--action-on-primary); background: var(--action-primary); font-weight: 750; cursor: pointer; }
  .error { color: var(--status-error-foreground); }
  @media (prefers-reduced-motion: no-preference) { .result, .status-art { animation: buytiva-arrive var(--motion-normal) var(--motion-easing-standard) both; } }
  @media (max-width: 620px) { .result { grid-template-columns: 1fr; padding: 18px; }.status-art { width: 100%; height: 150px; }.history { padding: 18px; } }
</style>
