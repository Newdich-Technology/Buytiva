<script lang="ts">
	import { revealOnScroll } from '../../actions/revealOnScroll.js';
	import ThemeIllustration from './ThemeIllustration.svelte';
</script>

<footer class="buytiva-footer">
	<section class="footer-callout" aria-labelledby="footer-title">
		<div class="footer-copy" data-scroll-reveal="copy" use:revealOnScroll><p class="eyebrow">A simpler way to shop</p><h2 id="footer-title">Your list is<br />in good hands.</h2><a href="/register">Get started <span aria-hidden="true">↗</span></a></div>
		<div class="footer-art" data-scroll-reveal="art" use:revealOnScroll><ThemeIllustration class="footer-scene" scene="world" alt="A customer and local procurer meet in the Buytiva neighborhood shopping world." /></div>
	</section>
	<div class="footer-base" data-scroll-reveal-group>
		<div class="footer-brand-group" data-scroll-reveal="copy" use:revealOnScroll><a class="footer-brand" href="/" aria-label="Buytiva home"><img src="/brand/buytiva-logo-light.svg" alt="Buytiva" /><img src="/brand/buytiva-logo-dark.svg" alt="" /></a><p>Local know-how, right where you need it.<br />A Newdich product.</p></div>
		<nav class="link-column" data-scroll-reveal="copy" use:revealOnScroll aria-label="Explore"><b>Explore</b><a href="/how-it-works">How it works</a><a href="/for-procurers">For procurers</a><a href="/coverage">Coverage</a><a href="/faq">Frequently asked</a></nav>
		<nav class="link-column" data-scroll-reveal="copy" use:revealOnScroll aria-label="Your account"><b>Your account</b><a href="/register">Create account</a><a href="/login">Log in</a><a href="/apply/procurer">Apply as a procurer</a><a href="/application/status">Track an application</a></nav>
		<nav class="link-column" data-scroll-reveal="copy" use:revealOnScroll aria-label="Company and policies"><b>Company</b><a href="/about">About Buytiva</a><a href="/contact">Contact</a><a href="/support">Support</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/refund-policy">Refund policy</a><a href="/accessibility">Accessibility</a><a href="/cookies">Cookie preferences</a></nav>
	</div>
	<div class="word-band" data-scroll-reveal="copy" use:revealOnScroll aria-hidden="true">BUYTIVA</div><div class="copyright" data-scroll-reveal="copy" use:revealOnScroll><span>© {new Date().getFullYear()} Buytiva, a Newdich product.</span><a href="#top">Back to top ↑</a></div>
</footer>
