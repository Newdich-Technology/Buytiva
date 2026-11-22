import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const routesDirectory = resolve('apps/web/src/routes');
const routeEntryFiles = findRouteEntryFiles(routesDirectory);
const routePages = routeEntryFiles.filter((file) => /\+page\.(svelte|ts|js)$/.test(file));
const rootLayout = readFileSync(resolve(routesDirectory, '+layout.svelte'), 'utf8');
const requiredShellComponents = ['SiteHeader', 'SiteFooter', 'CookieConsent'];
const missingShellComponents = requiredShellComponents.filter((component) => !rootLayout.includes(component));
const oldHeroExists = [
	'apps/web/src/lib/components/marketing/WordmarkHero.svelte',
	'apps/web/src/lib/styles/wordmarkhero.css'
].some((file) => {
	try {
		readFileSync(resolve(file));
		return true;
	} catch {
		return false;
	}
});

if (!routePages.length || missingShellComponents.length || oldHeroExists) {
	if (!routePages.length) console.error('No SvelteKit page entry files were discovered.');
	if (missingShellComponents.length) console.error(`Root shell missing: ${missingShellComponents.join(', ')}`);
	if (oldHeroExists) console.error('Rejected wordmark hero still exists.');
	process.exit(1);
}

console.log(`Discovered ${routePages.length} page routes and ${routeEntryFiles.length} route entry files.`);
console.log('Root shell components and rejected hero removal verified.');

function findRouteEntryFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) return findRouteEntryFiles(path);
		return /^\+(page|layout|error)\.(svelte|ts|js)$/.test(entry.name) ? [relative(routesDirectory, path).split(sep).join('/')] : [];
	});
}
