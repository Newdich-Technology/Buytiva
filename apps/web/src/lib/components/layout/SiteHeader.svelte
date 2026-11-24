<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '../design/ThemeToggle.svelte';
	import { ROLE_HOME } from '../../constants/auth.js';
	type Identity = { displayName?: string | null; email?: string; roles?: string[]; currentRole?: string | null; permissions?: string[] };
	let { user = null }: { user?: Identity | null } = $props();
	let menuOpen = $state(false);
	let isScrolled = $state(false);
	let menuToggle: HTMLButtonElement;
	let navigation: HTMLElement;
	let role = $derived(user?.currentRole ?? user?.roles?.[0] ?? null);
	let links = $derived(buildNavigationLinks(user, role));
	let isMarketing = $derived(page.url.pathname === '/');
	function updateScrollState() { isScrolled = window.scrollY > 24; }
	function isActive(href: string) { return href === '/' ? page.url.pathname === '/' : page.url.pathname === href || page.url.pathname.startsWith(`${href}/`); }
	function openMenu() {
		menuOpen = true;
		requestAnimationFrame(() => navigation?.querySelector('a')?.focus());
	}
	function closeMenu(restoreFocus = false) {
		menuOpen = false;
		if (restoreFocus) requestAnimationFrame(() => menuToggle?.focus());
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuOpen) closeMenu(true);
		if (event.key !== 'Tab' || !menuOpen) return;
		const focusable = navigation.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
		const first = focusable.item(0);
		const last = focusable.item(focusable.length - 1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	}
	$effect(() => {
		if (!menuOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = previousOverflow; };
	});
	function buildNavigationLinks(identity: Identity | null, activeRole: string | null) {
		if (!identity || !activeRole) return [{ label: 'How it works', href: '/how-it-works' }, { label: 'Coverage', href: '/coverage' }, { label: 'For procurers', href: '/for-procurers' }, { label: 'FAQs', href: '/faq' }];
		const items = [{ label: 'Overview', href: ROLE_HOME[activeRole] ?? '/overview' }];
		if (activeRole === 'PROCURER') items.push({ label: 'My application', href: '/application' });
		if ((activeRole === 'ADMIN' || activeRole === 'SUPER_ADMIN') && identity.permissions?.includes('procurerApplication.read')) items.push({ label: 'Applications', href: '/procurerApplications' });
		if (activeRole === 'SUPER_ADMIN') items.push({ label: 'Staff', href: '/administrators' }, { label: 'Audit log', href: '/auditLogs' });
		items.push({ label: 'Security', href: '/settings' });
		return items;
	}
</script>


<svelte:window onscroll={updateScrollState} onkeydown={handleKeydown} />
<header class:marketing={isMarketing} class:compact={isScrolled} class:menu-active={menuOpen} class="site-header">
	<div class="header-inner">
		<a class="brand" href="/" aria-label="Buytiva home"><img class="logo-light" src="/brand/buytiva-logo-light.svg" alt="Buytiva" width="288" height="72" /><img class="logo-dark" src="/brand/buytiva-logo-dark.svg" alt="" width="288" height="72" /></a>
		<button bind:this={menuToggle} class="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onclick={() => menuOpen ? closeMenu(true) : openMenu()}><span></span><span></span></button>
		{#if menuOpen}<button class="menu-backdrop" type="button" aria-label="Close navigation" onclick={() => closeMenu(true)}></button>{/if}
		<nav bind:this={navigation} id="main-navigation" class:open={menuOpen} aria-label="Main navigation">
			{#each links as link (link.href)}<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} onclick={() => closeMenu()}>{link.label}</a>{/each}
			<div class="actions"><ThemeToggle />
				{#if user}<span class="identity">{user.displayName ?? user.email}</span><form method="POST" action="/login?/logout"><button class="account" type="submit">Sign out</button></form>
				{:else}<a class="login" href="/login" onclick={() => closeMenu()}>Log in</a><a class="join" href="/register" onclick={() => closeMenu()}>Get started <span aria-hidden="true">↗</span></a>{/if}
			</div>
		</nav>
	</div>
</header>

<style>
	.site-header{position:sticky;top:0;z-index:20;width:100%;padding:10px clamp(10px,2vw,24px);color:var(--text-primary);background:color-mix(in srgb,var(--background-canvas) 88%,transparent);transition:padding var(--motion-fast) var(--motion-easing-standard)}.site-header.marketing:not(.compact){background:transparent}.site-header.compact{padding-top:4px;padding-bottom:4px}.header-inner{position:relative;z-index:2;display:flex;min-height:66px;align-items:center;justify-content:space-between;gap:24px;width:min(1380px,100%);padding:8px clamp(14px,2.5vw,34px);margin:auto;border:1px solid var(--border-default);border-radius:24px;background:var(--background-surface);box-shadow:0 8px 30px color-mix(in srgb,var(--text-primary) 8%,transparent);transition:min-height var(--motion-fast) var(--motion-easing-standard),box-shadow var(--motion-fast) var(--motion-easing-standard),border-radius var(--motion-fast) var(--motion-easing-standard)}.site-header.marketing:not(.compact) .header-inner{border-color:transparent;border-radius:0;background:transparent;box-shadow:none}.site-header.compact .header-inner{min-height:56px;border-radius:18px;box-shadow:0 8px 30px color-mix(in srgb,var(--text-primary) 12%,transparent)}.brand img{display:block;width:140px;height:auto}.brand .logo-dark{display:none}:global([data-theme='dark']) .brand .logo-light{display:none}:global([data-theme='dark']) .brand .logo-dark{display:block}.header-inner nav,.actions{display:flex;align-items:center;gap:clamp(14px,2vw,28px)}nav>a,.login{color:inherit;font-size:13px;font-weight:700;text-decoration:none}nav>a[aria-current=page]{text-decoration:underline;text-decoration-color:var(--action-primary);text-underline-offset:7px}.actions{gap:14px}.actions form{margin:0}.identity{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:12px}.account,.join{display:inline-flex;min-height:44px;align-items:center;justify-content:center;gap:16px;padding:0 16px;border:0;border-radius:999px;color:var(--action-on-primary);background:var(--action-primary);font:inherit;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer}.menu-toggle,.menu-backdrop{display:none}.site-header a:focus-visible,.site-header button:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}
	@media(max-width:820px){.site-header.menu-active{position:fixed;z-index:100;inset:0 0 auto}.header-inner{min-height:60px}.brand img{width:124px}.menu-toggle{position:relative;z-index:3;display:grid;align-content:center;gap:5px;width:42px;height:42px;padding:10px;border:1px solid var(--border-strong);border-radius:50%;color:var(--text-primary);background:var(--background-surface)}.menu-toggle span{height:2px;background:currentColor}.menu-backdrop{position:fixed;inset:0;z-index:1;display:block;width:100%;height:100%;border:0;background:#10132466;backdrop-filter:blur(3px)}.header-inner nav{display:none;position:absolute;top:calc(100% - 2px);left:0;right:0;z-index:2;align-items:stretch;padding:18px;border:1px solid var(--border-default);border-radius:18px;background:var(--background-surface);box-shadow:0 18px 50px #0d142933}.header-inner nav.open{display:grid;gap:15px}.header-inner nav>a{padding:8px 0}.actions{display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border-default)}.identity{display:none}}
	@media(prefers-reduced-motion:reduce){.header-inner{transition:none}}
</style>
