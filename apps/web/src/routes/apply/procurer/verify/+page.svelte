<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Verify procurer application | BUYTIVA</title></svelte:head>
<main><h1>Verify your procurer application</h1>{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.verified}<p>Application email verified. Track progress with your reference.</p>{:else}<form method="POST"><label>Email <input name="email" type="email" required /></label><label>Challenge reference <input name="challengeId" required /></label><label>Email code <input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="6" required /></label><button>Verify application email</button></form>{/if}</main>
