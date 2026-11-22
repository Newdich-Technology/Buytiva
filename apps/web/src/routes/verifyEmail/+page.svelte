<script lang="ts">let { form, data } = $props();</script>
<svelte:head><title>Verify email | BUYTIVA</title></svelte:head>
<main><h1>Verify your email</h1>{#if form?.error}<p role="alert">{form.error}</p>{/if}{#if form?.resent}<p role="status">{form.message}</p>{/if}
{#if form?.verified}<p>Email verified. <a href="/login">Sign in</a></p>{:else}<form method="POST"><label>Email <input name="email" type="email" value={data.email} required /></label><label>Challenge reference <input name="challengeId" required /></label><label>Email code <input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="6" required /></label><button>Verify email</button></form>{/if}</main>
{#if !form?.verified}<form method="POST" action="?/resend"><input type="hidden" name="email" value={data.email} /><button type="submit">Resend verification email</button></form>{/if}
