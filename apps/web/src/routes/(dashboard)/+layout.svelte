<script lang="ts">
	let { children, data } = $props();
</script>
<svelte:head><title>BUYTIVA dashboard</title></svelte:head>
<header><a href="/dashboard/overview">BUYTIVA</a><span>{data.user?.displayName ?? data.user?.email}</span><form method="POST" action="/login?/logout"><button>Sign out</button></form></header>
<nav aria-label="Dashboard"><a href="/dashboard/overview">Overview</a>{#if data.roles?.includes('PROCURER')}<a href="/dashboard/application">My application</a>{/if}{#if data.roles?.includes('SUPER_ADMIN') || data.user?.permissions?.includes('procurerApplication.read')}<a href="/dashboard/procurerApplications">Procurer applications</a>{/if}{#if data.roles?.includes('SUPER_ADMIN')}<a href="/dashboard/administrators">Staff</a><a href="/dashboard/auditLogs">Audit log</a>{/if}</nav>
{@render children()}
