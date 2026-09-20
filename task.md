# Task: Integrate Brian's Theater Manager Bot Daemon in BDC Central Command (v1.1.25)

## 1. Pre-Change Backup & Retention
- [x] Clean house and enforce strict 2-backup retention (`backups/`)
- [x] Create pre-v1.1.25 project backup archive (`BDC_Central_Command_backup_20260920_080951.zip`)

## 2. Theater Manager Bundle Verification
- [x] Verify `theater_manager.mjs`, `render_theater_marquee.mjs`, `theater_marquee_template.html`, and `assets`
- [x] Ensure dual-path resolution in root and `theater_manager/` subfolder

## 3. Central Command Engine & GUI Upgrade (v1.1.25)
- [x] Create `BDC_Central_Command_GUI_v1.1.25.pyw` from `v1.1.24.pyw`
- [x] Initialize `self.theater_process = None` and `self.theater_log_f = None` in `__init__`
- [x] Call `self.start_theater_service()` right after `self.start_api_service()` in `__init__`
- [x] Call `self.stop_theater_service()` right after `self.stop_api_service()` in `full_exit()`
- [x] Add lifecycle methods: `start_theater_service()`, `stop_theater_service()`, `restart_theater_service()`, `sync_theater_now()`
- [x] Add menu command `🎬 Restart Theater Manager Bot` to `m_settings`
- [x] Add menu command `🎬 Sync Brian's Theater Now` to `m_apps`
- [x] Bump version from `1.1.24` to `1.1.25` across headers, titles, User-Agents, logs, and tray icon

## 4. Clean House Protocol & Remote Server Deployment
- [x] Deploy `BDC_Central_Command_GUI_v1.1.25.pyw` and updated files to `\\DESKTOP-1CC6J72\Users\Brian\OneDrive\Desktop\BDC Central Command`
- [x] Purge superseded `v1.1.24` pyw files across local and network paths
- [x] Purge stale bytecode `__pycache__` across local and network paths
- [x] Synchronize desktop shortcuts (`BDC Central Command.lnk` and `BDC Ticket Alert Communicator.lnk`)
- [x] Rebuild and sync `BDC_Central_Command_Transfer_Package.zip` in `Downloads`

## 5. Pre-Delivery Verification & Testing Protocol
- [x] Programmatically test Theater Manager Bot daemon start, logging to `theater_service.log`, and PID tracking
- [x] Programmatically test on-demand sync execution (`sync_theater_now()`)
- [x] Programmatically test daemon stop and graceful process termination
- [x] Programmatically test Central Command GUI instantiation and widget rendering (0 exceptions)
- [x] Terminate all test background tasks and processes (0 remaining)

## 6. Documentation, App Store Changelog & Git Commit
- [x] Update `CHANGELOG.md` with App Store style bullets (strictly <= 10 words each, no IDs)
- [x] Bump `VERSION.json` (`bdc_central_command_desktop: 1.1.25`)
- [x] Git commit and push with `v1.1.25 : ...` and `Mini Summary:`
