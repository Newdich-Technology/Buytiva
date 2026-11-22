<script lang="ts">
	import AuthFrame from '../../lib/components/auth/AuthFrame.svelte';
	let { form, data } = $props();
</script>

<svelte:head><title>Verify your email | Buytiva</title></svelte:head>
<AuthFrame eyebrow="One secure step" headline="Make it yours." description="Confirm the email attached to your account before you sign in to Buytiva.">
	{#snippet children()}
		<section class="auth-form">
			{#if form?.verified}<p class="eyebrow">EMAIL VERIFIED</p><h2>You’re all set.</h2><p>Your email is confirmed. Sign in to continue to Buytiva.</p><a class="auth-submit button-link" href="/login">Continue to sign in</a>
			{:else}<h2>Verify your email</h2><p>Enter the challenge reference and six-digit code from your email.</p>{#if form?.error}<p class="auth-error" role="alert">{form.error}</p>{/if}{#if form?.resent}<p class="auth-success" role="status">{form.message}</p>{/if}<form method="POST"><label>Email address<input name="email" type="email" value={data.email} autocomplete="email" required /></label><label>Challenge reference<input name="challengeId" autocomplete="off" required /></label><label>Email code<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="6" required /></label><button class="auth-submit">Verify email</button></form><form method="POST" action="?/resend" class="resend"><input type="hidden" name="email" value={data.email} /><button type="submit">Resend code</button></form>{/if}
		</section>
	{/snippet}
</AuthFrame>

<style>
	.eyebrow { margin: 0; color: var(--action-primary); font-size: 11px; font-weight: 850; letter-spacing: .13em; }
	.button-link { display: flex; align-items: center; justify-content: center; text-decoration: none; }
	.auth-success { padding: 11px 13px; border-radius: 10px; color: var(--status-success-foreground); background: var(--status-success-surface); }
	.resend { display: block !important; padding: 0 !important; border: 0 !important; background: transparent !important; box-shadow: none !important; }
	.resend button { min-height: 38px; padding: 0; border: 0; color: var(--action-primary); background: transparent; font-weight: 750; cursor: pointer; }
</style>
