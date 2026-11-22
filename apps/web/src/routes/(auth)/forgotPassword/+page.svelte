<script lang="ts">
	import AuthFrame from '../../../lib/components/auth/AuthFrame.svelte';
	let { form } = $props();
	let token = $state('');
	$effect(() => { if (typeof window !== 'undefined') token = new URL(window.location.href).searchParams.get('token') ?? ''; });
</script>

<svelte:head><title>Password recovery | Buytiva</title></svelte:head>
<AuthFrame eyebrow="Account security" headline="Find your way back in." description="Request a password reset with your verified email, or complete the secure reset link from your inbox.">
	{#snippet children()}
		<form method="POST" class="auth-form">
			{#if form?.complete}<p class="eyebrow">PASSWORD UPDATED</p><h2>Password changed.</h2><p>Your password has been updated. Sign in again to continue.</p><a class="auth-submit button-link" href="/login">Return to sign in</a>
			{:else if form?.requested}<p class="eyebrow">CHECK YOUR INBOX</p><h2>Reset instructions sent.</h2><p>If an account matches that email, recovery instructions are on their way.</p><a class="auth-links" href="/login">Return to sign in</a>
			{:else}<h2>{token ? 'Choose a new password' : 'Recover your password'}</h2><p>{token ? 'Use at least 12 characters you do not use elsewhere.' : 'We will send a one-time reset link if the account exists.'}</p>{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}{#if token}<input type="hidden" name="token" value={token} /><label>New password<input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label><label>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /></label><button class="auth-submit">Update password</button>{:else}<label>Email address<input name="email" type="email" autocomplete="email" required /></label><button class="auth-submit">Send recovery email</button>{/if}<p class="auth-links"><a href="/login">Back to sign in</a><a href="/register">Create account</a></p>{/if}
		</form>
	{/snippet}
</AuthFrame>

<style>
	.eyebrow { margin: 0; color: var(--action-primary); font-size: 11px; font-weight: 850; letter-spacing: .13em; }
	.button-link { display: flex; align-items: center; justify-content: center; text-decoration: none; }
</style>
