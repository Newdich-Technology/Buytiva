<script lang="ts">let { data } = $props();</script>
<svelte:head><title>My procurer application | BUYTIVA</title></svelte:head>
<main><h1>My procurer application</h1>
{#if data.error}<p role="alert">{data.error}</p>{:else if !data.application}<p>No procurer application is linked to this account.</p>{:else}<p>Reference: {data.application.publicReference}</p><p>Status: <strong>{data.application.status}</strong></p><p>Location: {data.application.proposedCity}, {data.application.proposedCountry}</p><p>Categories: {data.application.categories.join(', ')}</p><h2>Status history</h2>{#each data.application.statusHistory as item}<p>{item.createdAt} · {item.status} · {item.reason ?? ''}</p>{/each}{/if}
</main>
