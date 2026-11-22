<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '../design/ThemeToggle.svelte';
	import { ROLE_HOME } from '../../constants/auth.js';
	import '../../styles/site-header.css';

	type Identity = { displayName?: string | null; email?: string; roles?: string[]; currentRole?: string | null; permissions?: string[] };
	let { user = null }: { user?: Identity | null } = $props();
	let menuOpen = $state(false);
	let isScrolled = $state(false);
	let role = $derived(user?.currentRole ?? user?.roles?.[0] ?? null);
	let links = $derived(buildLinks(user, role));

	function updateScrollState() { isScrolled = window.scrollY > 24; }
	function closeMenu() { menuOpen = false; }
	function isActive(href: string) { return href === '/' ? page.url.pathname === '/' : page.url.pathname === href || page.url.pathname.startsWith(`${href}/`); }
	function buildLinks(identity: Identity | null, activeRole: string | null) {
		if (!identity || !activeRole) return [
			{ label: 'How it works', href: '/how-it-works' }, { label: 'Find a procurer', href: '/coverage' },
			{ label: 'For procurers', href: '/for-procurers' }, { label: 'FAQ', href: '/faq' }
		];
		const items = [{ label: 'Overview', href: ROLE_HOME[activeRole] ?? '/overview' }];
		if (activeRole === 'PROCURER') items.push({ label: 'Application', href: '/application' });
		if (identity.permissions?.includes('procurerApplication.read')) items.push({ label: 'Applications', href: '/procurerApplications' });
		if (identity.permissions?.includes('admin.staff.read')) items.push({ label: 'Staff access', href: '/administrators' });
		if (identity.permissions?.includes('audit.read')) items.push({ label: 'Audit log', href: '/auditLogs' });
		items.push({ label: 'Security', href: '/settings' });
		return items;
	}
</script>

<svelte:window onscroll={updateScrollState} />
<header class:compact={isScrolled} class="site-header">
	<div class="header-inner">
		<a class="brand" href="/" aria-label="Buytiva home"><img class="logo-light" src="/brand/buytiva-logo-light.svg" alt="Buytiva" /><img class="logo-dark" src="/brand/buytiva-logo-dark.svg" alt="" /></a>
		<button class="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onclick={() => menuOpen = !menuOpen}><span></span><span></span></button>
		<nav class:open={menuOpen} aria-label="Main navigation">
			<div class="nav-links">{#each links as link (link.href)}<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} onclick={closeMenu}>{link.label}</a>{/each}</div>
			<div class="actions"><ThemeToggle />{#if user}<span class="identity">{user.displayName ?? user.email}</span><form method="POST" action="/login?/logout"><button class="logout" type="submit">Log out</button></form>{:else}<a class="login-link" href="/login" onclick={closeMenu}>Log in</a><a class="join-link" href="/register" onclick={closeMenu}>Get started <span aria-hidden="true">↗</span></a>{/if}</div>
		</nav>
	</div>
</header>
