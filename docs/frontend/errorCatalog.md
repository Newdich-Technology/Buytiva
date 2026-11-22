# Buytiva shared error catalog

`BUYTIVA_ERROR_CATALOG.json` defines 29 shared error and empty-state concepts. The web adapter imports the catalog and resolves a stable code before falling back to HTTP status. Flutter loads the same JSON asset and resolves the same fields. Both clients provide a generic branded fallback for unknown failures.

Web provides a reusable error panel with safe recovery actions. Flutter provides a reusable panel and native action callbacks. Field-validation errors remain in forms. The illustrated `lost_list` scene is supplied in light and dark source/export variants; remaining catalog-specific illustrations should be authored before they are shown as complete art.
