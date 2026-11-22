# Lordicon motion and iconography notes

Reviewed the complete Lordicon best-practices page on 2026-11-22:
<https://lordicon.com/docs/best-practices>

## Decisions applied in Buytiva

- Keep one coherent system family for UI icons: System solid/outline Lordicons with a restrained Buytiva color palette.
- Use icons as visual reinforcement, never as a replacement for a text label. Action controls keep visible text labels and accessible names.
- Use hover, focus, click, and in-view triggers for purposeful feedback. Do not continuously loop dashboard or navigation icons.
- Reserve looping motion for loading/progress indicators, and respect `prefers-reduced-motion` with a static fallback.
- Keep click micro-interactions short and hover motion restrained. Decorative illustration motion is slow and low-amplitude.
- Avoid flashes, flicker, extreme scale changes, or movement that fights the meaning of the icon.
- Keep small controls at a minimum 44–48px touch target even when the visible icon is smaller.
- Use alt text or an accessible label when an icon carries meaning; hide decorative icons from assistive technology when adjacent text already names the action.
- Keep icon style, color, scale, animation type, and meaning consistent across web and Flutter.
- The page specifically recommends simpler System icons for small controls and more expressive illustration/icon treatments at larger sizes. Buytiva follows that distinction: Lordicons handle UI affordances while original Buytiva SVG scenes handle product storytelling.

## Sources and delivery

The web registry is `apps/web/src/lib/constants/lordiconRegistry.ts` and uses official Lordicon CDN Lottie sources. Flutter uses the same source registry in `apps/mobile/lib/core/design_system/lordicon_sources.dart` through `IconController.network`, with static fallback behavior when motion is reduced or the network asset is unavailable.

The active icon set is recorded with source pages and free-plan metadata in the registry. Attribution is retained in the large web footer as “Animated icons by Lordicon.com.” Pro-only assets are not used.

The existing original Buytiva illustrations remain Buytiva-owned artwork. They are animated with restrained SVG/CSS motion and are not represented as Lordicon assets.
