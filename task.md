# Task List: BDC Central Command Version Bump to v1.1.01

## 📋 Active Tasks: Central Command Version Bump (v1.1.01)
- [x] Create backup archive (`backups/BDC_Central_Command_v1.1.00_pre_v1.1.01_*.zip`)
- [x] Bump Central Command script to `BDC_Central_Command_GUI_v1.1.01.pyw`:
  - Update internal version strings from `v1.1.00` to `v1.1.01` (window title, headers, logs, tray icon, runner metadata)
  - Purge superseded `BDC_Central_Command_GUI_v1.1.00.pyw` in `BDC_Central_Command/`
- [x] Update version registry `VERSION.json`:
  - Bump `bdc_central_command_desktop` to `1.1.01`
- [x] Update `CHANGELOG.md`:
  - Add App Store style release notes for `[1.1.01]` with strict <= 10 words per bullet
- [x] Execute Central Command Clean House Protocol across local and network targets:
  - Deploy `BDC_Central_Command_GUI_v1.1.01.pyw` to Desktop (`C:\Users\Brian\OneDrive\Desktop\BDC Central Command\`)
  - Purge superseded `v1.1.00.pyw` and any older versions from Desktop folder
  - Flush all stale `__pycache__` bytecode folders
  - Synchronize evergreen desktop shortcut `BDC Central Command.lnk` (`central_command_icon.ico`)
  - Update `BDC_Central_Command_Transfer_Package.zip` in `\\DESKTOP-1CC6J72\Users\Brian\Downloads\`
- [x] Run Automated Pre-Delivery Verification Script:
  - Verify Python syntax & byte compilation of `BDC_Central_Command_GUI_v1.1.01.pyw`
  - Verify batch launchers discover and resolve `v1.1.01.pyw`
  - Verify desktop shortcut targets and icons
- [ ] Git commit and push with format `v1.1.01 : description`

## ✅ Completed: Theater Sync Heartbeat & Live Movie Detection (v10.2.121)
- [x] Create project backup archive (`backups/Theater_Sync_Heartbeat_v10.2.121_backup.zip`)
- [x] Overhaul `sDb.ref('theaterSync')` listener in `index.html`:
  - Intelligently parse `m.schedule` to detect live movies (`🔴 LIVE NOW` or current time window)
  - Promote live movie to Now Playing with live remaining countdown (`Left: Xh Ym Zs`)
  - Correctly set Up Next to the upcoming scheduled feature (e.g. Alien: Romulus) with accurate future countdown
  - Built smart auto-detection fallback preventing elapsed movies from remaining stuck in "Show Starting..."
- [x] Upgrade Central Command (`BDC_Central_Command_GUI_v1.1.00.pyw`):
  - Properly separate active event (`status == 2` or active window) from upcoming scheduled event (`status == 1`)
  - Synchronize `push_theater_sync` with `showEndTime` and accurate upcoming RSVP count
- [x] Clean House Protocol across Central Command destinations:
  - Deployed `v1.1.00.pyw` to Desktop folder and purged superseded versions
  - Synchronized evergreen `BDC Central Command.lnk` shortcut
  - Updated `BDC_Central_Command_Transfer_Package.zip` in Downloads
- [x] Automated Pre-Delivery Verification Script testing (0 errors)
- [x] Synchronize `CURRENT_APP_VERSION = 'v10.2.121'` across `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Bump `VERSION.json` & `sw.js` cache name
- [x] Update `CHANGELOG.md` with App Store style release notes (<= 10 words per bullet)
- [x] Commit and push to GitHub (`origin main`)

## ✅ Completed: Twitch Studio Deck & Java Popups Upgrade (v10.2.120)
- [x] Create project backup archive (`backups/Twitch_Studio_Java_Restoration_v10.2.120_backup.zip`)
- [x] Overhaul `Live.html` Broadcast Studio Deck:
  - Add dynamic Twitch parent domain resolver supporting `bdclive.github.io`, `briandivacox.github.io`, `localhost`, `127.0.0.1`, and query param `?host=`
  - Add multi-channel switcher tabs in header: `Mine (briandivacox)`, `Javaggz (javaggz)`, and `Dual Stream`
  - Add dual-stream mode with split player view and channel-switchable live chat
  - Add quick action buttons: direct Twitch.tv external link and instant reload
- [x] Create dedicated `Live_Java.html` and `Java.html` default-configured for Javaggz
- [x] Add 1-click `Mine` and `Java` launch buttons in Dashboard Twitch box (`#twitch-box`)
- [x] Automated Pre-Delivery Verification Script testing (0 errors)
- [x] Synchronize `CURRENT_APP_VERSION = 'v10.2.120'` across `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Sync `Live.html`, `Live_Java.html`, `Java.html` to `web_dashboards/`
- [x] Bump `VERSION.json` & `sw.js` cache name
- [x] Update `CHANGELOG.md` with App Store style release notes (<= 10 words per bullet)
- [x] Commit and push to GitHub (`origin main`)

## ✅ Completed Tasks (v10.2.99)
- [x] Create project backup archive (`backups/LiveCounters_v10.2.94_backup.zip`)
- [x] Build Game Sync Audio Chime Synthesizer in `index.html`:
  - `playGameSyncSound()` with ascending melodic chime for new syncs and gentle alert for expired tokens
  - Initial load guard preventing sound loops on startup
  - Sound enable/disable toggle and volume setting persisted in `localStorage`
  - Audio toggle & test chime controls in `#gatekeeperModal`
  - Visual pulse animation on Game Sync card upon count change
- [x] Synchronize `CURRENT_APP_VERSION = 'v10.2.99'` across `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Bump `VERSION.json` (`bdclive_web_dashboard.version: 10.2.99`)
- [x] Bump `sw.js` cache name to `livecounters-cache-v10.2.99`
- [x] Update `CHANGELOG.md` with 10-word punchy release notes
- [x] Commit and push to GitHub (`origin main`)


















