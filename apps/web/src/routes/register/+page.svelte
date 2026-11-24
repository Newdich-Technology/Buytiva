<script lang="ts">
	import AuthFrame from '../../lib/components/auth/AuthFrame.svelte';
	let { form } = $props();
	let showPassword = $state(false);
</script>

<svelte:head><title>Create account | BUYTIVA</title></svelte:head>
<AuthFrame eyebrow="A better way to shop" headline="Make room for the good stuff." description="Create a customer account to start your Buytiva journey. Email verification keeps your account protected.">
	{#snippet children()}
		<section class="auth-form">
			{#if form?.registered}
				<p class="eyebrow">ACCOUNT CREATED</p><h2>Check your inbox.</h2><p>We sent verification instructions to <strong>{form.email}</strong>. Enter the email challenge and code to verify your address.</p><a class="auth-submit button-link" href="/verifyEmail?email={encodeURIComponent(form.email)}">Continue to verification</a>
			{:else}
				<form method="POST" class="auth-form">
					<h2>Create your account</h2><p>Start with your name, email, and a strong password.</p>
					{#if form?.error}<p id="registration-error" class="auth-error" role="alert">{form.error}</p>{/if}
					<label>Full name<input name="displayName" autocomplete="name" required minlength="2" maxlength="120" /></label>
					<label>Email address<input name="email" type="email" autocomplete="email" required /></label>
					<label>Password<span class="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autocomplete="new-password" required minlength="12" maxlength="128" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onclick={() => showPassword = !showPassword}>{showPassword ? 'Hide' : 'Show'}</button></span><small>Use at least 12 characters.</small></label>
					<label>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" aria-describedby={form?.error ? 'registration-error' : undefined} required minlength="12" maxlength="128" /></label>
					<label class="terms"><input type="checkbox" name="termsAccepted" required />I agree to the Buytiva terms and privacy notice.</label>
					<button class="auth-submit">Create account</button><p class="auth-links"><span>Already registered?</span><a href="/login">Sign in</a></p>
				</form>
			{/if}
		</section>
	{/snippet}
</AuthFrame>

<style>
	.auth-form :global(small){color:var(--text-muted);font-size:12px}.button-link{display:flex;align-items:center;justify-content:center;text-decoration:none}.eyebrow{color:var(--action-primary);font-size:11px;font-weight:800;letter-spacing:.13em}
</style>
