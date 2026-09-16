"""
Google Tasks Real-Time Live Sync Daemon
Author: BDC LIVE Central Command
Version: v1.0.0

Features:
- Connects directly to Google Tasks API using official authorized OAuth credentials (no Apps Script UrlFetchApp quota limits)
- Filters out completed, deleted, hidden, and empty placeholder tasks
- Pushes live counts directly to Firebase Realtime Database (tasks.json)
- Updates #task-k1 on-screen sum dynamically across all BDClive dashboards
- Supports single execution (--once) or continuous background polling (--interval 60)
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import re

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Add google_tasks directory to path
TASKS_DIR = r"C:\Users\Brian\google_tasks"
if os.path.exists(TASKS_DIR) and TASKS_DIR not in sys.path:
    sys.path.insert(0, TASKS_DIR)

try:
    import google_tasks_cli
except ImportError:
    google_tasks_cli = None

FIREBASE_URL = "https://livecounters-8eaa8-default-rtdb.firebaseio.com/tasks.json"

DASHBOARD_KEYS = [
    "BrianDivaCox_count",
    "Tweet_to_Facebook_count",
    "Brian_s_Theater_count",
    "My_Tasks_count",
    "The_BDCF_Crew_count",
    "WOS_count"
]

def sanitize_key(title: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', title)
    return f"{cleaned}_count"

def perform_sync(verbose: bool = True) -> dict:
    if not google_tasks_cli:
        raise RuntimeError(f"Cannot import google_tasks_cli from {TASKS_DIR}")

    service = google_tasks_cli.get_service()
    tasklists_resp = service.tasklists().list(maxResults=100).execute()
    tasklists = tasklists_resp.get('items', [])

    list_counts = {}
    total_active_all_lists = 0
    dashboard_active_sum = 0

    if verbose:
        print(f"[Google-Tasks-Sync] Found {len(tasklists)} task lists. Querying active items...")

    for tl in tasklists:
        lid = tl['id']
        title = tl['title']
        key = sanitize_key(title)

        tasks_res = service.tasks().list(
            tasklist=lid,
            showCompleted=False,
            showHidden=False,
            showDeleted=False,
            maxResults=100
        ).execute()

        items = tasks_res.get('items', [])
        active_items = [
            t for t in items
            if t.get('status') == 'needsAction'
            and not t.get('deleted', False)
            and not t.get('hidden', False)
            and t.get('title', '').strip()
        ]

        count = len(active_items)
        list_counts[key] = count
        total_active_all_lists += count

        if key in DASHBOARD_KEYS:
            dashboard_active_sum += count

        if verbose:
            print(f"  - {title:<25} -> {count} active")

    list_counts["Task_count"] = total_active_all_lists
    list_counts["lastUpdated"] = int(time.time() * 1000)

    # Push to Firebase
    req = urllib.request.Request(
        FIREBASE_URL,
        data=json.dumps(list_counts).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    with urllib.request.urlopen(req) as resp:
        resp_data = resp.read().decode('utf-8')

    if verbose:
        print(f"[Google-Tasks-Sync] Pushed to Firebase successfully.")
        print(f"  On-Screen Dashboard Total: {dashboard_active_sum} | All Lists Grand Total: {total_active_all_lists}")

    return list_counts

def main():
    parser = argparse.ArgumentParser(description="Google Tasks Live Sync Daemon")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=60, help="Sync interval in seconds (default 60)")
    args = parser.parse_args()

    if args.once:
        perform_sync(verbose=True)
        return

    print(f"[Google-Tasks-Sync] Starting background daemon (Interval: {args.interval}s)...")
    while True:
        try:
            perform_sync(verbose=True)
        except Exception as e:
            print(f"[Google-Tasks-Sync] Error during sync: {e}", file=sys.stderr)
        time.sleep(args.interval)

if __name__ == '__main__':
    main()
