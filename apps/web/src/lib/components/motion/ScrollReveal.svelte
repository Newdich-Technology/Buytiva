<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children, class: className = '' }: { children: Snippet; class?: string } = $props();
	let node = $state<HTMLElement>();
	let mounted = $state(false);
	let visible = $state(true);

	onMount(() => {
		mounted = true;
		if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const isNearViewport = node.getBoundingClientRect().top < window.innerHeight * .9;
		if (isNearViewport) return;
		visible = false;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) { visible = true; observer.disconnect(); }
		}, { threshold: 0.12 });
		observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<div bind:this={node} class:mounted class:visible class={`scroll-reveal ${className}`}>
	{@render children()}
</div>

<style>
	.scroll-reveal { opacity: 1; transform: none; }
	.scroll-reveal.mounted:not(.visible) { opacity: 0; transform: translateY(24px); transition: opacity 700ms var(--motion-easing-standard), transform 700ms var(--motion-easing-standard); }
	.scroll-reveal.visible { opacity: 1; transform: translateY(0); transition: opacity 700ms var(--motion-easing-standard), transform 700ms var(--motion-easing-standard); }
	@media (prefers-reduced-motion: reduce) { .scroll-reveal { opacity: 1; transform: none; transition: none; } }
</style>
