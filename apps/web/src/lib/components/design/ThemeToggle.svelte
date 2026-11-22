<script lang="ts">
  import { onMount } from 'svelte';
  import { THEME_PREFERENCE_STORAGE_KEY } from '../../constants/cookieConsent.js';
  import { hasFunctionalStorageConsent } from '../../utils/cookiePreferences.js';
  import BuytivaLordicon from './BuytivaLordicon.svelte';
  let { lightOnDark = false }: { lightOnDark?: boolean } = $props();
  let mode = $state<'system' | 'light' | 'dark'>('system');
  let dark = $state(false);

  onMount(() => {
    const savedTheme = getSavedTheme();
    mode = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system';
    dark = mode === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : mode === 'dark';
    applyTheme();
  });

  function applyTheme() {
    const resolved = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
    dark = resolved === 'dark';
    document.documentElement.dataset.theme = resolved;
    try {
      if (mode === 'system' || !hasFunctionalStorageConsent(localStorage)) localStorage.removeItem(THEME_PREFERENCE_STORAGE_KEY);
      else localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, mode);
    } catch {
      mode = 'system';
    }
  }

  function getSavedTheme(): string | null {
    try {
      return hasFunctionalStorageConsent(localStorage) ? localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY) : null;
    } catch {
      return null;
    }
  }

  function toggleTheme() {
    mode = mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system';
    applyTheme();
  }
</script>

<button class:light-on-dark={lightOnDark} class="theme-toggle" type="button" aria-label={`Theme ${mode}; activate to change`} onclick={toggleTheme}>
  <BuytivaLordicon name="theme" width={22} height={22} animationState="hover-pinch" label="" />
</button>

<style>
  .theme-toggle { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--border-default); border-radius: 50%; color: var(--text-primary); background: var(--background-surface); cursor: pointer; font-size: 20px; }
  .theme-toggle:hover { border-color: var(--action-primary); transform: rotate(8deg); }
  .theme-toggle.light-on-dark { border-color: #ffffff55; color: #fff; background: transparent; }
</style>
