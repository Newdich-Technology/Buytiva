import { expect, test } from '@playwright/test';

const widths = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

test('landing renders the real marketing shell and preserves the viewport', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('contentinfo')).toBeVisible();
	for (const width of widths) {
		await page.setViewportSize({ width, height: 900 });
		const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
		expect(sizes.document, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(sizes.viewport);
	}
});

test('mobile navigation opens, exposes links, and closes with Escape', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const toggle = page.getByRole('button', { name: 'Open navigation' });
	await toggle.click();
	await expect(page.getByRole('link', { name: 'How it works' }).first()).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});

test('journey marks stay compact and use a static fallback when motion is reduced', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.locator('.steps').scrollIntoViewIfNeeded();
	const icons = page.locator('.steps h3 svg');
	const quoteMark = page.locator('.steps h3 [aria-label="Quote confirmed"]');
	await expect(icons).toHaveCount(4);
	await expect.poll(() => icons.first().evaluate((icon) => getComputedStyle(icon).width)).toBe('27px');
	await quoteMark.scrollIntoViewIfNeeded();
	await expect(quoteMark.locator('svg')).toHaveAttribute('viewBox', '0 0 48 48');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await page.locator('.steps h3 [aria-label="Quote confirmed"]').scrollIntoViewIfNeeded();
	await expect(page.locator('.steps h3 [aria-label="Quote confirmed"] svg')).toHaveAttribute('viewBox', '0 0 24 24');
});

test('global skip link reaches page content', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to page content' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('#route-content')).toBeFocused();
	await expect(page).toHaveURL(/#route-content$/);
	});

test('theme color follows the selected mode', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.theme-toggle')).toHaveAttribute('data-theme-ready', 'true');
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F2E8D8');
	await page.locator('.theme-toggle').click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#172721');
	await page.goto('/login');
	await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#101827');
});

test('coverage route remains visible when motion is reduced', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/coverage');
	const marker = page.locator('.coverage-world .match-locator');
	const route = page.locator('.coverage-world .match-route');
	await expect(marker).toBeVisible();
	await expect.poll(() => route.evaluate((path) => Number.parseFloat(getComputedStyle(path).strokeDashoffset))).toBe(0);
});
