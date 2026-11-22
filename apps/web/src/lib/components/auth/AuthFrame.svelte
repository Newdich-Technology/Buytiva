<script lang="ts">
	import type { Snippet } from 'svelte';
	let { eyebrow, headline, description, children }: { eyebrow: string; headline: string; description: string; children: Snippet } = $props();
</script>

<svelte:head><meta name="theme-color" content="#2457e7" /></svelte:head>
<main class="auth-frame">
	<section class="story" aria-label="Buytiva introduction">
		<a class="brand" href="/" aria-label="Buytiva home"><img class="light-logo" src="/brand/buytiva-logo-light.svg" alt="Buytiva" /><img class="dark-logo" src="/brand/buytiva-logo-dark.svg" alt="" /></a>
		<div class="story-copy"><p>{eyebrow}</p><h1>{headline}</h1><span>{description}</span></div>
		<svg class="scene" viewBox="0 0 620 390" role="img" aria-label="A neighbor prepares a shopping list for a local procurer">
			<path d="M54 314c88-145 216-163 310-98 74 51 139 43 201-54" stroke="#b5eb5a" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 15" />
			<circle cx="83" cy="261" r="29" fill="#ff9e42"/><circle cx="528" cy="123" r="38" fill="#b5eb5a"/>
			<path d="m510 124 13 13 24-29" stroke="#111d38" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M177 102h202a24 24 0 0 1 24 24v222H153V126a24 24 0 0 1 24-24Z" fill="#fffcf6" stroke="#111d38" stroke-width="7"/>
			<path d="M190 158h177m-177 36h141m-141 36h161" stroke="#a8b7cf" stroke-width="10" stroke-linecap="round"/>
			<circle cx="202" cy="278" r="8" fill="#ff675b"/><path d="M224 278h103" stroke="#2457e7" stroke-width="10" stroke-linecap="round"/>
			<path d="M407 216c0-43 29-73 70-73 38 0 68 30 68 73 0 31-17 57-44 69l-9 42h-39l-8-42c-23-13-38-39-38-69Z" fill="#d98b63" stroke="#111d38" stroke-width="7"/>
			<path d="M405 210c3-48 30-77 73-77 35 0 63 21 70 61-19-8-32-14-45-18-17 20-48 31-98 34Z" fill="#111d38" stroke="#111d38" stroke-width="7" stroke-linejoin="round"/>
			<path d="M441 221h3m41 0h3m-42 31c8 8 18 8 26 0" stroke="#111d38" stroke-width="6" stroke-linecap="round"/>
			<path d="M402 347c9-34 31-56 69-67l22 18 20-18c32 12 51 34 58 67H402Z" fill="#b399ff" stroke="#111d38" stroke-width="7" stroke-linejoin="round"/>
		</svg>
		<p class="ownership">A Newdich product · Local hands, your list.</p>
	</section>
	<section class="auth-content"><div class="mobile-brand"><a href="/">BUY<span>T</span>IVA</a></div>{@render children()}</section>
</main>

<style>
	.auth-frame{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr);min-height:100vh;color:var(--text-primary);background:var(--background-canvas)}.story{position:sticky;top:0;display:flex;min-height:100vh;flex-direction:column;justify-content:space-between;padding:clamp(28px,5vw,72px);color:var(--text-primary);background:var(--background-subtle);overflow:hidden}.brand img{display:block;width:142px}.brand .dark-logo{display:none}:global([data-theme='dark']) .brand .light-logo{display:none}:global([data-theme='dark']) .brand .dark-logo{display:block}.story-copy{position:relative;z-index:1;max-width:600px;margin-top:55px}.story-copy p{margin:0 0 15px;font-size:12px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}.story-copy h1{margin:0;font:800 clamp(42px,5vw,72px)/.97 'Space Grotesk',sans-serif;letter-spacing:-.055em}.story-copy span{display:block;max-width:490px;margin-top:20px;font-size:17px;line-height:1.55}.scene{width:min(100%,650px);max-height:46vh;align-self:center;margin:0 auto}.ownership{margin:25px 0 0;font-size:12px;font-weight:650}.auth-content{display:flex;min-height:100vh;align-items:center;justify-content:center;padding:clamp(24px,6vw,88px)}.mobile-brand{display:none}.auth-content :global(.auth-form){display:grid;width:min(100%,430px);gap:18px}.auth-content :global(.auth-form h2){margin:0;font:750 clamp(32px,3.3vw,46px)/1.04 'Space Grotesk',sans-serif;letter-spacing:-.045em}.auth-content :global(.auth-form > p){margin:0;color:var(--text-secondary);line-height:1.55}.auth-content :global(.auth-form label){display:grid;gap:8px;color:var(--text-primary);font-size:13px;font-weight:700}.auth-content :global(.auth-form input:not([type=checkbox])){width:100%;min-height:52px;padding:0 14px;border:1px solid var(--border-strong);border-radius:11px;color:var(--text-primary);background:var(--background-surface);font:inherit}.auth-content :global(.password-field){display:flex;align-items:center;gap:8px}.auth-content :global(.password-field input){flex:1;min-width:0}.auth-content :global(.password-field button){min-height:42px;padding:0 10px;border:0;border-radius:8px;color:var(--action-primary);background:transparent;cursor:pointer}.auth-content :global(.auth-submit){min-height:52px;border:0;border-radius:11px;color:var(--action-on-primary);background:var(--action-primary);font-weight:800;cursor:pointer}.auth-content :global(.auth-submit:disabled){opacity:.6;cursor:wait}.auth-content :global(.auth-error){padding:12px 14px;border-radius:10px;color:var(--status-error-foreground);background:var(--status-error-surface)}.auth-content :global(.auth-links){display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}.auth-content :global(a){color:var(--action-primary);font-size:13px;font-weight:700;text-decoration-thickness:1px;text-underline-offset:3px}.auth-content :global(.terms){display:flex!important;grid-template-columns:20px 1fr;align-items:start;gap:10px!important;line-height:1.45}.auth-content :global(.terms input){width:18px;height:18px;margin:1px 0;accent-color:var(--action-primary)}.auth-content :global(.auth-form button:focus-visible),.auth-content :global(.auth-form a:focus-visible),.auth-content :global(.auth-form input:focus-visible){outline:3px solid var(--focus-ring);outline-offset:3px}
	@media(max-width:900px){.auth-frame{grid-template-columns:1fr}.story{display:none}.auth-content{min-height:100svh;align-items:flex-start;padding:22px 24px 50px}.mobile-brand{display:block;margin:2px 0 48px}.mobile-brand a{color:var(--text-primary);font:800 20px 'Space Grotesk',sans-serif;text-decoration:none;letter-spacing:-.05em}.mobile-brand span{color:var(--action-primary)}.auth-content :global(.auth-form){margin:auto}.auth-content :global(.auth-form h2){font-size:36px}}
</style>
