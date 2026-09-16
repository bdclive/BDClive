# Task List: Google Tasks Instant Load & Tab Focus Live Sync (BDClive v10.2.136)

- [x] Phase 1: Planning & Pre-Modification Backup
  - [x] Clean house and purge older backup (strictly retain current + last)
  - [x] Create project backup `BDClive_frontend_backup_*.zip`
- [x] Phase 2: Frontend Implementation (v10.2.136)
  - [x] Implement initial auto-sync on dashboard load (1.5s delay)
  - [x] Implement tab focus auto-sync on `visibilitychange` (45s throttle)
  - [x] Shorten periodic foreground auto-sync interval from 150s to 60s
  - [x] Synchronize 100% byte-identical SHA-256 parity across `index.html`, `New.html`, and `web_dashboards/New.html`
  - [x] Bump `sw.js` cache name to `livecounters-cache-v10.2.136`
  - [x] Bump `VERSION.json` to `10.2.136`
  - [x] Update `CHANGELOG.md` with App Store style bullet points (strict $\le 10$ words)
- [x] Phase 3: Automated Verification & Testing
  - [x] Run automated Headless Chrome verification suite (`verify_tasks_instant_sync.js` - 100% passed)
# Task List: Google Tasks Instant Load & Tab Focus Live Sync (BDClive v10.2.136)

- [x] Phase 1: Planning & Pre-Modification Backup
  - [x] Clean house and purge older backup (strictly retain current + last)
  - [x] Create project backup `BDClive_frontend_backup_*.zip`
- [x] Phase 2: Frontend Implementation (v10.2.136)
  - [x] Implement initial auto-sync on dashboard load (1.5s delay)
  - [x] Implement tab focus auto-sync on `visibilitychange` (45s throttle)
  - [x] Shorten periodic foreground auto-sync interval from 150s to 60s
  - [x] Synchronize 100% byte-identical SHA-256 parity across `index.html`, `New.html`, and `web_dashboards/New.html`
  - [x] Bump `sw.js` cache name to `livecounters-cache-v10.2.136`
  - [x] Bump `VERSION.json` to `10.2.136`
  - [x] Update `CHANGELOG.md` with App Store style bullet points (strict $\le 10$ words)
- [x] Phase 3: Automated Verification & Testing
  - [x] Run automated Headless Chrome verification suite (`verify_tasks_instant_sync.js` - 100% passed)
  - [x] Assert static SHA-256 parity across all 3 dashboard files
  - [x] Assert initial auto-sync triggers on load and updates DOM
  - [x] Assert tab focus triggers sync
  - [x] Assert `#task-k1` matches on-screen sum dynamically
  - [x] Assert 0 fatal console errors and 0 unhandled promise rejections
  - [x] Assert zero horizontal overflow across mobile, tablet, and desktop
- [x] Phase 4: Commit, Deployment & Cleanup
  - [x] Git commit with version number title and multi-line mini summary
  - [x] Git push to `origin main`
  - [x] Mandatory task closure and process cleanup protocol
