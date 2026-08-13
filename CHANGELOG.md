# Changelog

## v10.2.15 (2026-08-13)
- **Flash Countdown Bug Fixed:** Resolved timer flickering and jumping caused by un-cleared interval accumulators and snapshot variable mutations in the Cinema Box. Cleared all active intervals (`nowInt`, `nextInt`) on Firebase updates and calculated exact real-time deltas against `new Date()`. Passed 100% Node.js syntax verification (`node --check`).

## v10.2.14 (2026-08-09)
- **Grand Total Views Suffix Cleanup:** Removed trailing `+` sign from Grand Total Views card.
