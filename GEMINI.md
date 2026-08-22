# Project Rules & Operational Directives (BDClive & Central Command)

## Automatic Versioning & Deployments
- When making functional code changes or adding features, automatically update `CHANGELOG.md` and bump version numbers in `VERSION.json` and script headers.
- Always create a project backup archive before major modifications.

## Central Command "Clean House" Protocol
- Every time Central Command is updated, bumped, or deployed:
  1. Purge all superseded version files (`.pyw` / `.py`) from `BDC_Central_Command` and the remote network destination (`\\DESKTOP-1CC6J72\Users\Brian\OneDrive\Desktop\BDC Central Command`).
  2. Flush and purge all stale `__pycache__` directories across both local and network paths.
  3. Delete obsolete remote desktop shortcuts (e.g. `BDC Central Command vX.X.XX.lnk`) and generate the updated shortcut pointing to `Start_Central_Command.bat`.
  4. Ensure all batch launchers (`Start_Central_Command.bat`, `Run_Debug_Console.bat`) use dynamic version discovery and are synchronized across local and network destinations.
  5. Keep the Desktop clean with exactly the 2 primary shortcuts: `BDC Central Command.lnk` (pointing to the master control panel/server) and `BDC Ticket Alert Communicator.lnk` (pointing to the ticket desk) on all desktops with `central_command_icon.ico`. Remove redundant or versioned shortcut duplicates.
  6. Update `BDC_Central_Command_Transfer_Package.zip` in `\\DESKTOP-1CC6J72\Users\Brian\Downloads\`.

## Mandatory Pre-Delivery Verification & Testing Protocol
- NEVER report completion, declare a task done, or ask the user to test until an automated verification script has programmatically tested the changes.
- For GUI apps: programmatically instantiate every window, dialog, and tab, verify that 100% of widgets render with zero exceptions, and test all button handlers, inputs, and callbacks.
- For backend/scripts: run end-to-end execution checks and verify all logs (`debug_error.log`, `startup_crash.log`) are completely clean with zero errors.
- For Web & Frontend projects (wosBDC, BDClive, dashboards):
  1. Automated Console & Network Audit: programmatically verify 0 console errors, 0 unhandled promise rejections, and 0 failed asset/API requests (HTTP 200).
  2. Apps Script & API Sync: verify that whenever `clasp deploy` is run, the frontend `API_BASE_URL` is updated and pinged to return valid JSON.
  3. Multi-Device Layout: verify UI responsiveness across mobile (375px), tablet (768px), and desktop (1080p) with zero horizontal overflow.
  4. Real-Time Data Handshake: test live Firebase listeners and endpoints to ensure cards populate without hanging states.
  5. Interactive Component Verification: verify all buttons, forms, and modals handle empty, valid, and error states gracefully.
