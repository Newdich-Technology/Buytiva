<script lang="ts">
	import ThemeIllustration from '../../../lib/components/marketing/ThemeIllustration.svelte';
	let { form } = $props();
	let step = $state(0);
	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let proposedCountry = $state('');
	let proposedRegion = $state('');
	let proposedCity = $state('');
	let proposedArea = $state('');
	let categories = $state('');
	let experience = $state('');
	let consentAccepted = $state(false);
	let stepError = $state('');
	const steps = ['About you', 'Service area', 'Experience', 'Review'];
	function nextStep() {
		const invalid = step === 0 ? !firstName.trim() || !lastName.trim() || !email.includes('@') || phone.trim().length < 7
			: step === 1 ? proposedCountry.trim().length < 2 || !proposedCity.trim()
			: step === 2 ? !categories.split(',').some((category) => category.trim()) : false;
		if (invalid) { stepError = 'Complete the required fields with valid details to continue.'; return; }
		stepError = '';
		step = Math.min(step + 1, steps.length - 1);
	}
	function previousStep() { stepError = ''; step = Math.max(step - 1, 0); }
</script>

<svelte:head><title>Apply as a procurer | BUYTIVA</title></svelte:head>
<main class="application">
	<div class="intro"><p class="eyebrow">Independent procurers</p><h1>Make everyday shopping easier in your community.</h1><p>Tell us where you work and what you know. Our team reviews each application before access is granted.</p><div class="art" aria-hidden="true"><ThemeIllustration class="application-art" scene="market" /></div></div>
	<section class="form-panel" aria-label="Procurer application">
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		{#if form?.submitted}
			<div class="submitted" role="status"><p class="eyebrow">EMAIL VERIFICATION</p><h2>Application received</h2><p>Verify your email before review begins. Your tracking reference is:</p><strong class="reference">{form.reference}</strong><a class="button" href="/apply/procurer/verify?email={encodeURIComponent(email)}&challengeId={encodeURIComponent(form.challengeId)}">Verify your email</a></div>
		{:else}
			<div class="progress"><div class="progress-copy"><span>STEP {step + 1} OF {steps.length}</span><strong>{steps[step]}</strong></div><div class="segments" role="progressbar" aria-valuemin="1" aria-valuemax={steps.length} aria-valuenow={step + 1}>{#each steps as label, index}<span class:active={index <= step} aria-label={label}></span>{/each}</div></div>
			{#if stepError}<p class="error" role="alert">{stepError}</p>{/if}
			{#if step === 0}<div class="step"><h2>Let’s start with you</h2><p>We use these details to contact you about the application.</p><div class="fields"><label>First name<input bind:value={firstName} name="firstName" autocomplete="given-name" maxlength="80" required /></label><label>Last name<input bind:value={lastName} name="lastName" autocomplete="family-name" maxlength="80" required /></label><label>Email<input bind:value={email} name="email" type="email" autocomplete="email" required /></label><label>Phone<input bind:value={phone} name="phone" type="tel" autocomplete="tel" minlength="7" maxlength="32" required /></label></div></div>
			{:else if step === 1}<div class="step"><h2>Where do you serve?</h2><p>Start with your main service area. Coverage can be reviewed with our team.</p><div class="fields"><label>Country<input bind:value={proposedCountry} name="proposedCountry" autocomplete="country-name" minlength="2" maxlength="80" required /></label><label>State or region <span>Optional</span><input bind:value={proposedRegion} name="proposedRegion" maxlength="80" /></label><label>City<input bind:value={proposedCity} name="proposedCity" autocomplete="address-level2" maxlength="80" required /></label><label>Neighborhood or area <span>Optional</span><input bind:value={proposedArea} name="proposedArea" maxlength="80" /></label></div></div>
			{:else if step === 2}<div class="step"><h2>What can you help people find?</h2><p>List the shopping categories you know well, separated by commas.</p><label>Categories<input bind:value={categories} name="categories" placeholder="Groceries, home essentials" required /></label><label>Relevant experience <span>Optional</span><textarea bind:value={experience} name="experience" maxlength="1000" rows="4"></textarea></label></div>
			{:else}<div class="step"><h2>Review your application</h2><p>Make sure your details are correct before submitting.</p><dl><dt>Name</dt><dd>{firstName} {lastName}</dd><dt>Contact</dt><dd>{email} · {phone}</dd><dt>Service area</dt><dd>{[proposedArea, proposedCity, proposedRegion, proposedCountry].filter(Boolean).join(', ')}</dd><dt>Categories</dt><dd>{categories}</dd></dl><label class="consent"><input bind:checked={consentAccepted} type="checkbox" name="consentAccepted" required /> I consent to identity and compliance review.</label></div>{/if}
			<div class="actions">{#if step > 0}<button class="back" type="button" onclick={previousStep}>Back</button>{/if}{#if step < steps.length - 1}<button class="primary" type="button" onclick={nextStep}>Continue</button>{:else}<form method="POST"><input type="hidden" name="email" value={email}/><input type="hidden" name="firstName" value={firstName}/><input type="hidden" name="lastName" value={lastName}/><input type="hidden" name="phone" value={phone}/><input type="hidden" name="proposedCountry" value={proposedCountry}/><input type="hidden" name="proposedRegion" value={proposedRegion}/><input type="hidden" name="proposedCity" value={proposedCity}/><input type="hidden" name="proposedArea" value={proposedArea}/><input type="hidden" name="categories" value={categories}/><input type="hidden" name="experience" value={experience}/><input type="hidden" name="consentAccepted" value={consentAccepted ? 'on' : ''}/><button class="primary" disabled={!consentAccepted}>Submit application</button></form>{/if}</div>
		{/if}
	</section>
</main>

<style>
	.application{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,.92fr);gap:clamp(32px,7vw,100px);align-items:center;width:min(1180px,calc(100% - 40px));margin:60px auto;color:var(--text-primary)}.intro{position:relative}.eyebrow{color:var(--action-primary);font-size:11px;font-weight:850;letter-spacing:.13em}.intro h1{max-width:620px;margin:12px 0;font:800 clamp(38px,5vw,68px)/.99 var(--font-display),serif;letter-spacing:-.055em}.intro>p:not(.eyebrow){max-width:480px;color:var(--text-secondary);font-size:17px;line-height:1.6}.art{height:280px;margin-top:22px;border-radius:28px;background:var(--illustration-hero-ground);overflow:hidden}.form-panel{padding:clamp(22px,3vw,36px);border:1px solid var(--border-default);border-radius:24px;background:var(--background-surface);box-shadow:0 22px 70px #21274612}.progress{display:grid;gap:12px;margin-bottom:30px}.progress-copy{display:flex;justify-content:space-between;gap:14px;color:var(--text-secondary);font-size:12px}.progress-copy span{font-weight:800;letter-spacing:.08em}.progress-copy strong{color:var(--text-primary)}.segments{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.segments span{height:5px;border-radius:5px;background:var(--border-default)}.segments span.active{background:var(--action-primary)}.step h2{margin:0;font-size:25px}.step>p{margin:6px 0 22px;color:var(--text-secondary);line-height:1.5}.fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}label{display:grid;gap:7px;margin:0 0 16px;font-size:13px;font-weight:700}label span{color:var(--text-muted);font-size:11px;font-weight:500}input:not([type=checkbox]),textarea{width:100%;min-height:47px;padding:11px 12px;border:1px solid var(--border-strong);border-radius:10px;color:var(--text-primary);background:var(--background-canvas);font:inherit}textarea{resize:vertical}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.actions form{margin:0}.primary,.back,.button{display:inline-flex;min-height:46px;align-items:center;justify-content:center;padding:0 18px;border:0;border-radius:10px;font-weight:750;text-decoration:none;cursor:pointer}.primary,.button{color:var(--action-on-primary);background:var(--action-primary)}.primary:disabled{opacity:.55;cursor:not-allowed}.back{border:1px solid var(--border-default);color:var(--text-primary);background:transparent}.consent{display:flex;align-items:center;gap:9px;line-height:1.5}.consent input{width:18px;height:18px}.step dl{display:grid;grid-template-columns:110px 1fr;gap:9px 14px}.step dt{color:var(--text-muted);font-size:13px}.step dd{margin:0;font-size:14px;font-weight:650;overflow-wrap:anywhere}.submitted{display:grid;gap:14px}.submitted h2{margin:0;font-size:32px}.reference{padding:12px;border-radius:10px;background:var(--background-canvas);font-size:20px;letter-spacing:.06em}.button{justify-self:start}.error{color:var(--status-error-foreground)}
	@media(max-width:850px){.application{grid-template-columns:1fr;max-width:620px;margin:34px auto}.intro h1{font-size:clamp(36px,9vw,54px)}.art{height:200px}.form-panel{padding:22px}}
	@media(max-width:480px){.application{width:calc(100% - 28px);margin:24px auto}.fields{grid-template-columns:1fr;gap:0}.intro>p:not(.eyebrow){font-size:15px}.form-panel{padding:18px}.step dl{grid-template-columns:88px 1fr}}
	.art :global(.application-art){width:100%;height:100%}
</style>
