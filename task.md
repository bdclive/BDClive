# Task List: Alliance Gatekeeper Real-Time Sync & Audit Modal (v10.2.85)

- [x] Create project backup archive (`backups/LiveCounters_v10.2.85_backup.zip`)
- [x] Connect real-time listeners for `wosDb.ref('roster_live')` and `wosDb.ref('users')` in `index.html`, `New.html`, `web_dashboards/New.html`
- [x] Implement dynamic calculations for:
  - Total Roster Members (from `roster_live`: 41 chiefs)
  - Unclaimed Accounts (roster members without registered user accounts: 17 unclaimed)
  - Signups (Today & 7-Day from user registration timestamps)
  - Expired Tokens (JWT expiration check on linked Century Games tokens: 14 accounts)
  - Unsynced / Unverified Chiefs (27 chiefs)
- [x] Update `labData/gatekeeperCounters` in Firebase RTDB for ecosystem consistency
- [x] Polish Gatekeeper Card UI (clean margins, hover state, click cursor, badge)
- [x] Build interactive **Alliance Gatekeeper Roster & Token Audit Modal** (`openGatekeeperModal()`)
- [x] Bump versions to `v10.2.85` in `VERSION.json`, `index.html`, `New.html`, `web_dashboards/New.html`, `sw.js`
- [x] Update `CHANGELOG.md` with detailed release notes
- [x] Commit and push to GitHub (`origin main`) with compliant commit message


