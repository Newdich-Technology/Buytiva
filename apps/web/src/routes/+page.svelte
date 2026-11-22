<svelte:head>
	<title>BUYTIVA Procurement</title>
	<meta name="description" content="BUYTIVA procurement platform." />
</svelte:head>

<main>
	<p class="eyebrow">BUYTIVA / PROCUREMENT</p>
	<h1>Procurement workspace</h1>
	<p class="status"><span aria-hidden="true"></span> Dashboard foundation is ready</p>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #f4f6f5;
		color: #17231e;
		font-family: Georgia, 'Times New Roman', serif;
	}

	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 12vh 32px;
	}

	.eyebrow {
		font: 600 12px/1.4 system-ui, sans-serif;
		letter-spacing: 0.12em;
		color: #416c59;
	}

	h1 {
		max-width: 620px;
		margin: 24px 0;
		font-size: clamp(40px, 7vw, 72px);
		font-weight: 400;
		line-height: 1.02;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 10px;
		font: 15px/1.5 system-ui, sans-serif;
		color: #52635b;
	}

	.status span {
		width: 8px;
		aspect-ratio: 1;
		border-radius: 50%;
		background: #4a9a69;
	}
</style>
