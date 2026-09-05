# Task List: Separate Follower, Views, and Tasks Tracking (v10.2.124)

## 📋 Active Tasks: Follower, Views & Tasks Complete Separation (v10.2.124)
- [x] Create project backup archive (`backups/Tasks_Followers_Views_v10.2.124_*.zip`) <!-- id: 20 -->
- [x] Upgrade Follower & Activity Change History Log in `index.html`: <!-- id: 21 -->
  - [x] Add 3rd dedicated KPI tracking box: `📋 Tasks Added & Completed` (`#log-tasks-gains`, `#log-tasks-losses`, `#log-tasks-net`) <!-- id: 22 -->
  - [x] Update `isTaskItem()` to detect all task metrics (including `task_*`, `movie_reviews`, `photos_needed`, `FunFacts`, `Bills`, etc.) <!-- id: 23 -->
  - [x] Ensure `isViewItem()` strictly excludes tasks (including preventing `review` from matching `view`) <!-- id: 24 -->
  - [x] Ensure `isFollowerItem()` strictly excludes tasks and views <!-- id: 25 -->
  - [x] Add `📋 Tasks Only` filter button in the modal filter toolbar <!-- id: 26 -->
  - [x] Add test simulation buttons: `📋 Test Task (+1)` and `✅ Complete Task (-1)` <!-- id: 27 -->
  - [x] Add `📋 TASK` purple badge in activity table rows <!-- id: 28 -->
  - [x] Connect live Google Tasks changes to log as Task events with full category isolation <!-- id: 29 -->
- [x] Synchronize `index.html` to `New.html` and `web_dashboards/New.html` <!-- id: 30 -->
- [x] Bump version numbers to `v10.2.124`: <!-- id: 31 -->
  - [x] `CURRENT_APP_VERSION = 'v10.2.124'` across HTML files <!-- id: 32 -->
  - [x] Bump `sw.js` cache to `livecounters-cache-v10.2.124` <!-- id: 33 -->
  - [x] Update `VERSION.json` (`bdclive_web_dashboard.version: 10.2.124`) <!-- id: 34 -->
- [x] Update `CHANGELOG.md` with App Store style punchy release notes (<= 10 words per bullet) <!-- id: 35 -->
- [x] Run Automated Pre-Delivery Verification Script <!-- id: 36 -->
- [/] Commit and push to GitHub <!-- id: 37 -->

## ✅ Completed: Separate Follower and Views Activity Tracking (v10.2.123)
- [x] Create project backup archive (`backups/Follower_Views_Separation_v10.2.123_*.zip`) <!-- id: 0 -->
- [x] Upgrade Follower Activity & Change History Log in `index.html`: <!-- id: 1 -->
  - [x] Separate Follower gains/losses and Views gains/losses into dedicated tracking boxes <!-- id: 2 -->
  - [x] Add `👁️ Views Gains & Losses` tracking box with gains, losses, and net views delta <!-- id: 3 -->
  - [x] Add `👥 Followers Gains & Losses` tracking box with gains, losses, and net followers delta <!-- id: 4 -->
  - [x] Add category filter buttons: `👥 Followers Only` and `👁️ Views Only` alongside `All Events`, `Gains`, and `Losses` <!-- id: 5 -->
  - [x] Add test simulation buttons: `👁️ Test Views (+100)` and `📉 Test Views (-50)` <!-- id: 6 -->
  - [x] Prevent non-social metrics (e.g. `task_*`) from polluting the activity log <!-- id: 7 -->
  - [x] Differentiate table tags (`👥 FOLLOWER` vs `👁️ VIEWS`) with distinct cyber badges <!-- id: 8 -->
- [x] Sync `index.html` to `New.html` and `web_dashboards/New.html` <!-- id: 9 -->
- [x] Bump version numbers: <!-- id: 10 -->
  - [x] `CURRENT_APP_VERSION = 'v10.2.123'` across HTML files <!-- id: 11 -->
  - [x] Bump `sw.js` cache to `livecounters-cache-v10.2.123` <!-- id: 12 -->
  - [x] Update `VERSION.json` (`bdclive_web_dashboard.version: 10.2.123`) <!-- id: 13 -->
- [x] Update `CHANGELOG.md` with App Store style punchy release notes (<= 10 words per bullet) <!-- id: 14 -->
- [x] Run Automated Pre-Delivery Verification Script <!-- id: 15 -->
- [x] Commit and push to GitHub <!-- id: 16 -->

## ✅ Completed: Gatekeeper Deduplication & Auto-Sync (v1.1.04)
- [x] Identify root cause of duplicate Gatekeeper messages in `#wos-alerts`
- [x] Delete duplicate Gatekeeper report message `1545600554984677438` from `#wos-alerts` (leaving 1 clean message `1545645336952045569`)
- [x] Create project backup archive (`BDC_Central_Command_backup_20260904_211455.zip`)
- [x] Upgrade Central Command to `BDC_Central_Command_GUI_v1.1.04.pyw`:
  - Overhaul `load_gatekeeper_report_msg_id` to prioritize Firebase RTDB as global source of truth
  - Add channel message discovery via bot token/webhook to auto-detect any existing Gatekeeper report
  - Add auto-cleanup routine in `send_or_update_gatekeeper_report` that automatically purges any ghost/duplicate messages in `#wos-alerts`
  - Ensure 404 recovery checks cloud and channel before posting a new message
  - Atomic synchronization to both local JSON and Firebase RTDB
  - Bump internal version strings from `v1.1.03` to `v1.1.04`
  - Purge superseded `v1.1.03.pyw`
- [x] Update `bdc_api_service.js` with matching cloud-first Gatekeeper logic and duplicate prevention
- [x] Update `discord_gatekeeper_report_id.json` locally and across network shares to `1545645336952045569`
- [x] Add `DISCORD_BOT_TOKEN` into `discord_config.json` for channel inspection and auto-cleanup
- [x] Update version registry `VERSION.json` (`bdc_central_command_desktop: 1.1.04`)
- [x] Clean House Protocol across Central Command destinations (Desktop, Shortcuts, Transfer Zip)
- [x] Update `CHANGELOG.md` with App Store style release notes (<= 10 words per bullet)
- [x] Run Automated Pre-Delivery Verification Script
- [x] Commit and push to GitHub (`v1.1.04 : Eliminated duplicate Gatekeeper reports and synchronized message tracking`)

## ✅ Completed: Streamline Theater RSVP with Dynamic Event Deep Link & Reaction Sync (v1.1.03)

## ✅ Completed: Synchronize Theater Up Next Between BDC CC & Dashboard (v10.2.122 & v1.1.02)

## ✅ Completed: Central Command Version Bump (v1.1.01)
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
- [x] Git commit and push with format `v1.1.01 : description`

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


















