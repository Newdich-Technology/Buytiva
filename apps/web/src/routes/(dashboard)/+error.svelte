<script lang="ts">
  import ErrorCatalog from '../../lib/components/errors/ErrorCatalog.svelte';
  import { resolveBuytivaError } from '../../lib/constants/errorCatalog.js';
  let { error } = $props();
  let status = $derived(error?.status ?? 500);
  let code = $derived(readStableErrorCode(error));
  let stateId = $derived(resolveBuytivaError(code, status).id);

  function readStableErrorCode(value: unknown): string {
    if (typeof value !== 'object' || value === null || !('code' in value)) return '';
    return typeof value.code === 'string' ? value.code : '';
  }
</script>

<ErrorCatalog {stateId} />
