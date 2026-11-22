<script lang="ts">
	import type { Snippet } from 'svelte';
	let { eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: Snippet } = $props();
</script>

<main class="public-page">
	<div class="page-shell">
		<header class="page-intro"><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></header>
		<div class="page-body">{@render children()}</div>
	</div>
</main>

<style>
	.public-page { min-height: 55vh; color: var(--text-primary); background: var(--background-canvas); }
	.page-shell { width: min(1260px, calc(100% - 48px)); padding: clamp(56px, 8vw, 115px) 0 125px; margin: 0 auto; }
	.page-intro { position: relative; max-width: 890px; margin-bottom: clamp(45px, 7vw, 88px); }
	.page-intro::before { display: block; width: 54px; height: 4px; margin-bottom: 28px; border-radius: 4px; background: var(--action-primary); content: ''; }
	.page-intro p { margin: 0 0 15px; color: var(--action-primary); font-size: 11px; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
	.page-intro h1 { max-width: 900px; margin: 0; font: 800 clamp(48px, 8vw, 102px)/.89 'Space Grotesk', 'Arial Black', sans-serif; letter-spacing: -.085em; }
	.page-intro span { display: block; max-width: 710px; margin-top: 25px; color: var(--text-secondary); font-size: clamp(17px, 2vw, 21px); line-height: 1.6; }
	.page-body { max-width: 1120px; }
	:global(.page-body h2) { font: 800 clamp(28px, 4.5vw, 50px)/.96 'Space Grotesk', 'Arial Black', sans-serif; letter-spacing: -.065em; }
	:global(.page-body p), :global(.page-body li) { color: var(--text-secondary); font-size: 16px; line-height: 1.7; }
	:global(.page-body a) { color: var(--action-primary); font-weight: 800; text-underline-offset: 4px; }
	:global(.page-cta) { display: inline-flex; min-height: 50px; align-items: center; gap: 22px; margin-top: 16px; padding: 0 18px; border-radius: var(--radius-pill); color: var(--action-on-primary) !important; background: var(--action-primary); text-decoration: none; }
	@media (max-width: 600px) { .page-shell { width: calc(100% - 36px); padding: 45px 0 78px; }.page-intro::before { margin-bottom: 22px; }.page-intro h1 { font-size: clamp(45px, 13vw, 71px); }.page-intro span { margin-top: 18px; font-size: 16px; }:global(.page-body p), :global(.page-body li) { font-size: 15px; } }
</style>
