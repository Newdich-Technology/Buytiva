<script lang="ts">
	import AuthFrame from '../../lib/components/auth/AuthFrame.svelte';
	let { form, data } = $props();
</script>

<svelte:head><title>Accept invitation | Buytiva</title></svelte:head>
<AuthFrame eyebrow="Private invitation" headline="A considered welcome." description="Complete the secure setup flow from your single-use Buytiva invitation.">
	{#snippet children()}
		<section class="auth-form">
			{#if form?.accepted}<p class="eyebrow">INVITATION ACCEPTED</p><h2>Your access is ready.</h2><p>Sign in to continue. Your account still follows the permissions granted by the invitation.</p><a class="auth-submit button-link" href="/login">Go to sign in</a>
			{:else}<h2>{form?.invitation ? 'Finish your account' : 'Review your invitation'}</h2><p>{form?.invitation ? `Invitation for ${form.invitation.displayName} (${form.invitation.email}).` : 'Confirm the invitation before setting a password.'}</p>{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}<form method="POST"><input type="hidden" name="token" value={form?.token ?? data.token} />{#if form?.invitation}<label>Password<input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label><label>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label><button class="auth-submit">Accept invitation</button>{:else}<button class="auth-submit" name="preview" value="yes">Review invitation</button>{/if}</form><p class="auth-links"><a href="/support">Need help?</a><a href="/login">Sign in</a></p>{/if}
		</section>
	{/snippet}
</AuthFrame>

<style>
	.eyebrow { margin: 0; color: var(--action-primary); font-size: 11px; font-weight: 850; letter-spacing: .13em; }
	.button-link { display: flex; align-items: center; justify-content: center; text-decoration: none; }
</style>
