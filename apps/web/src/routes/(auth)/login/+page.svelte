<script lang="ts">
	import AuthFrame from '../../../lib/components/auth/AuthFrame.svelte';
	let { form } = $props();
	let showPassword = $state(false);
	let isChallenge = $derived(Boolean(form?.challengeToken));
	let title = $derived(isChallenge ? form?.challengeType === 'MFA_ENROLLMENT' ? 'Secure your account' : 'Confirm it’s you' : 'Welcome back.');
</script>

<svelte:head><title>Sign in | BUYTIVA</title></svelte:head>
<AuthFrame eyebrow="Good things, made easier" headline="Your list. Someone gets it." description="Sign in to Buytiva with secure access for customers, procurers, and our operations team.">
	{#snippet children()}
		<form method="POST" class="auth-form">
			<h2>{title}</h2>
			<p>{isChallenge ? 'Complete the authenticator step to continue to your account.' : 'Use your verified email and password to continue.'}</p>
			{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}
			{#if form?.challengeToken}
				<input type="hidden" name="challengeToken" value={form.challengeToken} />
				<input type="hidden" name="passwordChangeRequired" value={String(form.passwordChangeRequired)} />
				{#if form?.enrollmentUri}
					<p>Scan this authenticator setup with your app, then enter its current code.</p><a href={form.enrollmentUri}>Open authenticator app</a><code>{form.secret}</code>
					<input type="hidden" name="enrollmentUri" value={form.enrollmentUri} /><input type="hidden" name="secret" value={form.secret} /><input type="hidden" name="step" value="verify-enrollment" />
					<label>Authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" required minlength="6" maxlength="6" /></label><button class="auth-submit">Verify and continue</button>
				{:else if form?.challengeType === 'MFA_ENROLLMENT'}
					<p>Your account requires an authenticator before workspace access.</p><input type="hidden" name="step" value="enroll" /><button class="auth-submit">Set up authenticator</button>
				{:else}
					<label>Authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" required minlength="6" maxlength="6" /></label><button class="auth-submit">Verify and continue</button>
				{/if}
			{:else}
				<label>Email address<input name="email" type="email" autocomplete="username" required /></label>
				<label>Password<span class="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autocomplete="current-password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onclick={() => showPassword = !showPassword}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
				<button class="auth-submit">Sign in securely</button>
			{/if}
			<div class="auth-links"><a href="/register">Create customer account</a><a href="/forgotPassword">Forgot password?</a></div>
		</form>
	{/snippet}
</AuthFrame>
