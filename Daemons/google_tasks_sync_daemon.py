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
import urllib.parse
import re
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tasks_daemon.log")

class TeeLogger:
    def __init__(self, filename, stream):
        self.file = open(filename, "a", encoding="utf-8", buffering=1)
        self.stream = stream
    def write(self, data):
        try:
            self.file.write(data)
            self.file.flush()
        except Exception:
            pass
        if self.stream:
            try:
                self.stream.write(data)
                self.stream.flush()
            except UnicodeEncodeError:
                try:
                    self.stream.write(data.encode('ascii', errors='replace').decode('ascii'))
                    self.stream.flush()
                except Exception:
                    pass
            except Exception:
                pass
    def flush(self):
        try:
            self.file.flush()
        except Exception:
            pass
        if self.stream:
            try:
                self.stream.flush()
            except Exception:
                pass

if sys.stdout is None:
    sys.stdout = TeeLogger(LOG_FILE, None)
    sys.stderr = sys.stdout
else:
    sys.stdout = TeeLogger(LOG_FILE, sys.stdout)
    sys.stderr = TeeLogger(LOG_FILE, sys.stderr)

# Zero-dependency Pure Python Google Tasks OAuth & REST Client
def find_token_path():
    candidates = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "token.json"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "token.json"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "token.json"),
        r"C:\Users\Brian\google_tasks\token.json",
        r"\\DESKTOP-1CC6J72\Users\Brian\google_tasks\token.json"
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"token.json not found in candidate paths: {candidates}")

def get_auth_data():
    token_path = find_token_path()
    with open(token_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return (
        data.get("token"),
        data.get("refresh_token"),
        data.get("client_id"),
        data.get("client_secret"),
        token_path
    )

def refresh_oauth_token(refresh_tok, c_id, c_secret, token_path):
    url = "https://oauth2.googleapis.com/token"
    payload = urllib.parse.urlencode({
        "client_id": c_id,
        "client_secret": c_secret,
        "refresh_token": refresh_tok,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload)
    with urllib.request.urlopen(req, timeout=15) as resp:
        res_data = json.loads(resp.read().decode("utf-8"))
        new_token = res_data.get("access_token")
        if new_token:
            try:
                with open(token_path, "r", encoding="utf-8") as tf:
                    existing = json.load(tf)
                existing["token"] = new_token
                with open(token_path, "w", encoding="utf-8") as tf:
                    json.dump(existing, tf)
            except Exception as save_err:
                print(f"[Google-Tasks-Sync] Warning: Could not save refreshed token: {save_err}")
            return new_token
    raise RuntimeError("Failed to refresh OAuth token")

def google_api_request(url, access_token, refresh_tok, c_id, c_secret, token_path):
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8")), access_token
    except urllib.error.HTTPError as e:
        if e.code == 401 and refresh_tok and c_id and c_secret:
            print("[Google-Tasks-Sync] Access token expired (401), refreshing token...")
            new_token = refresh_oauth_token(refresh_tok, c_id, c_secret, token_path)
            req2 = urllib.request.Request(url, headers={
                "Authorization": f"Bearer {new_token}",
                "Accept": "application/json"
            })
            with urllib.request.urlopen(req2, timeout=15) as resp2:
                return json.loads(resp2.read().decode("utf-8")), new_token
        raise

FIREBASE_URL = "https://livecounters-8eaa8-default-rtdb.firebaseio.com/tasks.json"
LOCAL_SERVER_PORT = 8765

DASHBOARD_KEYS = [
    "BrianDivaCox_count",
    "Tweet_to_Facebook_count",
    "Brian_s_Theater_count",
    "My_Tasks_count",
    "The_BDCF_Crew_count",
    "WOS_count"
]

sync_lock = threading.Lock()
last_sync_time = 0
last_sync_counts = {}

def sanitize_key(title: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', title)
    return f"{cleaned}_count"

def perform_sync(verbose: bool = True) -> dict:
    global last_sync_time, last_sync_counts
    with sync_lock:
        access_tok, refresh_tok, c_id, c_secret, token_path = get_auth_data()

        lists_url = "https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=100"
        tasklists_resp, access_tok = google_api_request(lists_url, access_tok, refresh_tok, c_id, c_secret, token_path)
        tasklists = tasklists_resp.get('items', [])

        list_counts = {}
        total_active_all_lists = 0
        dashboard_active_sum = 0

        if verbose:
            print(f"[Google-Tasks-Sync] Found {len(tasklists)} task lists. Querying active items...")

        for tl in tasklists:
            lid = urllib.parse.quote(tl['id'], safe='')
            title = tl['title']
            key = sanitize_key(title)

            tasks_url = f"https://tasks.googleapis.com/tasks/v1/lists/{lid}/tasks?showCompleted=false&showHidden=false&showDeleted=false&maxResults=100"
            try:
                tasks_res, access_tok = google_api_request(tasks_url, access_tok, refresh_tok, c_id, c_secret, token_path)
                items = tasks_res.get('items', [])
            except Exception as t_err:
                items = []

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
                safe_title = title.encode('ascii', errors='replace').decode('ascii')
                print(f"  - {safe_title:<25} -> {count} active")

        list_counts["Task_count"] = total_active_all_lists
        list_counts["lastUpdated"] = int(time.time() * 1000)

        # Push to Firebase
        req = urllib.request.Request(
            FIREBASE_URL,
            data=json.dumps(list_counts).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()

        last_sync_time = time.time()
        last_sync_counts = list_counts

        if verbose:
            print(f"[Google-Tasks-Sync] Pushed to Firebase successfully.")
            print(f"  On-Screen Dashboard Total: {dashboard_active_sum} | All Lists Grand Total: {total_active_all_lists}")

        return list_counts

class TasksSyncHTTPHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()

    def handle_request(self):
        path = self.path.split('?')[0]
        if path in ['/syncTasks', '/sync']:
            try:
                counts = perform_sync(verbose=True)
                payload = json.dumps({"success": True, "source": "local_daemon", "counts": counts}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(payload)
            except Exception as e:
                err_payload = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(err_payload)
        elif path in ['/health', '/status', '/']:
            payload = json.dumps({
                "status": "online",
                "daemon": "google_tasks_sync_daemon",
                "lastSync": last_sync_time,
                "port": LOCAL_SERVER_PORT
            }).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(payload)
        else:
            self.send_response(404)
            self.send_cors_headers()
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logging
        pass

def start_http_server(port=LOCAL_SERVER_PORT):
    try:
        server = HTTPServer(('127.0.0.1', port), TasksSyncHTTPHandler)
        print(f"[Google-Tasks-Sync] Local HTTP sync server listening on http://127.0.0.1:{port}")
        server.serve_forever()
    except Exception as e:
        print(f"[Google-Tasks-Sync] HTTP server error: {e}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description="Google Tasks Live Sync Daemon")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=30, help="Sync interval in seconds (default 30)")
    parser.add_argument("--port", type=int, default=LOCAL_SERVER_PORT, help="Local HTTP server port")
    args = parser.parse_args()

    if args.once:
        perform_sync(verbose=True)
        return

    # Start embedded HTTP server in background thread
    http_thread = threading.Thread(target=start_http_server, args=(args.port,), daemon=True)
    http_thread.start()

    print(f"[Google-Tasks-Sync] Starting background loop (Interval: {args.interval}s)...")
    while True:
        try:
            perform_sync(verbose=True)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[Google-Tasks-Sync] Error during background sync: {e}")
        time.sleep(args.interval)

if __name__ == '__main__':
    main()
