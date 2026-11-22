# Lordicon registry

Creator: Oluwayemi Oyinlola.

The SvelteKit application registers the official `@lordicon/element` custom element once in `src/hooks.client.ts`. `BuytivaLordicon.svelte` resolves the shared semantic registry, supports official CDN Lottie sources, accessible labels, dimensions, trigger/state selection, reduced motion, a static slot fallback and explicit replay through `playKey`.

Flutter uses the official `lordicon` package. `BuytivaLordicon` selects `IconController.network` for the same official CDN sources or `IconController.assets` for a future approved local export. It owns controller listener cleanup, responds to reduced motion, and accepts a static fallback plus an explicit `playKey`.

The current set uses free System icons from Lordicon: cart, check, directions, home, location, magnifier, spinner, star/theme, and warning. Source pages, CDN URLs, and license metadata are recorded in the web and mobile registries. The web footer includes the required Lordicon attribution link. No Pro-only icon is bundled.

Original Buytiva SVG illustrations remain separate from Lordicon and are used for larger product storytelling. They have their own low-amplitude animation and reduced-motion rules.

Official guidance reviewed in full: [Lordicon best practices](https://lordicon.com/docs/best-practices), [web](https://lordicon.com/docs/web), and [Flutter](https://lordicon.com/docs/flutter). The applied motion decisions are documented in `docs/frontend/lordiconBestPractices.md`.
