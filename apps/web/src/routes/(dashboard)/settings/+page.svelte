<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head><title>Security settings | Buytiva</title></svelte:head>
<section class="settings">
	<header><p>ACCOUNT SECURITY</p><h1>Sessions and sign-in</h1><span>Review access to your Buytiva account.</span></header>
	{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
	{#if form?.success}<p class="success" role="status">{form.success}</p>{/if}
	{#if data.loadError}<p class="error" role="status">Security details could not be refreshed. Reload to try again.</p>{/if}
	<section class="panel"><div><h2>Multi-factor authentication</h2><p>{data.mfa?.enabled ? 'An authenticator is enabled for this account.' : 'No authenticator is enabled for this account.'}</p></div>
		{#if data.mfa?.enabled}<form method="POST" action="?/disableMfa"><label>Password<input name="password" type="password" autocomplete="current-password" required /></label><label>Authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="8" required /></label><button class="secondary">Disable authenticator</button></form>{/if}
	</section>
	<section class="panel"><div><h2>Active sessions</h2><p>Revoke devices you no longer use.</p></div>
		{#if Array.isArray(data.sessions) && data.sessions.length}<ul>{#each data.sessions as session (session.id)}<li><div><strong>{session.deviceLabel ?? 'Unnamed device'}</strong><span>Last used {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : 'Not recorded'} · Expires {new Date(session.expiresAt).toLocaleDateString()}</span></div><form method="POST" action="?/revoke"><input type="hidden" name="sessionId" value={session.id} /><button class="secondary">Revoke</button></form></li>{/each}</ul>{:else}<p>No active sessions were returned.</p>{/if}
	</section>
	<form method="POST" action="?/logoutAll"><button class="danger">Sign out on all devices</button></form>
</section>

<style>
	.settings{display:grid;gap:20px;max-width:900px;color:var(--text-primary)}header p{color:var(--action-primary);font-size:11px;font-weight:800;letter-spacing:.12em}h1{margin:4px 0;font-size:clamp(28px,4vw,42px)}header span,.panel p{color:var(--text-secondary)}.panel{display:grid;gap:18px;padding:24px;border:1px solid var(--border-default);border-radius:18px;background:var(--background-surface)}h2{margin:0 0 5px;font-size:19px}.panel p{margin:0}.panel form{display:flex;align-items:end;gap:12px;flex-wrap:wrap}label{display:grid;gap:6px;font-size:13px;font-weight:650}input{min-height:44px;padding:0 12px;border:1px solid var(--border-default);border-radius:9px;color:var(--text-primary);background:var(--background-canvas)}ul{display:grid;gap:12px;padding:0;list-style:none}li{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-top:12px;border-top:1px solid var(--border-default)}li div{display:grid;gap:4px}li span{font-size:12px;color:var(--text-secondary)}button{min-height:42px;padding:0 15px;border:0;border-radius:9px;color:var(--action-on-primary);background:var(--action-primary);font-weight:700;cursor:pointer}.secondary{border:1px solid var(--border-default);color:var(--text-primary);background:var(--background-surface)}.danger{background:var(--status-error-foreground)}.error{color:var(--status-error-foreground)}.success{color:var(--status-success-foreground)}@media(max-width:600px){.panel{padding:18px}li{align-items:flex-start}.panel form{align-items:stretch}label{width:100%}}
</style>
