# Task List: Google Tasks Live Sync & Dashboard Total Calibration

## Live Tasks Sync Engine & On-Screen Total Calibration
- [x] Project backup with strict 2-backup retention (`BDClive_frontend_backup_*.zip` & `BDC_Central_Command_backup_*.zip`)
- [x] Central Command Engine Upgrade (`v1.1.16`):
  - [x] Integrated automated 60-second Google Tasks background sync loop (`TASKS_SYNC_INTERVAL = 60`)
  - [x] Added `[📋 Sync Google Tasks with Firebase Now]` to `⚙️ Settings ▾` menu
  - [x] Executed Central Command Clean House protocol (desktop shortcuts, batch launchers, transfer package)
- [x] BDClive Web Dashboard Upgrade (`v10.2.135`):
  - [x] Added interactive one-click `[🔄 Sync]` button with spin animation to `#tasks-box` and modal
  - [x] Calibrated hero counter `#task-k1` to strictly sum the 6 categories on screen (DivaCox, Update, BriansTheater, My Tasks, BDCF Crew, WOS)
  - [x] Added real-time relative sync age badge (`● Live`, `● Just now`, `● 2m ago`)
  - [x] Added 2.5-minute automatic tab refresh interval in frontend
  - [x] Synchronized 100% byte-identical SHA-256 parity across `index.html`, `New.html`, and `web_dashboards/New.html`
  - [x] Bumped `sw.js` cache to `livecounters-cache-v10.2.135`
  - [x] Updated `VERSION.json` (`web: 10.2.135`, `cc: 1.1.16`)
- [x] Updated `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Ran automated pre-delivery verification suite (`verify_tasks_live_sync.js` - 100% passed across all checks)
- [x] Commit and push to GitHub (`origin main`)
- [x] Mandatory task closure and process cleanup protocol
