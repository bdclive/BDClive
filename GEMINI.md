# Project Rules & Operational Directives (BDClive & Central Command)

## Automatic Versioning & Deployments
- When making functional code changes or adding features, automatically update `CHANGELOG.md` and bump version numbers in `VERSION.json` and script headers.
- Always create a project backup archive before major modifications.

## Central Command "Clean House" Protocol
- Every time Central Command is updated, bumped, or deployed:
  1. Purge all superseded version files (`.pyw` / `.py`) from `BDC_Central_Command` and the remote network destination (`\\DESKTOP-1CC6J72\Users\Brian\OneDrive\Desktop\BDC Central Command`).
  2. Flush and purge all stale `__pycache__` directories across both local and network paths.
  3. Delete obsolete remote desktop shortcuts (e.g. `BDC Central Command vX.X.XX.lnk`) and generate the updated shortcut pointing to `Start_Central_Command.bat`.
  4. Ensure `Start_Central_Command.bat` is synchronized to the latest version.
  5. Keep the Desktop clean with exactly the 2 primary shortcuts: `BDC Central Command.lnk` (pointing to the master control panel/server) and `BDC Ticket Alert Communicator.lnk` (pointing to the ticket desk) on all desktops with `central_command_icon.ico`. Remove redundant or versioned shortcut duplicates.
  6. Update `BDC_Central_Command_Transfer_Package.zip` in `\\DESKTOP-1CC6J72\Users\Brian\Downloads\`.
