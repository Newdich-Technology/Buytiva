import type { Action } from 'svelte/action';
import { SCROLL_REVEAL_ROOT_MARGIN, SCROLL_REVEAL_THRESHOLD } from '../constants/motion.js';

export const revealOnScroll: Action<HTMLElement> = (node) => {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
		node.dataset.revealed = 'true';
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		if (!entries.some((entry) => entry.isIntersecting)) return;
		node.dataset.revealed = 'true';
		observer.unobserve(node);
	}, { rootMargin: SCROLL_REVEAL_ROOT_MARGIN, threshold: SCROLL_REVEAL_THRESHOLD });

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
};
