<script lang="ts">
	let { form } = $props();
</script>
<svelte:head><title>Sign in | BUYTIVA</title></svelte:head>
<main>
	<h1>Sign in to BUYTIVA</h1>
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
	<form method="POST">
		{#if form?.challengeToken}
			<input type="hidden" name="challengeToken" value={form.challengeToken} />
			<input type="hidden" name="passwordChangeRequired" value={String(form.passwordChangeRequired)} />
			{#if form?.enrollmentUri}
				<p>Set up your authenticator with this secret: <strong>{form.secret}</strong></p>
				<a href={form.enrollmentUri}>Open authenticator app</a>
				<input type="hidden" name="enrollmentUri" value={form.enrollmentUri} />
				<input type="hidden" name="secret" value={form.secret} />
				<input type="hidden" name="passwordChangeRequired" value={String(form.passwordChangeRequired)} />
				<input type="hidden" name="step" value="verify-enrollment" />
				<label>Authenticator code <input name="code" inputmode="numeric" autocomplete="one-time-code" required minlength="6" maxlength="6" /></label>
				<button>Verify and continue</button>
			{:else if form?.challengeType === 'MFA_ENROLLMENT'}
				<input type="hidden" name="step" value="enroll" />
				<button>Set up authenticator</button>
			{:else}
				<label>Authenticator code <input name="code" inputmode="numeric" autocomplete="one-time-code" required minlength="6" maxlength="6" /></label>
				<button>Verify and continue</button>
			{/if}
		{:else}
			<label>Email <input name="email" type="email" autocomplete="username" required /></label>
			<label>Password <input name="password" type="password" autocomplete="current-password" required /></label>
			<button>Sign in</button>
		{/if}
	</form>
	<a href="/register">Create customer account</a>
	<a href="/forgotPassword">Forgot password?</a>
</main>
