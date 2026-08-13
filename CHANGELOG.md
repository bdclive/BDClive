# Changelog

## v10.2.16 (2026-08-13)
- **Cinema Box State Machine Architecture:** Fully decoupled Firebase data receiving from clock rendering by introducing `THEATER_STATE` and a single standalone 1-second heartbeat clock (`renderTheaterHeartbeat`). Permanently eliminated countdown timer flashing, interval stacking, and snapshot delta jitter. Verified 100% clean Node.js syntax checks.

## v10.2.15 (2026-08-13)
- **Flash Countdown Bug Fixed:** Resolved timer flickering and jumping caused by un-cleared interval accumulators.
