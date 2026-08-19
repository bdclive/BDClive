# Task List: Set-and-Forget Auto-Update & Cache-Purge Engine (v10.2.81)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.81_backup.zip`)
- [x] Build `performHardRefreshAndPurgeCache()` with Service Worker unregister and CacheStorage purge
- [x] Integrate 5-second auto-update countdown timer with live badge
- [x] Add cache-busting timestamp reload query param (`?t=${Date.now()}`)
- [x] Update `sw.js` to `CACHE_NAME = 'livecounters-cache-v10.2.81'`
- [x] Update `VERSION.json` and `CHANGELOG.md` to `v10.2.81`
- [x] Synchronize `New.html`, `index.html`, and `web_dashboards/New.html` to `v10.2.81`
- [x] Verify JavaScript syntax with Node.js
- [x] Push live release to `origin` (`bdclive/BDClive`)
