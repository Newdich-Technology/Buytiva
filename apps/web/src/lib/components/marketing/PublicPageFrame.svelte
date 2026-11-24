<script lang="ts">
	import type { Snippet } from 'svelte';
	let { eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: Snippet } = $props();
</script>

<main class="public-page"><header class="page-intro"><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></header><div class="page-body">{@render children()}</div></main>

<style>
	.public-page{width:min(1240px,calc(100% - 48px));margin:0 auto;padding:clamp(48px,8vw,108px) 0 120px;color:var(--text-primary)}.page-intro{max-width:880px;margin-bottom:clamp(38px,6vw,72px)}.page-intro p{margin:0 0 14px;color:var(--action-primary);font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.page-intro h1{margin:0;font:750 clamp(46px,8vw,94px)/.94 var(--font-display),serif;letter-spacing:-.075em}.page-intro span{display:block;max-width:710px;margin-top:23px;color:var(--text-secondary);font-size:clamp(17px,2vw,21px);line-height:1.6}.page-body{max-width:1020px}:global(.page-body h2){font:700 clamp(25px,4vw,38px)/1.05 var(--font-display),serif;letter-spacing:-.045em}:global(.page-body p),:global(.page-body li){color:var(--text-secondary);font-size:16px;line-height:1.7}:global(.page-body a){color:var(--action-primary);font-weight:750;text-underline-offset:4px}:global(.page-cta){display:inline-flex;min-height:52px;align-items:center;gap:22px;margin-top:16px;padding:0 18px;border-radius:999px;color:var(--action-on-primary)!important;background:var(--action-primary);text-decoration:none}
	@media(max-width:600px){.public-page{width:calc(100% - 36px);padding:44px 0 76px}.page-intro h1{font-size:clamp(43px,13vw,68px)}.page-intro span{margin-top:17px}:global(.page-body p),:global(.page-body li){font-size:15px}}
</style>
