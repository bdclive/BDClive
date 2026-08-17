# Task List: GitHub Pipeline 1-Hour Window & Micro Time Scale Calibration

- [x] Create project backup archive (`backups/LiveCounters_v10.2.67_backup.zip`)
- [x] Set active pipeline visibility window strictly to 1 hour max (`60 * 60 * 1000`)
- [x] Configure 1-hour micro color scale:
  - `< 15m`: `● <15M` in Electric Green (`#3fb950`)
  - `15m - 30m`: `● <30M` in Neon Cyan (`#00d2ff`)
  - `30m - 60m`: `● <1H` in Warm Gold (`#e3b341`)
  - `> 1h`: Clean minimal "All Pipelines Up to Date" summary card
- [x] Bump version to `v10.2.67` across `New.html`, `index.html`, `web_dashboards/New.html`, and `CHANGELOG.md`
- [x] Verify JavaScript syntax with Node.js
- [x] Push live updates to both `bdclive` and `origin` remotes
