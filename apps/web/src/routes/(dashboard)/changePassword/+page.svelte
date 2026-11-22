<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Change password | BUYTIVA</title></svelte:head>
<main><h1>Change your password</h1><p>Choose a new password before continuing.</p>{#if form?.error}<p role="alert">{form.error}</p>{/if}
<form method="POST"><label>Current password <input name="currentPassword" type="password" autocomplete="current-password" required /></label><label>New password <input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" required /></label><label>Confirm new password <input name="confirmPassword" type="password" minlength="12" maxlength="128" autocomplete="new-password" required /></label><button>Update password</button></form></main>
