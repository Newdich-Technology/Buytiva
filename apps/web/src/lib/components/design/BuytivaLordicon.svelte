<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  type Trigger = 'hover' | 'in' | 'click';
  type IconElement = HTMLElement & { play: (options?: { state?: string }) => Promise<boolean> };

  let {
    src,
    label,
    width = 48,
    height = 48,
    trigger = 'hover',
    animationState,
    playKey = 0,
    children,
  }: {
    src: string;
    label?: string;
    width?: number;
    height?: number;
    trigger?: Trigger;
    animationState?: string;
    playKey?: number;
    children?: Snippet;
  } = $props();

  let icon = $state<IconElement>();
  let reducedMotion = $state(false);

  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = preference.matches;
    const updatePreference = (event: MediaQueryListEvent) => reducedMotion = event.matches;
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  });

  $effect(() => {
    const requestedPlay = playKey;
    if (requestedPlay > 0 && !reducedMotion && icon) void icon.play(animationState ? { state: animationState } : undefined);
  });
</script>

{#if reducedMotion}
  <span class="fallback" style={`width:${width}px;height:${height}px`} role={label ? 'img' : undefined} aria-label={label}>
    {@render children?.()}
  </span>
{:else}
  <lord-icon
    bind:this={icon}
    {src}
    state={animationState}
    {trigger}
    loading="lazy"
    aria-label={label}
    aria-hidden={label ? undefined : 'true'}
    style={`width:${width}px;height:${height}px`}
  >{@render children?.()}</lord-icon>
{/if}

<style>
  lord-icon, .fallback { display: inline-grid; place-items: center; vertical-align: middle; }
  lord-icon { --lord-icon-primary: var(--action-primary); --lord-icon-secondary: var(--accent-coral); }
  lord-icon:not(:defined) > :global(*) { width: 100%; height: 100%; }
  .fallback { color: currentColor; }
  @media (prefers-reduced-motion: reduce) { lord-icon { display: none; } }
</style>
