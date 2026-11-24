<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { readThemePreference, resolveThemePreference, saveThemePreference } from '../../utils/themePreference.js';
  let { lightOnDark = false }: { lightOnDark?: boolean } = $props();
  let mode = $state<'system' | 'light' | 'dark'>('system');
  let dark = $state(false);
  let ready = $state(false);

  onMount(() => {
    try {
      mode = readThemePreference(localStorage) ?? 'system';
    } catch {
      mode = 'system';
    }
    applyTheme();
    ready = true;
    const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (mode === 'system') applyTheme();
    };
    colorPreference.addEventListener('change', handleSystemThemeChange);
    return () => colorPreference.removeEventListener('change', handleSystemThemeChange);
  });

  function applyTheme() {
    const resolved = resolveThemePreference(mode, window.matchMedia('(prefers-color-scheme: dark)').matches);
    dark = resolved === 'dark';
    document.documentElement.dataset.theme = resolved;
    updateThemeColor();
    try {
      saveThemePreference(localStorage, mode);
    } catch {
      mode = 'system';
    }
  }

  function toggleTheme() {
    mode = mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system';
    applyTheme();
  }

  function updateThemeColor() {
    const darkMode = document.documentElement.dataset.theme === 'dark';
    const color = page.url.pathname === '/' ? (darkMode ? '#172721' : '#F2E8D8') : (darkMode ? '#101827' : '#FBF8F1');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }

  $effect(() => {
    if (ready) updateThemeColor();
  });
</script>

<button class:light-on-dark={lightOnDark} class="theme-toggle" type="button" aria-label={`Theme ${mode}; activate to change`} data-theme-ready={ready} onclick={toggleTheme}>
  <span aria-hidden="true">{mode === 'system' ? '◐' : dark ? '☼' : '☾'}</span>
</button>

<style>
  .theme-toggle { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--border-default); border-radius: 50%; color: var(--text-primary); background: var(--background-surface); cursor: pointer; font-size: 20px; }
  .theme-toggle:hover { border-color: var(--action-primary); transform: rotate(8deg); }
  .theme-toggle.light-on-dark { border-color: #ffffff55; color: #fff; background: transparent; }
</style>
