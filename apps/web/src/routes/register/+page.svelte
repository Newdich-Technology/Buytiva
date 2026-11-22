<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Create account | BUYTIVA</title></svelte:head>
<main><h1>Create a customer account</h1>
{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.registered}<p>Check your email for the OTP and challenge reference. <a href="/verifyEmail?email={encodeURIComponent(form.email)}">Verify email</a></p>
{:else}<form method="POST"><label>Name <input name="displayName" required minlength="2" maxlength="120" /></label><label>Email <input name="email" type="email" required /></label><label>Password <input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password" /></label><label><input type="checkbox" name="termsAccepted" required /> I accept the terms</label><button>Create account</button></form>{/if}
</main>
