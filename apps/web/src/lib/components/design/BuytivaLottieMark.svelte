<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { AnimationItem } from 'lottie-web';

	let { label, children }: { label: string; children?: Snippet } = $props();
	let host: HTMLSpanElement;
	let active = $state(false);
	let loaded = $state(false);
	let reducedMotion = $state(false);
	let started = false;

	onMount(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = preference.matches;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) active = true;
		}, { threshold: 0.65 });
		observer.observe(host);
		const updatePreference = (event: MediaQueryListEvent) => reducedMotion = event.matches;
		preference.addEventListener('change', updatePreference);
		return () => {
			observer.disconnect();
			preference.removeEventListener('change', updatePreference);
		};
	});

	$effect(() => {
		if (!active || reducedMotion || started) return;
		started = true;
		let animation: AnimationItem | undefined;
		let disposed = false;
		void (async () => {
			try {
				const response = await fetch('/animations/lottie/quote-check.json');
				if (!response.ok) throw new Error('Animation asset unavailable');
				const data = await response.json();
				if (disposed) return;
				const lottie = await import('lottie-web');
				if (disposed) return;
				animation = lottie.default.loadAnimation({ container: host, renderer: 'svg', loop: false, autoplay: false, animationData: data });
				animation.addEventListener('DOMLoaded', () => {
					if (!disposed) {
						loaded = true;
						animation?.goToAndPlay(0, true);
					}
				});
			} catch {
				loaded = false;
			}
		})();
		return () => {
			disposed = true;
			animation?.destroy();
		};
	});
</script>

<span class="mark" bind:this={host} role="img" aria-label={label}>
	{#if !loaded || reducedMotion}{@render children?.()}{/if}
</span>

<style>
	.mark{display:inline-grid;width:27px;height:27px;flex:none;place-items:center;vertical-align:middle;color:var(--action-primary)}
	.mark :global(svg){width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
	.mark :global(svg path){stroke-dasharray:32;stroke-dashoffset:0}
</style>
