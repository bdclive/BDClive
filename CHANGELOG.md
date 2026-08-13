# Changelog

## v10.2.15 / Python Bridge v1.0.44 (2026-08-13)
- **Instant Discord RSVP Sync & Event Sorting**: Updated GUI and CLI bridge scripts to **v1.0.44** (`threads_bridge_gui_v1.0.44_(windows).pyw` and `threads_bridge_cli_v1.0.44_(terminal).py`). Added `max(ev.get('user_count'), len(u_names))` fallback protection to instantly capture ANY RSVP click on Discord even before endpoint propagation. Synced live event **"Michael"** with 2 RSVPs to Firebase `/theaterSync.json`!

## v10.2.14 / Python Bridge v1.0.43 (2026-08-13)
- **Grand Total Views Suffix Cleanup:** Removed the trailing `+` sign from the Grand Total Views card (`319,920`) to display exact unabbreviated numbers cleanly.

## v10.2.13 (2026-08-09)
- **Cinema Box Live Countdown Ticker Restored:** Restored `Left: HHh MMm SSs` countdown timer.
