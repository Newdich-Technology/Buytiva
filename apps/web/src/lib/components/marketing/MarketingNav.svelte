<script lang="ts">
  import ThemeToggle from '../design/ThemeToggle.svelte';
  let menuOpen = $state(false);
  const closeMenu = () => menuOpen = false;
</script>

<header class="nav-wrap">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="/" aria-label="Buytiva home"><img class="logo-light" src="/brand/buytiva-logo-light.svg" alt="Buytiva" /><img class="logo-dark" src="/brand/buytiva-logo-dark.svg" alt="" /></a>
    <button class="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onclick={() => menuOpen = !menuOpen}><span></span><span></span></button>
    <div class:open={menuOpen} class="nav-links">
      <a href="/#how" onclick={closeMenu}>How it works</a>
      <a href="/#procurers" onclick={closeMenu}>For procurers</a>
      <a href="/#faqs" onclick={closeMenu}>FAQs</a>
      <div class="nav-actions">
      <ThemeToggle lightOnDark />
      <a class="login" href="/login" onclick={closeMenu}>Log in</a>
      <a class="join" href="/register" onclick={closeMenu}>Get Buytiva <span aria-hidden="true">↗</span>
      </a>
      </div>
    </div>
  </nav>
</header>

<style>
  .nav-wrap { position: absolute; z-index: 5; inset: 0 0 auto; color: var(--text-inverse); }
  .nav { display: flex; align-items: center; justify-content: space-between; max-width: 1440px; min-height: 76px; padding: 12px clamp(20px, 5vw, 76px); margin: auto; }
  .brand img { width: 142px; height: 36px; }.logo-dark { display: none; }
  :global([data-theme='dark']) .logo-light { display: none; }
  :global([data-theme='dark']) .logo-dark { display: block; }
  .nav-links, .nav-actions { display: flex; align-items: center; gap: clamp(18px, 3vw, 42px); }
  .nav-links > a, .login { text-decoration: none; font-size: 14px; font-weight: 600; }
  .nav-links > a:hover, .login:hover { text-decoration: underline; text-underline-offset: 5px; }
  .nav-actions { gap: 18px; }
  .join {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    padding: 0 18px;
    border-radius: 8px;
    background: var(--text-primary);
    color: var(--action-on-secondary);
    text-decoration: none;
    font-weight: 700;
  }
  .menu-toggle { display: none; }
  @media (max-width: 760px) {
    .nav { min-height: 70px; }
    .menu-toggle { display: grid; align-content: center; gap: 5px; width: 46px; height: 46px; padding: 11px; color: var(--text-inverse); border: 1px solid color-mix(in srgb, var(--text-inverse) 44%, transparent); border-radius: 50%; background: transparent; }
    .menu-toggle span { height: 2px; background: currentColor; }
    .nav-links {
      display: none;
      position: absolute;
      inset: 68px 16px auto;
      align-items: stretch;
      padding: 20px;
      border: 1px solid color-mix(in srgb, var(--text-inverse) 20%, transparent);
      border-radius: 20px;
      background: #173fa8;
      box-shadow: 0 18px 50px #0b215b66;
    }
    .nav-links.open { display: flex; flex-direction: column; gap: 20px; }
    .nav-links > a { padding: 9px 0; }
    .nav-actions { justify-content: space-between; gap: 10px; }
  }
</style>
