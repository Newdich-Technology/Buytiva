<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <meta name="author" content="Oluwayemi Oyinlola" />
</svelte:head>

{@render children()}
