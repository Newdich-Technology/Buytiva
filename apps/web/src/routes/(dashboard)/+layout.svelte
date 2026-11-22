<script lang="ts">
	let { children } = $props();
</script>

<svelte:head><title>Buytiva workspace</title></svelte:head>
<div class="workspace"><main>{@render children()}</main></div>

<style>
	.workspace{min-height:calc(100vh - 150px);color:var(--text-primary);background:var(--background-canvas)}main{width:min(1440px,100%);padding:clamp(24px,4vw,56px);margin:auto}
</style>
