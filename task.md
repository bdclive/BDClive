# Task List: Live Chief List Reload & Banned Member Filter in Redemption Matrix (v1.1.09)

## 📋 Active Tasks
- [x] Create project backup archive (`BDC_Central_Command_backup_*.zip`) and verify 2-backup retention
- [x] Upgrade Central Command to `v1.1.09` (`BDC_Central_Command_GUI_v1.1.09.pyw`):
  - [x] Add `self.roster_data` fetching to `load_data()` in `GiftCodeManagerDialog`
  - [x] Implement `reload_chief_list()` method in `GiftCodeManagerDialog`
  - [x] Add prominent "🔄 Reload Chief List" button in header and bottom toolbar of `GiftCodeManagerDialog`
  - [x] Filter out banned and departed chiefs using `get_banned_and_excluded_identifiers` and `is_member_banned_or_left`
  - [x] Make delivery progress bar dynamic (`total_alliance_accs = len(all_targets)`) instead of hardcoded 21
  - [x] Add context menu to Treeview with "🚫 Mark Chief as Left / Banned", "📋 Copy Game ID", and "🔄 Reload Chief List"
  - [x] Add "🔄 Reload Chief Roster & Gatekeeper" command to Central Command main menu bar
  - [x] Bump version strings from `v1.1.08` to `v1.1.09`
- [x] Update `VERSION.json` (`bdc_central_command_desktop: 1.1.09`)
- [x] Central Command Clean House Protocol (sync to desktop, purge v1.1.08, clear __pycache__, refresh transfer zip)
- [x] Update `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Run Automated Pre-Delivery Verification Script (GUI chief reload + banned exclusion assertions)
- [x] Commit and push to GitHub (`v1.1.09 : Added live Chief list reload and banned member filter to Redemption Matrix`)

## ✅ Completed: Gatekeeper Banned & Departed Member Filtering (v10.2.131)
- [x] Create project backup archive (`archive_backups/BDCLive_backup_v10.2.131_pre_gatekeeper_banned_left_fix.zip`)
- [x] Implement `isMemberBannedOrLeft` and `getBannedAndExcludedIdentifiers` in `index.html`
- [x] Update `computeAndRenderGatekeeper()` to filter out banned and departed members
- [x] Update `renderGatekeeperRosterTable()` and modal filter tabs to support `All Active (36)`, `Claimed (18)`, `Unclaimed (18)`, `Synced (16)`, `Departed (2)`, and `Banned (4)`
- [x] Synchronize changes across `New.html` and `web_dashboards/New.html` (verified identical SHA-256 hashes)
- [x] Bump version numbers to `v10.2.131`:
  - [x] `index.html`, `New.html`, and `web_dashboards/New.html`
  - [x] `sw.js` cache name to `livecounters-cache-v10.2.131`
  - [x] `VERSION.json` (`bdclive_web_dashboard.version: 10.2.131`)
- [x] Update `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Run Automated Pre-Delivery Verification Script (`verify_gatekeeper_banned_left_filtering.py`) - 100% (41/41 assertions passed)
- [x] Verified Headless Chrome DOM rendering of Left and Banned filter elements
- [x] Enforce strict 2-backup retention protocol across archive folders

## ✅ Completed: Add Dates to Alliance Gift Code & Redemption Matrix (v1.1.08)
- [x] Create project backup archive (`BDC_Central_Command_backup_20260907_064500.zip`) and verify 2-backup retention
- [x] Create `BDC_Central_Command_GUI_v1.1.08.pyw` with gift code add dates:
  - [x] Add `({date_str})` next to code names in `GiftCodeManagerDialog` catalog cards
  - [x] Add `({date_str})` next to code name in `GiftCodeManagerDialog` right-pane header
  - [x] Add `*({date_str})*` next to active code in `send_or_update_gatekeeper_report()`
  - [x] Bump version strings from `v1.1.07` to `v1.1.08`
- [x] Update `bdc_api_service.js` with `*({date_str})*` next to active code
- [x] Update `VERSION.json` (`bdc_central_command_desktop: 1.1.08`)
- [x] Central Command Clean House Protocol (sync to desktop, purge v1.1.07, clear __pycache__, refresh transfer zip)
- [x] Update `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Run Automated Pre-Delivery Verification Script (GUI cards test + live Discord embed test)
- [x] Commit and push to GitHub (`v1.1.08 : Added add dates to Alliance Gift Code and Redemption Matrix`)

## ✅ Completed: Fix Promo Code Recency Sorting in Gatekeeper Report (v1.1.07)
- [x] Create project backup archive (`BDC_Central_Command_backup_20260907_063548.zip`)
- [x] Fix Gatekeeper active code selection in `BDC_Central_Command_GUI_v1.1.07.pyw` to sort by recency (`lastDispatchedAt` / `createdAt` desc)
- [x] Fix Gatekeeper active code selection in `bdc_api_service.js` to sort by recency
- [x] Mark expired codes in Firebase (`K6ZbjAXK6`, etc.) as `expired`
- [x] Upgrade Central Command to `v1.1.07`:
  - [x] Bump version strings from `v1.1.06` to `v1.1.07`
  - [x] Purge superseded `v1.1.06.pyw`
- [x] Update `VERSION.json` (`bdc_central_command_desktop: 1.1.07`)
- [x] Clean House Protocol across Central Command destinations (Desktop, Shortcuts, Transfer Zip)
- [x] Update `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Run Automated Pre-Delivery Verification Script
- [x] Dispatch live update to Discord Gatekeeper Report to verify `4dp5ZGM4c` is posted
- [x] Commit and push to GitHub (`v1.1.07 : Fixed promo code recency sorting in Gatekeeper report`)

## ✅ Completed: Gatekeeper Bot Hub & Server Status with Offline Alerts (v10.2.130)
- [x] Create project backup archive (`archive_backups/BDCLive_backup_v10.2.130_pre_gatekeeper_hub_server.zip`)
- [x] Add Hub and Server status pills and offline alert banner to Gatekeeper box (`#gatekeeper-box`) in `index.html`
- [x] Add Bot Fleet & Server Telemetry panel to Gatekeeper modal (`#gatekeeperModal`) in `index.html`
- [x] Wire live Firebase listeners for `bot_status` and `broadcastAlerts/bot_fleet_offline_alert` on `wosDb` with live countdown ticker
- [x] Synchronize changes across `New.html` and `web_dashboards/New.html` (verify identical hashes)
- [x] Bump version numbers to `v10.2.130`:
  - [x] `index.html`, `New.html`, and `web_dashboards/New.html`
  - [x] `sw.js` cache name to `livecounters-cache-v10.2.130`
  - [x] `VERSION.json` (`bdclive_web_dashboard.version: 10.2.130`)
- [x] Update `CHANGELOG.md` with App Store style release notes (strict $\le 10$ words per bullet)
- [x] Run Automated Pre-Delivery Verification Script (`verify_gatekeeper_hub_server.py`)
- [x] Commit and push to GitHub (`v10.2.130 : Added Bot Hub and Server status with offline alerts to Gatekeeper`)

## ✅ Completed: BriansTheater Dedicated Firebase Database Sync (v10.2.129 / v1.1.06)
- [x] Created project backup archive (`backups/BriansTheater_Dedicated_DB_Sync_*.zip`)
- [x] Connected `theaterDb` to `https://brianstheater-default-rtdb.firebaseio.com/` in `index.html`
- [x] Overhauled Cinema Box listener to read live `moviesCount` (404), `tvCount` (36), `daysOpen`, and schedule directly from `theaterDb.ref('theaterSync')` with `sDb` fallback
- [x] Updated `MoviesTracker.html` to connect directly to `brianstheater-default-rtdb`
- [x] Upgraded Central Command to `v1.1.06` (`BDC_Central_Command_GUI_v1.1.06.pyw`):
  - [x] Updated `push_theater_sync` to dual-patch both `livecounters` and `brianstheater-default-rtdb` with secret key
  - [x] Executed Central Command Clean House Protocol (purged v1.1.05, updated shortcuts, refreshed transfer zip)
- [x] Mirrored changes across `New.html`, `web_dashboards/New.html`, and `web_dashboards/MoviesTracker.html`
- [x] Bumped version numbers to `v10.2.129` across HTML, `sw.js` cache, and `VERSION.json` (`bdc_central_command_desktop: 1.1.06`)
- [x] Updated `CHANGELOG.md` with App Store style release notes (strict <= 10 words per bullet)
- [x] Automated Pre-Delivery Verification Script passed (0 errors)
- [x] Committed and pushed to GitHub (`v10.2.129 : Connected Cinema Box to dedicated Brian's Theater Firebase database`)

## ✅ Completed: GitHub Pipeline Density Modes (1x, 2x, 3x, 4x) (v10.2.128)
- [x] Created project backup archive (`backups/GitHub_Pipeline_Density_3x_4x_v10.2.128_*.zip`)
- [x] Upgraded `#gh-mode-toggle` in `index.html` with `1x | 2x | 3x | 4x` buttons
- [x] Upgraded `toggleGithubTickerMode()` and `updateGithubDashboardUI()` to handle all 4 modes with sequential cycling
- [x] Implemented 3x (Triple) and 4x (Quad Stream) renderers with zero vertical overflow
- [x] Mirrored changes to `New.html` and `web_dashboards/New.html`
- [x] Bumped versions to `v10.2.128` across HTML, `sw.js` cache, and `VERSION.json`
- [x] Updated `CHANGELOG.md` with App Store style release notes (strict <= 10 words per bullet)
- [x] Automated Pre-Delivery Verification Script passed (0 errors)
- [x] Committed and pushed to GitHub (`v10.2.128 : Added 3x triple and 4x quad density modes to GitHub Pipeline ticker`)

## ✅ Completed: Restored Strict 1-Hour Pipeline Active Window (v10.2.127)
- [x] Restored strict 1-hour cutoff (`MAX_AGE_MS = 60 * 60 * 1000`) in `getActiveRepositories()`
- [x] Eliminated legacy 48-hour window and fallback to 8 repos
- [x] Verified that inactive feeds cleanly show "All Pipelines Up to Date"
- [x] Bumped version to `v10.2.127` across `index.html`, `New.html`, `web_dashboards/New.html`, and `sw.js`
- [x] Updated `VERSION.json` (`bdclive_web_dashboard: 10.2.127`)
- [x] Updated `CHANGELOG.md` with App Store style release notes (strict <= 10 words per bullet)
- [x] Automated Pre-Delivery Verification Script passed (0 errors)
- [x] Committed and pushed to GitHub (`v10.2.127 : Restored strict 1-hour max active pipeline visibility window`)

## ✅ Completed: GitHub Pipeline & BriansTheater Future-Proof Integration (v10.2.126 / v1.1.05)
- [x] Project backup archive created (`backups/BriansTheater_GitHub_Pipeline_*.zip`)
- [x] Overhauled `Daemons/github_auto_discovery_daemon.py` with universal `/user/repos?affiliation=owner,collaborator,organization_member` and `/user/orgs` auto-discovery
- [x] Upgraded Central Command to `v1.1.05` with 5-minute background auto-discovery sweep
- [x] Executed Central Command Clean House Protocol (purged `v1.1.04`, refreshed shortcuts and transfer package)
- [x] Updated web dashboard (`index.html`, `New.html`, `web_dashboards/New.html`):
  - [x] Added `BriansTheater` to `GITHUB_ACCOUNTS` and default catalog
  - [x] Added 1-click "Launch" button for web app repos in modal
  - [x] Bumped versions to `v10.2.126`
- [x] Bumped `sw.js` cache to `livecounters-cache-v10.2.126`
- [x] Updated `VERSION.json` with Central Command `1.1.05`, BDClive `10.2.126`, and BriansTheater `4.9.31`
- [x] Updated `CHANGELOG.md` with App Store style release notes (strict <= 10 words/bullet)
- [x] Automated Pre-Delivery Verification Script passed (0 errors)

## ✅ Completed: Twitch Studio Chat Toggle & Hide Feature (v10.2.125)
- [x] Create project backup archive (`backups/Twitch_Studio_Chat_Toggle_v10.2.125_*.zip`) <!-- id: 38 -->
- [x] Add Chat Toggle & Hide capability to Twitch Studio (`Live.html`, `Live_Java.html`, `Java.html`): <!-- id: 39 -->
  - [x] Add "Hide Chat" / "Show Chat" action button in header actions toolbar <!-- id: 40 -->
  - [x] Add quick collapse button (`Hide`) inside chat header <!-- id: 41 -->
  - [x] Add expandable sleek vertical mini-tab when chat is collapsed on right edge <!-- id: 42 -->
  - [x] Support keyboard shortcut (`C` or `Alt+C`) to toggle chat visibility <!-- id: 43 -->
  - [x] Persist chat hidden preference across sessions in `localStorage` <!-- id: 44 -->
  - [x] Make stream player automatically expand to fill 100% of workspace when chat is hidden <!-- id: 45 -->
  - [x] Maintain dual stream layout responsiveness and player proportions when chat is hidden <!-- id: 46 -->
- [x] Synchronize all Live studio files: <!-- id: 47 -->
  - [x] `Live.html` & `web_dashboards/Live.html` <!-- id: 48 -->
  - [x] `Live_Java.html` & `web_dashboards/Live_Java.html` <!-- id: 49 -->
  - [x] `Java.html` & `web_dashboards/Java.html` <!-- id: 50 -->
- [x] Bump version numbers to `v10.2.125`: <!-- id: 51 -->
  - [x] `Live.html` version tag and internal strings <!-- id: 52 -->
  - [x] `CURRENT_APP_VERSION = 'v10.2.125'` across `index.html`, `New.html`, and `web_dashboards/New.html` <!-- id: 53 -->
  - [x] `sw.js` cache to `livecounters-cache-v10.2.125` <!-- id: 54 -->
  - [x] `VERSION.json` (`bdclive_web_dashboard.version: 10.2.125`) <!-- id: 55 -->
- [x] Update `CHANGELOG.md` with App Store style punchy release notes (<= 10 words per bullet) <!-- id: 56 -->
- [x] Run Automated Pre-Delivery Verification Script <!-- id: 57 -->
- [x] Commit and push to GitHub (`v10.2.125 : Added toggle to hide and show Twitch studio chat`) <!-- id: 58 -->

## ✅ Completed: Separate Follower, Views, and Tasks Tracking (v10.2.124)
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
- [x] Commit and push to GitHub <!-- id: 37 -->

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


















