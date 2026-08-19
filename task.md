# Task List: Rate Limit Fix & Version Bump (v1.0.64 / v10.2.84)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.84_backup.zip`)
- [x] Eliminate HTTP 429 bounce by adding 30s Discord event interval and smart backoff
- [x] Implement persistent in-memory UI card cache so Discord status never flickers
- [x] Optimize user roster scraping to only trigger when user_count > 0
- [x] Upgrade Central Command to `v1.0.64` (`BDC_Central_Command/bdc_central_command_gui_v1.0.64_(windows).pyw`)
- [x] Deploy `v1.0.64` directly to server (`\\DESKTOP-1CC6J72\Users\Brian\OneDrive\Desktop\BDC Central Command\`)
- [x] Update server desktop shortcut: `BDC Central Command v1.0.64.lnk`
- [x] Bump `New.html`, `index.html`, and `web_dashboards/New.html` to `v10.2.84`
- [x] Update `sw.js` cache name to `livecounters-cache-v10.2.84`
- [x] Update `VERSION.json` and `CHANGELOG.md` to `v10.2.84` / Central Command `v1.0.64`
- [x] Push release to `origin` (`bdclive/BDClive`)
