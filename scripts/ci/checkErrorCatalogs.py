import json
from pathlib import Path

web = json.loads(Path('apps/web/src/lib/constants/errorCatalog.data.json').read_text())
mobile = json.loads(Path('apps/mobile/assets/config/error_catalog.json').read_text())
# Artwork references are platform-specific. All other contract fields must match.
for catalog in (web, mobile):
    for state in catalog['states']:
        state.pop('lightThemeAsset', None)
        state.pop('darkThemeAsset', None)
if web != mobile:
    raise SystemExit('Web and mobile error contracts differ')
print('Web and mobile error contracts match (excluding platform artwork).')
