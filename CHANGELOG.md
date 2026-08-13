# Changelog

## v10.2.17 (2026-08-13)
- **GitHub Projects Status Pipeline Box Added:** Added live GitHub Status Box in Row 3 Col 1 featuring auto-rotating ticker feed, live push beacons, relative timestamps, and latest commit messages. Includes multi-account support (`GITHUB_ACCOUNTS`) and interactive full-screen "Command Center" modal with real-time search & direct repo links.

## v10.2.16 (2026-08-13)
- **Cinema Box State Machine Architecture:** Fully decoupled Firebase data receiving from clock rendering by introducing `THEATER_STATE` and a single standalone 1-second heartbeat clock (`renderTheaterHeartbeat`).
