# Lordicon registry

Creator: Oluwayemi Oyinlola.

The SvelteKit application registers the official `@lordicon/element` custom element once in `src/hooks.client.ts`. `BuytivaLordicon.svelte` supports a local JSON source, an accessible label, dimensions, trigger/state selection, reduced motion, a static slot fallback and explicit replay through `playKey`.

Flutter uses the official `lordicon` package. `BuytivaLordicon` wraps `IconController.assets` and `IconViewer`, owns controller listener cleanup, responds to reduced motion, and accepts a static fallback plus an explicit `playKey`.

No Lordicon JSON or static icon exports are bundled. Free icons require attribution and authenticated account downloads; each file must have an entry in the web and mobile `static/icons` or `assets/animations/lordicon` manifest before use. The asset manifests are empty until the individual icons and their license/attribution are recorded. Existing Buytiva artwork is original and is not represented as Lordicon.

Official implementation guidance: [Lordicon web](https://lordicon.com/docs/web), [Flutter](https://lordicon.com/docs/flutter), [best practices](https://lordicon.com/docs/best-practices), and [animation](https://lordicon.com/docs/animation).
