<script lang="ts">let { form } = $props();</script>
<svelte:head><title>Application status | BUYTIVA</title></svelte:head>
<main><h1>Check application status</h1>{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.statusResult}<p>Application status: <strong>{form.statusResult.status}</strong></p>{#each form.statusResult.history as item}<p>{item.status}: {item.reason ?? 'Status updated'}</p>{/each}
{:else if form?.requested}<p>Enter the verification code sent to the application email. Challenge ID: {form.challengeId}</p><form method="POST"><input type="hidden" name="step" value="verify" /><input type="hidden" name="email" value={form.email} /><label>Challenge ID <input name="challengeId" value={form.challengeId} required /></label><label>Email code <input name="code" inputmode="numeric" minlength="6" maxlength="6" required /></label><button>View status</button></form>
{:else}<form method="POST"><label>Email <input name="email" type="email" required /></label><label>Application reference <input name="reference" required /></label><button>Send verification code</button></form>{/if}</main>
