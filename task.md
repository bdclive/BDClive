# Task List: Central Command Live Heartbeat & Offline Watchdog (v10.2.91)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.91_backup.zip`)
- [x] Implement Central Command Heartbeat Watchdog Engine in `index.html`:
  - Track last telemetry timestamp from Central Command updates
  - 10-second polling monitor evaluating Online (<3.5m), Stale (3.5-10m), Offline (>10m)
  - Firebase `.info/connected` offline internet detector
  - Dynamic status beacons on `#gk-sync-pulse` and `#ticket-live-beacon`
  - Tooltips with exact "Last seen / Synced Xs ago" calculations
- [x] Synchronize `CURRENT_APP_VERSION = 'v10.2.91'` across `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Bump `VERSION.json` (`bdclive_web_dashboard.version: 10.2.91`)
- [x] Bump `sw.js` cache name to `livecounters-cache-v10.2.91`
- [x] Update `CHANGELOG.md` with 10-word punchy release notes
- [x] Commit and push to GitHub (`origin main`)












