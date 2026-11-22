<script lang="ts">let { form, data } = $props();</script>
<svelte:head><title>Accept invitation | BUYTIVA</title></svelte:head>
<main><h1>Complete your BUYTIVA invitation</h1>{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.accepted}<p>Invitation accepted. Set up your authenticator using <a href="/login">sign in</a>.</p>
{:else}<form method="POST"><input type="hidden" name="token" value={form?.token ?? data.token} />
{#if form?.invitation}<p>Invitation for {form.invitation.displayName} ({form.invitation.email}) as {form.invitation.role ?? form.invitation.kind}.</p><label>Password <input name="password" type="password" minlength="12" maxlength="128" required /></label><label>Confirm password <input name="confirmPassword" type="password" minlength="12" maxlength="128" required /></label><button>Accept invitation</button>
{:else}<button name="preview" value="yes">Review invitation</button>{/if}</form>{/if}</main>
