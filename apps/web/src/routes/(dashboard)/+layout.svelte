<script lang="ts">
	import '../../lib/styles/dashboard.css';
	let { children } = $props();
</script>

<svelte:head><title>Buytiva workspace</title></svelte:head>
<div class="workspace">{@render children()}</div>
