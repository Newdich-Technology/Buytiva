<script lang="ts">
	import PolicyNotice from '../../lib/components/marketing/PolicyNotice.svelte';
	import PublicPageFrame from '../../lib/components/marketing/PublicPageFrame.svelte';
</script>

<svelte:head><title>Privacy | Buytiva</title></svelte:head>
<PublicPageFrame eyebrow="Privacy" title="Your information deserves a clear explanation." description="Buytiva’s privacy information needs to describe data use, retention, sharing and individual choices accurately.">
	<PolicyNotice documentName="Buytiva privacy notice" summary="The privacy notice is awaiting approved company and legal content." reviewAreas={['What information each product flow collects', 'Why the information is used and who can access it', 'Retention, deletion and account choices', 'How cookies, sessions and security storage work']} />
</PublicPageFrame>
