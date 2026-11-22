# Buytiva illustration and motion system

Creator: Oluwayemi Oyinlola.

## Original scene artwork

The Flutter onboarding painter in `apps/mobile/lib/features/onboarding/onboarding_illustration.dart` draws three distinct scenes: a customer list on a phone with fresh produce, a customer-to-procurer location match, and a completed delivery handoff. Each uses the same character proportions and token-derived light or dark palette. Scene entry animates once; the route, check and parcel respond during that entry and settle at a static frame.

The procurer application artwork in `apps/mobile/lib/features/auth/procurer_application_illustration.dart` and the SvelteKit application and tracking pages use form, email verification and status visuals. Application approval appears only when the tracked API response returns `APPROVED`. Submitted applications show email verification, not approval.

Error illustration symbols are grouped by concept using `apps/web/src/lib/constants/errorIllustrations.ts` and `apps/web/static/illustrations/errors/error_scenes.svg`. The Flutter error painter uses the same semantic grouping. Concepts include paper lists, access keys, location routes, clocks, documents, messages, payments, parcels and Buytiva ribbons.

## Motion and accessibility

`BUYTIVA_DESIGN_TOKENS.json` is the source for CSS and Dart motion values. The web marketing scenes use short entrance motion; the Flutter onboarding uses a finite scene controller. Both respect reduced motion. Flutter checks platform accessibility features and SvelteKit honors `prefers-reduced-motion`.

`BuytivaLordicon` and `BuytivaLordicon.svelte` wrap the official player libraries. Use local licensed Lottie JSON only. Increment `playKey` after the confirming API result for a business event; do not animate pending, failed, or unverified outcomes as success. Local icon manifests currently contain no licensed icon files, so there is no Lordicon inventory in active screens yet.

## Validation

Svelte checks and build validate the web components and asset paths. Headless Chromium screenshots were inspected at 390×844 and 1440×1100. The phone preview contrast was corrected after that review. Flutter and Dart are unavailable in this environment, so native rendering, widget tests, device-size checks, memory profiling and animation performance remain unverified.
