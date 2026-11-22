<script lang="ts">let { data, form } = $props();</script>
<svelte:head><title>Staff management | BUYTIVA</title></svelte:head>
<main><h1>Staff management</h1>
{#if data.error}<p role="alert">{data.error}</p>{/if}{#if form?.error}<p role="alert">{form.error}</p>{/if}
{#if form?.invited}<p>Invitation sent to the invited email address.</p>{/if}{#if form?.updated || form?.completed}<p>Staff access updated.</p>{/if}
<section><h2>Invite staff</h2><form method="POST" action="?/invite"><label>Email <input name="email" type="email" required /></label><label>Display name <input name="displayName" required minlength="2" maxlength="120" /></label><label>Role <select name="role"><option value="ADMIN">Administrator</option><option value="SUPER_ADMIN">Super Administrator</option></select></label><label>Permission profile <select name="permissionProfile">{#each Object.keys(data.catalog.profiles) as profile}<option value={profile}>{profile}</option>{/each}</select></label><label>Reason <textarea name="reason" minlength="8" maxlength="1000" required></textarea></label><button>Send invitation</button></form></section>
<section><h2>Staff accounts</h2>{#each data.staff as member}<article><h3>{member.displayName ?? member.email}</h3><p>{member.email} · {member.roles.join(', ')} · {member.status}</p><p>Permissions: {member.permissions.join(', ') || 'None'}</p>
{#if member.roles.includes('ADMIN')}<form method="POST" action="?/permissions"><input type="hidden" name="userId" value={member.id} /><fieldset><legend>Administrator permissions</legend>{#each data.catalog.codes as code}<label><input type="checkbox" name="permissionCodes" value={code} checked={member.permissions.includes(code)} />{code}</label>{/each}</fieldset><label>Reason <input name="reason" minlength="8" maxlength="1000" required /></label><button>Update permissions</button></form>{/if}
{#if member.status !== 'SUSPENDED' && member.status !== 'REVOKED'}<form method="POST" action="?/suspend"><input type="hidden" name="userId" value={member.id} /><label>Reason <input name="reason" minlength="8" maxlength="1000" required /></label><button>Suspend</button></form>{/if}
{#if member.status !== 'REVOKED'}<form method="POST" action="?/revoke"><input type="hidden" name="userId" value={member.id} /><label>Reason <input name="reason" minlength="8" maxlength="1000" required /></label><button>Revoke</button></form>{/if}
</article>{/each}</section>
<section><h2>Recent staff audit events</h2>{#each data.audit as event}<p>{event.createdAt} · {event.action} · {event.resourceType} {event.resourceId ?? ''}</p>{/each}</section>
</main>
