# Task List: Eliminate Update Refresh Loop & Direct VERSION.json Integration (v10.2.86)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.86_backup.zip`)
- [x] Refactor `checkDirectVersionUpdate()` in `index.html` to query `VERSION.json` (`components.bdclive_web_dashboard.version`) instead of raw markdown parsing
- [x] Add strict loop protection / backoff guard to prevent repeated auto-refresh cycles if reload was already attempted
- [x] Align `CURRENT_APP_VERSION = 'v10.2.86'` across `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Bump `VERSION.json` (`bdclive_web_dashboard.version: 10.2.86`)
- [x] Bump `sw.js` cache name to `livecounters-cache-v10.2.86`
- [x] Update `CHANGELOG.md` with detailed fix explanation
- [x] Push clean release to GitHub `origin main`




