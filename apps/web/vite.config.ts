import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })],
	server: { host: process.env.BUYTIVA_WEB_DEV_HOST ?? 'localhost' },
	preview: { host: process.env.BUYTIVA_WEB_PREVIEW_HOST ?? 'localhost' }
});
