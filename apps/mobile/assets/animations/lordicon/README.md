# Lordicon animation assets

Licensed Lordicon JSON exports may be checked into this directory when the production download workflow is available. Record each icon name, source page, license type, required attribution, intended screen, and playback state in `asset-manifest.json` before shipping it.

The current implementation uses the official Lordicon CDN through `IconController.network`, recorded in `asset-manifest.json`, so icons stay current without pretending that an unverified binary export was checked into the repository. The reusable player still accepts local assets through `IconController.assets`. Buytiva onboarding combines these animated icons with original Flutter vector artwork.
