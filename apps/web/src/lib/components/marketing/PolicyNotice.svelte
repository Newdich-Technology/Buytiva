<script lang="ts">
	let { documentName, summary, reviewAreas = [] }: { documentName: string; summary: string; reviewAreas?: string[] } = $props();
</script>

<article class="policy-notice"><span class="status">Awaiting approved content</span><h2>{documentName}</h2><p>{summary}</p><p>This document has not received company and legal approval. Buytiva is not presenting draft terms or commitments as a final policy.</p>{#if reviewAreas.length}<div class="review-areas"><h3>Topics requiring review</h3><ul>{#each reviewAreas as area (area)}<li>{area}</li>{/each}</ul><p>These are review topics, not published rules or promises.</p></div>{/if}<a href="/support">See available help options</a></article>

<style>
	.policy-notice{max-width:800px;padding:clamp(22px,5vw,42px);border:1px solid var(--border-default);border-radius:22px;background:var(--background-surface)}.status{display:inline-flex;padding:7px 10px;border-radius:999px;color:var(--status-warning-foreground);background:var(--status-warning-surface);font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.policy-notice h2{margin:24px 0 12px;font:700 clamp(26px,4vw,38px)/1.1 var(--font-display),serif;letter-spacing:-.04em}.policy-notice p{color:var(--text-secondary);font-size:16px;line-height:1.7}.policy-notice a{color:var(--action-primary);font-weight:750;text-underline-offset:4px}.review-areas{margin:24px 0;padding:19px;border-radius:15px;background:var(--background-subtle)}.review-areas h3{margin:0;font:700 17px var(--font-display),serif}.review-areas ul{display:grid;gap:9px;padding-left:20px;color:var(--text-secondary);font-size:14px;line-height:1.5}.review-areas p{margin-bottom:0;font-size:12px}
</style>
