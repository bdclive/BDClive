# Task List: Fix Metric Shorthand Parsing (k/m Suffixes)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.70_backup.zip`)
- [x] Implement `parseMetricNum()` helper function handling `'6.6k'`, `'1.2M'`, and comma-formatted numbers
- [x] Integrate `parseMetricNum()` across all Grand Totals followers and views calculations
- [x] Update Firebase `labData/threadsViews` to numeric `6600`
- [x] Bump version to `v10.2.70` across `New.html`, `index.html`, `web_dashboards/New.html`, and `CHANGELOG.md`
- [x] Verify JavaScript syntax with Node.js
- [x] Push live updates to `origin` (`bdclive/BDClive`)
