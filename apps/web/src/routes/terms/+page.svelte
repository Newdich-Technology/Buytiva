<script lang="ts">
	import PolicyNotice from '../../lib/components/marketing/PolicyNotice.svelte';
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
</script>

<svelte:head><title>Terms | Buytiva</title></svelte:head>
<PublicPageFrame eyebrow="Terms of service" title="Clear terms, before you use Buytiva." description="Terms must explain how customers, procurers and Newdich work together.">
	<PolicyNotice documentName="Buytiva terms of service" summary="The terms of service are awaiting approved company and legal content." reviewAreas={['Customer and procurer eligibility and responsibilities', 'Application review, approval and account access', 'Service availability, quotes and order changes', 'Payments, cancellations and dispute handling when enabled']} />
</PublicPageFrame>
