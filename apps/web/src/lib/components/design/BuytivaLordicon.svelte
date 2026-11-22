<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { LORDICON_REGISTRY, type LordiconName } from '../../constants/lordiconRegistry.js';

	type Trigger = 'hover' | 'in' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang';
	type LoadingStrategy = 'lazy' | 'interaction' | `delay:${number}`;
	type IconElement = HTMLElement & { play: (options?: { state?: string; from?: 'start' }) => Promise<boolean> };

	let {
		name,
		src,
		label,
		width = 24,
		height = 24,
		trigger = 'hover',
		animationState,
		playKey = 0,
		loading = 'interaction',
		colors,
		children
	}: {
		name?: LordiconName;
		src?: string;
		label?: string;
		width?: number;
		height?: number;
		trigger?: Trigger;
		animationState?: string;
		playKey?: number;
		loading?: LoadingStrategy;
		colors?: string;
		children?: Snippet;
	} = $props();

	let icon = $state<IconElement>();
	let reducedMotion = $state(false);
	let definition = $derived(name ? LORDICON_REGISTRY[name] : undefined);
	let resolvedSrc = $derived(src ?? definition?.src ?? '');
	let resolvedState = $derived(animationState ?? definition?.state);

	onMount(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = preference.matches;
		const updatePreference = (event: MediaQueryListEvent) => reducedMotion = event.matches;
		preference.addEventListener('change', updatePreference);
		return () => preference.removeEventListener('change', updatePreference);
	});

	$effect(() => {
		const requestedPlay = playKey;
		if (requestedPlay > 0 && !reducedMotion && icon) {
			void icon.play(resolvedState ? { state: resolvedState, from: 'start' } : { from: 'start' });
		}
	});
</script>

{#if reducedMotion || !resolvedSrc}
	<span class="fallback" style={`width:${width}px;height:${height}px`} role={label ? 'img' : undefined} aria-label={label}>
		{@render children?.()}
		{#if !children}<span class="fallback-mark" aria-hidden="true"></span>{/if}
	</span>
{:else}
	<lord-icon
		bind:this={icon}
		src={resolvedSrc}
		state={resolvedState}
		{trigger}
		{loading}
		colors={colors}
		aria-label={label}
		aria-hidden={label ? undefined : 'true'}
		style={`width:${width}px;height:${height}px`}
	>{@render children?.()}</lord-icon>
{/if}

<style>
	lord-icon, .fallback { display: inline-grid; place-items: center; flex: 0 0 auto; vertical-align: middle; }
	lord-icon { --lord-icon-primary: var(--action-primary); --lord-icon-secondary: var(--accent-coral); min-width: 1px; min-height: 1px; }
	.fallback { color: currentColor; }
	.fallback-mark { width: 35%; height: 35%; border: 2px solid currentColor; border-radius: 50%; opacity: .72; }
	@media (prefers-reduced-motion: reduce) { lord-icon { display: none; } }
</style>
