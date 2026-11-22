<script lang="ts">let { form, data } = $props();</script>
<svelte:head><title>Verify procurer application | BUYTIVA</title></svelte:head>
<main><h1>Verify your procurer application</h1>{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.verified}<p role="status">Application email verified. <a href="/application/status">Track progress with your reference.</a></p>{:else}<form method="POST"><label>Email <input name="email" type="email" value={data.email} required /></label><label>Challenge reference <input name="challengeId" value={data.challengeId} required /></label><label>Email code <input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="6" required /></label><button>Verify application email</button></form>{/if}</main>
