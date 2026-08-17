# Changelog

## v10.2.70 (2026-08-17)
- 🔢 **Added `parseMetricNum` & Fixed Metric Shorthand Parsing**: Fixed root cause of phantom `-6,408` view drop by properly converting `"6.6k"` string counters into full `6,600` integer values across all 9 platforms.

## v10.2.69 (2026-08-17)
- 🪟 **Standardized Window Title to `BDC LIVE vXX.X.XX`**: Streamlined `<title>` and `manifest.json` app name to prevent duplicate title repetition across PWA window frames and browser tabs.

## v10.2.68 (2026-08-17)
- 🎯 **Unified GitHub Pipeline to Official `BDClive` Repository**: Cleaned out duplicate `LiveCounters` feed tile and set `bdclive/BDClive` as the single authoritative upstream remote and pipeline monitor.

## v10.2.67 (2026-08-17)
- ⏱️ **Calibrated GitHub Pipeline Active Window to 1 Hour Max**: Trimmed active pipeline visibility from 24h/5h down to strictly 1 hour max with high-contrast time tiers (`● <15M` in Electric Green, `● <30M` in Neon Cyan, `● <1H` in Warm Gold), cleanly collapsing older idle repositories into a minimal "● All Pipelines Up to Date" summary card and reserving red strictly for build failures.

## v10.2.66 (2026-08-17)
- 📈 **Completed Real-Time Views Delta Badge & Firebase Cloud Baseline Sync**: Fully wired the live Net Views growth badge (`#grand-views-delta`) alongside Follower tracking and connected daily 24h baseline synchronization to Firebase RTDB (`labData/gtBaselines/YYYY-MM-DD`) so all devices share the exact same starting baseline.

## v10.2.65 (2026-08-17)
- 🎨 **Added Official BDC LIVE Branding & Social Preview Assets**: Generated and integrated high-resolution 1024x1024 metallic cyber emblem avatar (`bdclive_logo.jpg`) and widescreen 16:9 command center social preview banner (`bdclive_banner.jpg`) across `manifest.json` and OpenGraph/Twitter meta tags.

## v10.2.64 (2026-08-17)
- 🚀 **Optimized Pages Workflow Concurrency**: Configured `cancel-in-progress: true` on GitHub Pages deployment pipeline, preventing concurrent runner lockups and duplicate `github-pages` artifact collisions.

## v10.2.63 (2026-08-17)
- 🏢 **Linked Official `bdclive` Organization & Repository**: Connected the project to the dedicated `bdclive` organization (`https://github.com/bdclive/BDClive`), establishing dual remote synchronization and dynamic changelog/status tracking across both repositories.

## v10.2.62 (2026-08-17)
- ⚡ **Real-Time WebSocket GitHub Pipeline Stream via Firebase**: Integrated persistent WebSocket listener on `labData/githubPipeline` for instantaneous sub-second repository push and workflow status updates, completely eliminating GitHub API client-side rate limits.

## v10.2.61 (2026-08-17)
- 🚀 **Fixed GitHub Actions Pages Deployment**: Removed duplicate `Index.html` tracking collision between uppercase/lowercase filenames on Ubuntu runners, restoring green automated deployments.

## v10.2.60 (2026-08-17)
- 🌐 **Real-Time Grand Totals Gain/Loss Delta Engine**: Built automated real-time delta indicators (`▲ +X` in bright green on gain, `▼ -X` in vivid red on drop) and 24h daily net baseline tracking directly into the Grand Totals box across all 9 platforms with glowing visual pulse animations.

## v10.2.59 (2026-08-17)
- 🎬 **Fixed Brian's Theater "Up Next" Countdown Cutoff**: Rebalanced column grid distribution (`1fr 1.15fr`), converted the `TODAY` indicator into a sleek inline badge, and enforced `white-space: nowrap` so the live countdown timer (`8h 36m 58s`) and RSVP badge fit cleanly on a single line without wrapping or clipping.

## v10.2.58 (Bridge v1.0.52 - 2026-08-17)
- ⚡ **Rebranded to BDC Central Command**: Unified all background daemons into a master control panel with full multi-threading support.
- 🔥 **Integrated WoS Multi-Maintenance Engine (4x Daily - 0 Google Quota)**: Built automated 6-hour background sweep daemon and manual trigger button to sync furnace levels, nicknames, and avatars across all 39 alliance members and alts directly with Century Games API and Firebase without exhausting Google Apps Script quotas.
- 🪟 **Dedicated GUI Control Card & Triggers**: Added live `🔥 WoS Maintenance` card with audit counts, `🔥 WoS Maint` manual sweep button, and refreshed `🎁 Sweep Codes` and `🏰 #alerts Report` action buttons.

## v10.2.57 (Bridge v1.0.51 - 2026-08-15)
- 🏰 **Unified Alliance Gatekeeper Report (#alerts)**: Built dynamic single-post Discord dashboard engine that auto-updates `#alerts` with live roster verification, new member signups, active gift codes, and auto-bot telemetry without clogging the channel.

## v10.2.56 (Bridge v1.0.51 - 2026-08-15)
- 🛡️ **Cleaned Alliance Gatekeeper Discord Embed**: Streamlined gift code announcement embeds directly under the Alliance Gatekeeper webhook banner, stripping out all lab bridge signatures and web source tags.

## v10.2.55 (Bridge v1.0.50 - 2026-08-15)
- 📢 **Alliance Discord Gift Code Alerts**: Built automatic Discord webhook announcement broadcasting to the alliance channel whenever a new code is discovered and mass-redeemed for alliance members.
- ⚡ **Real-Time Delivery Summary**: Displays code name, total successful claims, and alliance targets directly in Discord.

## v10.2.54 (Bridge v1.0.49 - 2026-08-15)
- 🎁 **Integrated Alliance Auto Gift Code Bot Daemon**: Built autonomous Whiteout Survival gift code scraper (DotGG, ProGameGuides, PocketGamer) and Century Games validator engine directly into the Bridge GUI loop.
- ⚡ **Auto-Discovery & Mass Redemption**: Automatically tests newly published promo codes against Century Games servers, registers verified active codes into Firebase `gift_codes_history`, and executes redemption across all enrolled alliance members & alts.
- 📊 **Dedicated GUI Metric Card & Telemetry Stream**: Added **`🎁 GIFT CODE BOT`** live counter card to the desktop control panel and broadcasts heartbeat metrics to Firebase `system/giftcode_bot_status`.

## v10.2.53 (2026-08-14)
- **Hardened GateKeeper Telemetry Stream (16/25 & 23 Unsynced)**: Removed legacy `chiefs.json` parser that was feeding outdated 21 member counts into the bridge engine, and hardened frontend listener bounds to prevent any momentary display flashes.

## v10.2.52 (2026-08-14)
- **GateKeeper Header Text Realignment**: Shifted the `GATEKEEPER` header label position to the right for balanced visual alignment across the top bar.

## v10.2.51 (2026-08-14)
- **Calibrated Exact 30-Day Active Sync (2 Active / 23 Unsynced)**: Audited live Century Games verification tokens in the database, verifying only 2 accounts hold active 30-day tokens (`BrianDCox` & `thadwarf`), setting **`23 Unsynced`** (`25 Total − 2 Active Sync = 23`).

## v10.2.50 (2026-08-14)
- **Restarted Background Bridge with 25 Total Members**: Terminated previous background bridge instance that had cached 21 members and restarted with calibrated `totalMembers: 25`, locking the live hero ratio to **`16/25`** across all connected clients.

## v10.2.49 (2026-08-14)
- **Live Background Bridge Sync Calibration**: Upgraded `threads_bridge_gui_v1.0.48_(windows).pyw` and `gatekeeper_counters.json` to continuously broadcast live validated stats directly to Firebase RTDB (`totalMembers: 25`, `unclaimedAccounts: 16`, `unsyncedChiefs: 21`, `activeSync: 4`, `expiredTokens: 0`).

## v10.2.48 (2026-08-14)
- **Dynamic Unsynced Calculation Formula (Total − Active Sync)**: Configured the GateKeeper Unsynced metric to dynamically compute `Total Accounts (25) − Active Sync (4) = 21 Unsynced`, synced in real time across Firebase RTDB (`/labData/gatekeeperCounters.json`).

## v10.2.47 (2026-08-14)
- **Combined Unclaimed Ratio Layout (16/25)**: Consolidated the Unclaimed Accounts and Total Members counters into a compact, space-saving **`16/25`** ratio hero stat (`#gk-unclaimed / #gk-total-members`), expanding layout breathing room for **🔑 EXP. TOKENS (0)** and **🔄 UNSYNCED (7)**.

## v10.2.46 (2026-08-14)
- **Live Unverified / Unsynced Count Sync (7 Unsynced)**: Cross-referenced the `👥 Registered Users Database` in Firebase (`wos-dashboard-38d4c`) where 2 members have active Century Games verification (`BrianDCox` & `Thadwarf`) and **7 members are Unverified / Unsynced** (`sigmashu`, `aku tasya`, `Miaow Queen`, `Guardian`, `tyeesylvester18`, `wosrewards`, `test3`), syncing **7 Unsynced** to the GateKeeper box.

## v10.2.45 (2026-08-14)
- **Accurate WOS Roster Sync (25 Accounts, 16 Unclaimed, 16 Unsynced)**: Calibrated the exact roster count to 25 total accounts, syncing **16 Unclaimed Accounts** and **16 Unsynced Chiefs** with 0 expired tokens directly from Firebase RTDB (`/labData/gatekeeperCounters.json`).

## v10.2.44 (2026-08-14)
- **Live WOS Roster Sync for Unclaimed & Expired Tokens**: Audited the live WOS roster database and populated actual counts into Firebase RTDB (`/labData/gatekeeperCounters.json`): **14 Unclaimed Accounts** (unregistered chiefs on roster), **6 Expired Tokens** (disconnected game IDs), and **6 Unsynced Chiefs** alongside **21 Active Members** and **+3 New Signups 7D**.

## v10.2.43 (2026-08-14)
- **Live Sync for Unclaimed Accounts & Expired Tokens**: Populated `unclaimedAccounts` and `expiredTokens` directly in Firebase RTDB (`/labData/gatekeeperCounters.json`) and updated the GateKeeper widget with a balanced 4-counter display featuring **MEMBERS (21)**, **SIGNUPS 7D (+3 with +0 Today)**, **UNCLAIMED (0)**, and **EXP. TOKENS (0)**.

## v10.2.42 (2026-08-14)
- **Cleaned GateKeeper Header & Restored High-Legibility Roster Layout**: Removed the shield icon and sync age indicator from the header for a clean title bar. Restored the high-legibility 3-metric layout featuring **TOTAL MEMBERS (21)**, **Signups 7D (+3)**, **Unclaimed Accounts (0)**, and **Today (+0)** directly backed by real-time Firebase RTDB sync.

## v10.2.41 (2026-08-14)
- **Dedicated Cloud Data Dashboard Vector App Icon**: Replaced generic gaming/WOS icon graphics with an authentic, high-resolution **Cloud Data Dashboard** vector icon featuring glowing cyber pulse waves across a dark obsidian cloud silhouette.

## v10.2.40 (2026-08-14)
- **GateKeeper Live Freshness Age Indicator**: Removed the redundant static `100% LIVE` badge from the GateKeeper widget and replaced it with a dynamic, color-coded data freshness indicator (`#gk-sync-age`) that calculates the exact time since the last roster sync (`● 12m ago`, `● 2h ago`, etc.) to instantly verify how current the information is.

## v10.2.39 (2026-08-14)
- **GateKeeper Health Grid & Standalone PWA Web App Support**: Upgraded Alliance GateKeeper widget with a 3-chip health grid (**Expired Tokens**, **Unsynced Chiefs**, **Unclaimed Accounts**, and **Roster Health Badge**). Added complete Progressive Web App (PWA) infrastructure with `manifest.json`, `sw.js` service worker, high-resolution SVG app icons (`icon-192.svg`, `icon-512.svg`), iOS mobile web app tags, and synced the root `index.html` for direct Web App access.

## v10.2.38 (2026-08-14)
- **Alliance GateKeeper Live Widget**: Created the Alliance GateKeeper counter card in Row 2, Box 2 (`#gatekeeper-box`). Added live metrics for **Total Members (21)**, **New Signups 7-Day (+3)**, **Unclaimed Accounts (0)**, and **Today's New Joins (+0)** with real-time Firebase RTDB sync (`/labData/gatekeeperCounters.json`).

## v10.2.37 (2026-08-14)
- **Synchronized Frontend Versioning & Eliminated Update Alert Loop**: Synchronized dashboard version across `New.html` (title tag, Cinema Box footer badge, `CURRENT_APP_VERSION = 'v10.2.37'`, and `CHANGELOG.md`). Fixed the version mismatch where the dashboard was stuck showing `v10.2.30` and constantly triggering the update banner on reload.

## v10.2.36 / Python Bridge v1.0.48 (2026-08-14)
- **Gatekeeper Card Formatting & 7-Day Join Display Fix**: Updated GUI and CLI bridge scripts to **v1.0.48** (`threads_bridge_gui_v1.0.48_(windows).pyw` and `threads_bridge_cli_v1.0.48_(terminal).py`). Fixed metric card formatting by removing `"Fol"` and displaying accurate WOS alliance data: **`21 Members / +3 (7D)`**.

## v10.2.35 / Python Bridge v1.0.47 (2026-08-14)
- **Real-Time WOS Alliance Roster Sync**: Replaced initial placeholder numbers with real-time Whiteout Survival (WOS) chief data (`chiefs.json`). Updated `GatekeeperCounterEngine` to parse actual chief rosters (**21 Total Alliance Members**, **+3 New Joins in Last 7 Days**, **+0 Today**). Synced live state to Firebase RTDB (`/labData/gatekeeperCounters.json`).

## v10.2.34 / Python Bridge v1.0.47 (2026-08-14)
- **GUI Control Buttons Cleanup**: Updated GUI script to **v1.0.47** (`threads_bridge_gui_v1.0.47_(windows).pyw`). Removed the manual Gatekeeper control buttons (`actions_frame`) from the desktop GUI window per user request to keep the interface clean, compact, and automated.

## v10.2.33 / Python Bridge v1.0.46 (2026-08-14)
- **Alliance Gatekeeper New Member Counter & Extensible Counter Module**: Updated GUI and CLI bridge scripts to **v1.0.46** (`threads_bridge_gui_v1.0.46_(windows).pyw` and `threads_bridge_cli_v1.0.46_(terminal).py`). Built an extensible `GatekeeperCounterEngine` with local state persistence (`gatekeeper_counters.json`), daily automatic join reset, real-time Firebase RTDB sync (`/labData/gatekeeperCounters.json`), desktop GUI metric card with `➕ Add New Member (+1)` interactive controls, and automated rich Discord new member join embeds!

## v10.2.32 (2026-08-14)
- **Time-Ago Color Hierarchy & 5-Hour Cutoff:** Implemented intuitive color-coded time tiers for the GitHub Status Box: Green for < 1hr (`● <1H`), Yellow/Amber for 1-3hrs (`● 1-3H`), and Red for 4-5hrs (`● 4H+`). Projects older than 5 hours automatically roll off into the archive to keep the active feed clean.

## v10.2.31 / Python Bridge v1.0.45 (2026-08-14)
- **Alliance Gatekeeper Integration & Private Webhook Storage**: Updated GUI and CLI bridge scripts to **v1.0.45** (`threads_bridge_gui_v1.0.45_(windows).pyw` and `threads_bridge_cli_v1.0.45_(terminal).py`). Integrated Alliance Gatekeeper module with 100% private local storage in `discord_config.json` (`GATEKEEPER_WEBHOOK_URL`). Verified live `200 OK` test alert posted cleanly!

## v10.2.30 (2026-08-14)
- **Time-Ago Color Hierarchy & 5-Hour Cutoff:** Implemented intuitive color-coded time tiers for the GitHub Status Box: Green for < 1hr (`● <1H`), Yellow/Amber for 1-3hrs (`● 1-3H`), and Red for 4-5hrs (`● 4H+`). Projects older than 5 hours automatically roll off into the archive to keep the active feed clean.

## v10.2.29 (2026-08-13)
- **Zero-Rate-Limit Direct Version Auto-Detector:** Added direct CDN changelog fetching with 30s auto-polling and instant tab-focus trigger.

## v10.2.16 (2026-08-14)
- **Security Scrubbing**: Sanitized all historical plain-text Discord Webhook URLs across all python bridge scripts and archive backups.

## v10.2.15 / Python Bridge v1.0.44 (2026-08-13)
- **Time-Ago Color Hierarchy & 5-Hour Cutoff:** Implemented intuitive color-coded time tiers for the GitHub Status Box: Green for < 1hr (`● <1H`), Yellow/Amber for 1-3hrs (`● 1-3H`), and Red for 4-5hrs (`● 4H+`). Projects older than 5 hours automatically roll off into the archive to keep the active feed clean.
