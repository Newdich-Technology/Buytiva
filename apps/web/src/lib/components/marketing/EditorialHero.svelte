<script>
	import ThemeIllustration from './ThemeIllustration.svelte';
</script>

<section class="shopping-world" aria-labelledby="hero-title">
	<div class="hero-scene">
		<div class="scene-window"><ThemeIllustration class="world-art" scene="world" /></div>
		<div class="scene-caption"><span class="route-mark" aria-hidden="true">↗</span><span>A good list finds good hands.</span></div>
	</div>
	<div class="hero-copy">
		<p class="eyebrow">Good shopping, closer to home</p>
		<h1 id="hero-title">Your list.<br /><span>Consider it done.</span></h1>
		<p class="summary">Choose a trusted procurer, share what you need, and let someone local handle the shopping.</p>
		<div class="hero-actions"><a class="primary" href="/register">Start shopping <span aria-hidden="true">↗</span></a><a class="secondary" href="/how-it-works">Discover how Buytiva works</a></div>
	</div>
</section>

<style>
	.shopping-world{position:relative;isolation:isolate;display:grid;min-height:min(820px,100svh);align-items:center;overflow:hidden;margin-top:-86px;padding:110px max(24px,calc((100vw - 1320px)/2)) 60px;color:var(--illustration-hero-ink);background:var(--illustration-hero-sky)}
	.hero-scene{position:absolute;z-index:0;inset:0 0 0 48%;overflow:hidden;background:var(--illustration-hero-sky);pointer-events:none}
	.scene-window{position:absolute;inset:16% 0 10%;overflow:hidden;mask-image:linear-gradient(90deg,transparent 0%,#000 17%,#000 100%)}
	.scene-window :global(.world-art){position:absolute;inset:0;width:100%;height:100%;animation:world-arrive 900ms cubic-bezier(.2,.75,.25,1) both}
	.scene-caption{position:absolute;right:clamp(24px,6vw,84px);bottom:38px;display:flex;align-items:center;gap:10px;color:var(--text-secondary);font-size:13px;font-weight:650;letter-spacing:.01em}
	.route-mark{display:grid;width:30px;height:30px;place-items:center;border:1px solid var(--border-default);border-radius:50%;color:var(--action-secondary);font-size:16px}
	.hero-copy{position:relative;z-index:2;width:min(600px,48vw);padding:15px 0 40px;animation:copy-arrive 700ms 120ms cubic-bezier(.2,.75,.25,1) both}
	.eyebrow{margin:0 0 22px;color:var(--action-secondary);font-size:14px;font-weight:750;letter-spacing:.045em}
	.hero-copy h1{max-width:620px;margin:0;color:var(--text-primary);font:520 clamp(64px,5.1vw,78px)/.98 var(--font-display),serif;letter-spacing:-.06em;text-wrap:balance}
	.hero-copy h1 span{display:block;color:var(--action-primary)}
	.summary{max-width:470px;margin:28px 0 25px;color:var(--text-secondary);font-size:clamp(17px,1.55vw,20px);line-height:1.58}
	.hero-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
	.hero-actions a{display:inline-flex;min-height:52px;align-items:center;justify-content:center;gap:22px;padding:0 19px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;transition:transform 180ms ease,background-color 180ms ease}
	.hero-actions a:hover{transform:translateY(-2px)}
	.primary{color:var(--action-on-primary);background:var(--action-primary)}.primary:hover{background:var(--action-primary-hover)}
	.secondary{color:var(--text-primary);border:1px solid var(--border-strong);background:color-mix(in srgb,var(--background-surface) 82%,transparent)}
	:global([data-theme='dark']) .shopping-world{background:var(--illustration-hero-sky)}
	:global([data-theme='dark']) .hero-scene{background:var(--illustration-hero-sky)}
	:global([data-theme='dark']) .hero-scene::after{background:linear-gradient(180deg,var(--illustration-hero-sky),transparent)}
	:global([data-theme='dark']) .hero-copy h1,:global([data-theme='dark']) .summary,:global([data-theme='dark']) .eyebrow{color:var(--illustration-hero-ink)}
	:global([data-theme='dark']) .hero-copy h1 span{color:var(--action-primary)}
	:global([data-theme='dark']) .secondary{color:var(--illustration-hero-ink);border-color:var(--border-strong);background:color-mix(in srgb,var(--background-surface) 88%,transparent)}
	@keyframes world-arrive{from{opacity:.55;transform:scale(1.025)}to{opacity:1;transform:scale(1)}}
	@keyframes copy-arrive{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
	@media(max-width:900px){.shopping-world{min-height:900px;align-items:start;margin-top:-76px;padding:146px 7vw 0}.hero-copy{width:min(760px,88vw);padding-top:38px}.hero-copy h1{font-size:clamp(62px,9vw,96px)}.hero-scene{inset:68% 0 0}.scene-window{inset:0}.scene-caption{bottom:20px;right:24px}}
	@media(max-width:560px){.shopping-world{min-height:920px;margin-top:-72px;padding:132px 22px 0}.hero-copy{width:100%;padding:28px 0 16px}.hero-copy h1{font-size:clamp(44px,13.6vw,68px);line-height:.96}.summary{max-width:380px;margin:19px 0;font-size:16px}.hero-actions{align-items:stretch;flex-direction:column;max-width:340px}.hero-actions a{min-height:50px}.hero-scene{inset:65% 0 0}.scene-caption{right:16px;bottom:15px;font-size:11px}}
	@media(prefers-reduced-motion:reduce){.hero-scene :global(.world-art),.hero-copy{animation:none}.hero-actions a{transition:none}}
</style>
