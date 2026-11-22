import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('apps/web/src/routes');
const routeFiles: Record<string, string> = {
	'/': '+page.svelte', '/how-it-works': 'how-it-works/+page.svelte', '/for-procurers': 'for-procurers/+page.svelte',
	'/for-procurers/apply': 'for-procurers/apply/+page.server.ts', '/for-procurers/application-status': 'for-procurers/application-status/+page.server.ts',
	'/faq': 'faq/+page.svelte', '/about': 'about/+page.svelte', '/contact': 'contact/+page.svelte', '/support': 'support/+page.svelte',
	'/coverage': 'coverage/+page.svelte', '/terms': 'terms/+page.svelte', '/privacy': 'privacy/+page.svelte', '/cookies': 'cookies/+page.svelte',
	'/refund-policy': 'refund-policy/+page.svelte', '/accessibility': 'accessibility/+page.svelte', '/login': '(auth)/login/+page.svelte',
	'/register': 'register/+page.svelte', '/verifyEmail': 'verifyEmail/+page.svelte', '/apply/procurer': 'apply/procurer/+page.svelte',
	'/application/status': 'application/status/+page.svelte', '/dashboard/overview': '(dashboard)/overview/+page.svelte'
};

const missing = Object.entries(routeFiles).filter(([, file]) => !existsSync(resolve(root, file)));
const layout = readFileSync(resolve(root, '+layout.svelte'), 'utf8');
const shellParts = ['SiteHeader', 'SiteFooter', 'CookieConsent'];
const missingShellParts = shellParts.filter((part) => !layout.includes(part));
const removedHero = existsSync(resolve('apps/web/src/lib/components/marketing/WordmarkHero.svelte')) || existsSync(resolve('apps/web/src/lib/styles/wordmarkhero.css'));

if (missing.length || missingShellParts.length || removedHero) {
	for (const [route, file] of missing) console.error(`Missing route ${route}: ${file}`);
	if (missingShellParts.length) console.error(`Root shell missing: ${missingShellParts.join(', ')}`);
	if (removedHero) console.error('Rejected wordmark hero still exists.');
	process.exit(1);
}

console.log(`Web route audit passed: ${Object.keys(routeFiles).length} required routes, shared shell, cookie consent, and rejected hero removal verified.`);
