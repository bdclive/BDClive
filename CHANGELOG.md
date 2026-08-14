# Changelog

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
