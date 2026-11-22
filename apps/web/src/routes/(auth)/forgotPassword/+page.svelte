<script lang="ts">
	let { form } = $props();
	let token = $state('');
	$effect(() => { if (typeof window !== 'undefined') token = new URL(window.location.href).searchParams.get('token') ?? ''; });
</script>
<svelte:head><title>Password recovery | BUYTIVA</title></svelte:head>
<main><h1>Recover your password</h1>
	{#if form?.error}<p role="alert">{form.error}</p>{/if}
	{#if form?.complete}<p>Password updated. <a href="/login">Sign in</a></p>
	{:else if form?.requested}<p>If the account exists, recovery instructions have been sent.</p>
	{:else if token}<form method="POST"><input type="hidden" name="token" value={token} /><label>New password <input name="password" type="password" minlength="12" maxlength="128" required /></label><label>Confirm password <input name="confirmPassword" type="password" minlength="12" maxlength="128" required /></label><button>Reset password</button></form>
	{:else}<form method="POST"><label>Email <input name="email" type="email" required /></label><button>Send recovery email</button></form>{/if}
</main>
