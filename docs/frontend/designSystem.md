# Buytiva design system

`BUYTIVA_DESIGN_TOKENS.json` is the canonical token manifest. Run `pnpm design:tokens` to generate CSS custom properties and Flutter color constants. The app stylesheet imports the generated CSS; Flutter themes consume generated values.

The brand uses a blue, coral and lime Ribbon Pulse, Space Grotesk display lettering and a neutral sans body. Light and dark semantic colors are generated independently. Bright accents are reserved for actions, illustration, and status; order and money layouts retain compact, high-contrast surfaces.

The web theme control cycles system, light, and dark modes and persists explicit choices. Marketing artwork is original CSS/SVG illustration. Mobile onboarding uses native vector-like shapes and Material symbols. Motion follows reduced-motion preferences in CSS and uses finite page transitions in Flutter.

Lordicon is not bundled in this frontend phase. No Lordicon asset license or downloaded icon collection is present in the repository; add licensed assets and attribution before enabling the player. System controls remain static and accessible.
