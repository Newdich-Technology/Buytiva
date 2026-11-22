<script lang="ts">
	import PolicyNotice from '../../lib/components/marketing/PolicyNotice.svelte';
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
</script>

<svelte:head><title>Refund policy | Buytiva</title></svelte:head>
<PublicPageFrame eyebrow="Refunds and cancellations" title="Know what happens when plans change." description="Payment, cancellation and refund terms must match the supported provider and approved operating policy.">
	<PolicyNotice documentName="Buytiva refund and cancellation policy" summary="No refund or cancellation terms are published as final until company and legal approval is complete." reviewAreas={['Which payment methods and transactions are covered', 'How cancellation requests are reviewed', 'Refund eligibility and processing steps', 'Provider timing, reversals and support channels']} />
</PublicPageFrame>
