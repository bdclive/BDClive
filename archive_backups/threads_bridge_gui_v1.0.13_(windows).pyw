# ====================================================================
# THREADS LAB BRIDGE - NATIVE WINDOWS DESKTOP GUI EDITION (v1.0.13)
# ====================================================================
import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import requests
import time
import sys
import os
import json
from datetime import datetime

# --- CONFIGURATION ---
PLEX_IP = "127.0.0.1"
PLEX_PORT = "32400"
PLEX_TOKEN = "h1t7VnuUdZLiyDjpGWsZ"

TWITCH_CHANNEL = "briandivacox"
TWITCH_TOKEN = "yyojykiccdtzwvfxzud5vy17sl6eor"
TWITCH_CLIENT_ID = "gp762nuuoqcoxypju8c569th9wz7q5"
TWITCH_BROADCASTER_ID = "170864"

# --- SNAPCHAT ASSETS ---
SNAPCHAT_CLIENT_ID = "01c775f4-71d2-42e6-9d73-98fbd9600274"
SNAPCHAT_CLIENT_SECRET = "99503dbea445ce097cdb"
SNAPCHAT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzg1ODcyNzAzLCJzdWIiOiIzNjBjNDIwNC05Y2ZhLTRlZGMtYTc1YS00NjIxZmY0MWQ0N2V-UFJPRFVDVElPTn5hYzBlODAyZC0wODQyLTQ5MDEtYmRmMS02ZDM5NjdlYzQwNWYifQ.rlYkDGVkzXwRx-YaZHJfbBVqF7Oa7qM19kwLNKgI6_E"

META_PAGE_ID = "55320913267"
META_TOKEN = """EAAOJz87tfbEBSEa1Qp1BHsqbv5xdRmSIZAFqmyFdTqLCzOedtt1RvHpu4yJzgfqhd9xUw5n7qMYuWaxkeDKToywd7j4Ee4ZBfE13mZCPQl9zmIeiAIJqEiofwsLUdwFQTnCZAm3BfKMpe2xEJZA3OOEqVukYQ6ZAkyuBGIWACsuZAf2njbP8YZBUrNLeQBk8AZBeX6TWO4gAPbgZDZD""".strip()

YOUTUBE_API_KEY = "AIzaSyCthMF6w_oq0SzmCr_1_xqRZCou0Wz_HgU"
YOUTUBE_CHANNEL_ID = "UCG79Tq48xXqg8M9b1K-10Sg"

THREADS_USER_ID = "17841400269553641"
THREADS_TOKEN = "THAAg36cTPHF1BYmJxNmlDOEwyT09wVnVXSldOVU13b2dLX2Qwck9seVg1LXg3N2ozcUJiel9tTXVqTFNxX3NqeHRLOUpPM3pCZAkF1SnY4NWUyLXFxVnVrT1N2b0Q2S3BfV2Q4cXpmblhHY2FLaEF4RVNTMi1YNkx4ZAmRiY3R4ZAl9hUQZDZD"

DISCORD_BOT_TOKEN = "MTUzMzU3OTU1MjE4NDMzNjM4NA." + "GC3hup.WqnunYrhrCJ3Ksny33YODooyYrmGIbhEasfr10"
DISCORD_GUILD_ID = "964526957721186354"
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1533569013706129538/dnx__aVXxU7rwxZGHw4zk5j-pLw5-gvoKpNOuJXJ4hOitt5qEfLjJm1MKHVC3i33lNuE"
DISCORD_EVENT_WEBHOOK_URL = "https://discord.com/api/webhooks/1533689615439892491/UxGOzEEwFd9uCwNi482J09WZ-z2gG4yxpSaPrNcT7C56Vvd8yIIaeWaiZJo_JblmBt8i"

FIREBASE_URL = "https://brians-theater-default-rtdb.firebaseio.com/labData.json"

META_INTERVAL = 45          
RETRY_COOLDOWN = 10         
FAST_INTERVAL = 2           

session = requests.Session()

def start_discord_bot_online():
    import threading
    def bot_loop():
        url = "https://discord.com/api/v10/gateway/bot"
        headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN.strip()}"}
        try:
            r = session.get(url, headers=headers, timeout=5)
            if r.status_code == 200:
                ws_url = r.json().get('url', 'wss://gateway.discord.gg') + '/?v=10&encoding=json'
                import websocket
                def on_open(ws):
                    identify_payload = {
                        "op": 2,
                        "d": {
                            "token": DISCORD_BOT_TOKEN.strip(),
                            "intents": 513,
                            "properties": {"os": "windows", "browser": "brians_theater", "device": "brians_theater"},
                            "presence": {
                                "status": "online",
                                "activities": [{"name": "Brian's Theater RSVP", "type": 3}],
                                "afk": False
                            }
                        }
                    }
                    ws.send(json.dumps(identify_payload))
                
                def on_message(ws, message):
                    data = json.loads(message)
                    if data.get('op') == 10:
                        hb_interval = data['d']['heartbeat_interval'] / 1000.0
                        def heartbeat():
                            while True:
                                time.sleep(hb_interval)
                                try: ws.send(json.dumps({"op": 1, "d": None}))
                                except: break
                        threading.Thread(target=heartbeat, daemon=True).start()
                
                ws_app = websocket.WebSocketApp(ws_url, on_open=on_open, on_message=on_message)
                ws_app.run_forever()
        except: pass
    threading.Thread(target=bot_loop, daemon=True).start()

try:
    start_discord_bot_online()
except Exception: pass

def format_event_datetime(iso_str):
    if not iso_str: return "TODAY", "TBD"
    try:
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00')).astimezone()
        return dt.strftime("%B %d, %Y").upper(), dt.strftime("%I:%M %p").lstrip('0')
    except:
        return "TODAY", "TBD"

RSVP_STORE_FILE = "discord_rsvp_ids.json"

def load_rsvp_message_ids():
    if os.path.exists(RSVP_STORE_FILE):
        try:
            with open(RSVP_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except: pass
    return {}

def save_rsvp_message_ids():
    try:
        with open(RSVP_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(rsvp_message_ids, f)
    except: pass

rsvp_message_ids = load_rsvp_message_ids()

# --- BACKEND LOGIC FUNCTIONS ---
def send_rsvp_card(ev_id, ev_name, date_str, time_str, user_count, names_list):
    roster_text = "\n".join([f"• {n}" for n in names_list]) if (names_list and user_count > 0) else "*No RSVPs yet*"
    count_label = "Member" if user_count == 1 else "Members"
    time_line = f"\n⏰ **Time:** {time_str}" if (time_str and time_str != "TBD") else ""
    payload = {
        "content": "",
        "embeds": [{
            "title": "🎟️ MOVIE NIGHT",
            "description": f"🎬 **Movie:** {ev_name}\n📅 **Date:** {date_str}{time_line}\n👥 **RSVPs:** {user_count} {count_label}\n\n📜 **Confirmed Attendees:**\n{roster_text}",
            "color": 15844367,
            "footer": {
                "text": "Brian's Theater • Live RSVP Tracker"
            }
        }]
    }
    target_webhook = DISCORD_EVENT_WEBHOOK_URL or DISCORD_WEBHOOK_URL
    try:
        msg_id = rsvp_message_ids.get(ev_id)
        if target_webhook and '/webhooks/' in target_webhook:
            parts = target_webhook.split('/webhooks/')[1].split('/')
            wh_id, wh_token = parts[0], parts[1]
            
            if msg_id:
                patch_url = f"https://discord.com/api/webhooks/{wh_id}/{wh_token}/messages/{msg_id}"
                r_patch = session.patch(patch_url, json=payload, timeout=5)
                if r_patch.status_code == 200:
                    return
                elif r_patch.status_code == 404:
                    if ev_id in rsvp_message_ids:
                        del rsvp_message_ids[ev_id]
                        save_rsvp_message_ids()
        
        r_post = session.post(f"{target_webhook}?wait=true", json=payload, timeout=5)
        if r_post.status_code == 200:
            new_id = r_post.json().get('id')
            if new_id:
                rsvp_message_ids[ev_id] = new_id
                save_rsvp_message_ids()
    except: pass

def delete_rsvp_card(ev_id):
    target_webhook = DISCORD_EVENT_WEBHOOK_URL or DISCORD_WEBHOOK_URL
    msg_id = rsvp_message_ids.get(ev_id)
    if msg_id and target_webhook and '/webhooks/' in target_webhook:
        try:
            parts = target_webhook.split('/webhooks/')[1].split('/')
            wh_id, wh_token = parts[0], parts[1]
            delete_url = f"https://discord.com/api/webhooks/{wh_id}/{wh_token}/messages/{msg_id}"
            session.delete(delete_url, timeout=5)
        except: pass
DISCORD_CHANNEL_ID = "1533687830201503914"

def purge_old_channel_messages(active_msg_id):
    if not DISCORD_BOT_TOKEN or not DISCORD_CHANNEL_ID: return
    headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN.strip()}"}
    try:
        url = f"https://discord.com/api/v10/channels/{DISCORD_CHANNEL_ID}/messages?limit=20"
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            msgs = r.json()
            if isinstance(msgs, list):
                for m in msgs:
                    m_id = m.get('id')
                    if m_id and m_id != active_msg_id:
                        del_url = f"https://discord.com/api/webhooks/1533689615439892491/UxGOzEEwFd9uCwNi482J09WZ-z2gG4yxpSaPrNcT7C56Vvd8yIIaeWaiZJo_JblmBt8i/messages/{m_id}"
                        session.delete(del_url, timeout=5)
    except: pass

def get_plex_sessions():
    url = f"http://{PLEX_IP}:{PLEX_PORT}/status/sessions?X-Plex-Token={PLEX_TOKEN}"
    try:
        r = session.get(url, headers={'Accept': 'application/json'}, timeout=5)
        if r.status_code == 200: return r.json().get('MediaContainer', {}).get('size', 0)
        return 0
    except: return 0

def get_twitch_chatters():
    url = f"https://api.twitch.tv/helix/chat/chatters?broadcaster_id={TWITCH_BROADCASTER_ID}&moderator_id={TWITCH_BROADCASTER_ID}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200: return r.json().get('total', 0), "OK"
        return 0, "ERR"
    except: return 0, "OFFLINE"

def get_twitch_followers():
    url = f"https://api.twitch.tv/helix/channels/followers?broadcaster_id={TWITCH_BROADCASTER_ID}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200: return str(r.json().get('total', 695)), "OK"
        return "695", "OK"
    except: return "695", "OK"

def get_twitch_viewers():
    url = f"https://api.twitch.tv/helix/streams?user_login={TWITCH_CHANNEL}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json().get('data', [])
            if data: return data[0].get('viewer_count', 0), "OK"
            return 0, "OFFLINE"
        return 0, "ERR"
    except: return 0, "OFFLINE"

def get_facebook_page_insights():
    try:
        url = "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FBrianDivaCox%2F"
        r = session.get(url, timeout=5)
        if r.status_code == 200:
            import re
            m = re.search(r'([\d\.,]+)\s*(?:likes|followers)', r.text, re.IGNORECASE)
            if m: return m.group(1).replace(',', ''), "OK"
        r_api = session.get(f"https://graph.facebook.com/v19.0/{META_PAGE_ID}?fields=followers_count&access_token={META_TOKEN}", timeout=5)
        if r_api.status_code == 200: return str(r_api.json().get('followers_count', 5478)), "OK"
        return "5478", "OK"
    except: return "5478", "OK"

# ====================================================================
# THREADS LAB BRIDGE - NATIVE WINDOWS DESKTOP GUI EDITION (v1.0.10)
# ====================================================================

SNAP_STORE_FILE = "snapchat_count.json"

def get_snapchat_subscribers(username="briandivacox"):
    local_val = ""
    if os.path.exists(SNAP_STORE_FILE):
        try:
            with open(SNAP_STORE_FILE, "r", encoding="utf-8") as f:
                d = json.load(f)
                local_val = str(d.get("snapchat_followers") or d.get("snapchat") or "").strip()
        except: pass

    try:
        url = f"https://www.snapchat.com/add/{username}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"}
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            import re, json
            m = re.findall(r'<script id="__NEXT_DATA__" type="application/json">([^<]+)</script>', r.text)
            if m:
                d = json.loads(m[0])
                props = d.get("props", {}).get("pageProps", {}).get("userProfile", {}).get("publicProfileInfo", {})
                cnt = props.get("subscriberCount")
                if cnt and str(cnt) != "0":
                    return str(cnt), "OK"
    except: pass

    if local_val:
        return local_val, "OK"
    return "0", "OFFLINE"

def get_instagram_business_insights():
    try:
        r = session.get(f"https://graph.facebook.com/v19.0/{META_PAGE_ID}?fields=instagram_business_account{{followers_count}}&access_token={META_TOKEN}", timeout=5)
        if r.status_code == 200: return str(r.json().get('instagram_business_account', {}).get('followers_count', 5860)), "OK"
        return "5860", "OK"
    except: return "5860", "OK"

def get_threads_data():
    url_fol = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}?fields=follower_count&access_token={THREADS_TOKEN.strip()}"
    url_view = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}/threads_insights?metric=views&access_token={THREADS_TOKEN.strip()}"
    followers, views = "335", "6.6k"
    try:
        r_fol = session.get(url_fol, timeout=5)
        if r_fol.status_code == 200: followers = str(r_fol.json().get('follower_count', 335))
        r_view = session.get(url_view, timeout=5)
        if r_view.status_code == 200:
            view_data = r_view.json().get('data', [])
            if view_data and 'values' in view_data[0]:
                tot = sum(val.get('value', 0) for val in view_data[0]['values'])
                views = f"{tot / 1000:.1f}k" if tot >= 1000 else str(tot)
        return followers, views, "OK"
    except: return followers, views, "OK"

def get_youtube_subscribers():
    url = f"https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=briandivacox&key={YOUTUBE_API_KEY}"
    try:
        r = session.get(url, timeout=5)
        if r.status_code == 200:
            items = r.json().get('items', [])
            if items: return str(items[0].get('statistics', {}).get('subscriberCount', "799")), "OK"
        return "799", "OK"
    except: return "799", "OK"

def get_tiktok_followers():
    try:
        r = session.get("https://mixerno.space/api/tiktok-user-counter/user/briandivacox", timeout=5)
        if r.status_code == 200:
            for c in r.json().get('counts', []):
                if c.get('value') == 'followers': return str(c.get('count', "255")), "OK"
        return "255", "OK"
    except: return "255", "OK"

def get_twitter_followers():
    try:
        r = session.get("https://mixerno.space/api/twitter-user-counter/user/briandivacox", timeout=5)
        if r.status_code == 200:
            for c in r.json().get('counts', []):
                if c.get('value') == 'followers': return str(c.get('count', "50551")), "OK"
        return "50551", "OK"
    except: return "50551", "OK"

def push_to_firebase(plex_count, chatters, viewers, fb_count, ig_count, threads_count, threads_views, yt_sub, tt_fol, x_fol, snap_fol="0", discord_rsvp="0"):
    try:
        payload = {
            "plexCount": plex_count,
            "twitchChatters": int(chatters),
            "twitchViewers": int(viewers),
            "discordRsvp": str(discord_rsvp),
            "fbPage": str(fb_count),
            "igFol": str(ig_count),
            "threadsFol": str(threads_count),
            "threadsViews": str(threads_views),
            "ytSub": str(yt_sub),
            "ttFol": str(tt_fol),
            "xFol": str(x_fol)
        }
        session.patch(FIREBASE_URL, json=payload, timeout=3)
        return True
    except: return False

# --- DESKTOP GUI CLASS ---
class BridgeGUIApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🎬 Brian's Theater — Bridge Control Panel v1.0.13")
        self.root.geometry("820x620")
        self.root.configure(bg="#0d1117")

        self.running = False
        self.worker_thread = None

        # Custom Styles
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Header
        header_frame = tk.Frame(self.root, bg="#161b22", padx=12, pady=12)
        header_frame.pack(fill="x", side="top")
        
        title_label = tk.Label(header_frame, text="🎬 BRIAN'S THEATER LAB BRIDGE", font=("Segoe UI", 14, "bold"), fg="#ffffff", bg="#161b22")
        title_label.pack(side="left", padx=10)
        
        self.status_badge = tk.Label(header_frame, text="● ENGINE STOPPED", font=("Segoe UI", 10, "bold"), fg="#f85149", bg="#161b22")
        self.status_badge.pack(side="left", padx=15)
        
        self.btn_toggle = tk.Button(header_frame, text="▶ START ENGINE", font=("Segoe UI", 11, "bold"), fg="#ffffff", bg="#238636", activebackground="#2ea043", activeforeground="#ffffff", relief="flat", command=self.toggle_engine, width=15, cursor="hand2")
        self.btn_toggle.pack(side="right", padx=10)

        # Cards Container Grid (2 rows x 5 columns)
        cards_frame = tk.Frame(self.root, bg="#0d1117", padx=10, pady=10)
        cards_frame.pack(fill="x", side="top", pady=5)

        self.card_labels = {}
        metrics = [
            ("Plex Sessions", "plex", "#e5a00d"),
            ("Twitch Live", "twitch", "#9146ff"),
            ("Facebook", "fb", "#1877f2"),
            ("Instagram", "ig", "#e4405f"),
            ("Threads", "threads", "#000000"),
            ("YouTube", "yt", "#ff0000"),
            ("TikTok", "tt", "#00f2fe"),
            ("X / Twitter", "x", "#1d9bf0"),
            ("Snapchat", "snap", "#fffc00"),
            ("Discord RSVP", "discord", "#5865f2")
        ]

        for i, (name, key, color) in enumerate(metrics):
            r = i // 5
            c = i % 5
            box = tk.Frame(cards_frame, bg="#161b22", highlightbackground="#30363d", highlightthickness=1, padx=8, pady=8)
            box.grid(row=r, column=c, padx=5, pady=5, sticky="nsew")
            cards_frame.grid_columnconfigure(c, weight=1)

            lbl_title = tk.Label(box, text=name.upper(), font=("Segoe UI", 8, "bold"), fg="#8b949e", bg="#161b22")
            lbl_title.pack(anchor="w")
            
            lbl_val = tk.Label(box, text="--", font=("Segoe UI", 12, "bold"), fg="#ffffff", bg="#161b22")
            lbl_val.pack(anchor="w", pady=2)
            self.card_labels[key] = lbl_val

        # Activity Log Frame
        log_frame = tk.Frame(self.root, bg="#0d1117", padx=10, pady=10)
        log_frame.pack(fill="both", expand=True, side="bottom")

        lbl_log_title = tk.Label(log_frame, text="📜 Live Activity Feed", font=("Segoe UI", 9, "bold"), fg="#8b949e", bg="#0d1117")
        lbl_log_title.pack(anchor="w", pady=2)

        self.log_box = scrolledtext.ScrolledText(log_frame, bg="#161b22", fg="#c9d1d9", font=("Consolas", 9), highlightbackground="#30363d", relief="flat")
        self.log_box.pack(fill="both", expand=True)

        self.log("System initialized. Click 'START ENGINE' to begin live bridge sync.")

    def log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_box.insert(tk.END, f"[{timestamp}] {msg}\n")
        self.log_box.see(tk.END)

    def update_card(self, key, val_text):
        if key in self.card_labels:
            self.card_labels[key].config(text=str(val_text))

    def toggle_engine(self):
        if not self.running:
            self.running = True
            self.btn_toggle.config(text="⏹ STOP ENGINE", bg="#da3633", activebackground="#f85149")
            self.status_badge.config(text="● ENGINE RUNNING", fg="#3fb950")
            self.log("Starting Engine worker thread...")
            self.worker_thread = threading.Thread(target=self.engine_loop, daemon=True)
            self.worker_thread.start()
        else:
            self.running = False
            self.btn_toggle.config(text="▶ START ENGINE", bg="#238636", activebackground="#2ea043")
            self.status_badge.config(text="● ENGINE STOPPED", fg="#f85149")
            self.log("Engine stopped.")

    def engine_loop(self):
        last_meta = 0
        fb_c, ig_c, th_f, th_v = "1011", "5860", "335", "6.6k"
        yt_c, tt_c, x_c, snap_fol = "799", "255", "50551", "1.2k"
        discord_rsvp_val = "0"
        
        while self.running:
            try:
                now = time.time()
                
                # Fetch Plex & Twitch
                plex_cnt = get_plex_sessions()
                t_chat, t_chat_st = get_twitch_chatters()
                t_view, t_view_st = get_twitch_viewers()
                t_fol, _ = get_twitch_followers()
                
                tw_disp = f"{t_fol} ({t_view} Live)" if t_view > 0 else f"{t_fol}"
                self.root.after(0, self.update_card, "plex", f"{plex_cnt}")
                self.root.after(0, self.update_card, "twitch", tw_disp)

                # Fetch Meta & Socials (Every 45s)
                if now - last_meta >= META_INTERVAL or last_meta == 0:
                    fb_c, _ = get_facebook_page_insights()
                    ig_c, _ = get_instagram_business_insights()
                    th_f, th_v, _ = get_threads_data()
                    yt_c, _ = get_youtube_subscribers()
                    tt_c, _ = get_tiktok_followers()
                    x_c, _ = get_twitter_followers()
                    snap_fol, _ = get_snapchat_subscribers()
                    last_meta = now

                    self.root.after(0, self.update_card, "fb", f"{fb_c}")
                    self.root.after(0, self.update_card, "ig", f"{ig_c}")
                    self.root.after(0, self.update_card, "threads", f"{th_f} / {th_v}")
                    self.root.after(0, self.update_card, "yt", f"{yt_c}")
                    self.root.after(0, self.update_card, "tt", f"{tt_c}")
                    self.root.after(0, self.update_card, "x", f"{x_c}")
                    self.root.after(0, self.update_card, "snapchat", f"{snap_fol}")

                # Fetch Discord Events
                headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN.strip()}"}
                r_guilds = session.get("https://discord.com/api/v10/users/@me/guilds", headers=headers, timeout=5)
                if r_guilds.status_code == 200:
                    guilds = r_guilds.json()
                    if isinstance(guilds, list) and guilds:
                        g_id = guilds[0].get('id')
                        r_events = session.get(f"https://discord.com/api/v10/guilds/{g_id}/scheduled-events", headers=headers, timeout=5)
                        if r_events.status_code == 200:
                            events = [ev for ev in r_events.json() if isinstance(ev, dict) and ev.get('status') == 1]
                            events.sort(key=lambda x: x.get('scheduled_start_time') or "")
                            
                            if not events:
                                for old_id in list(rsvp_message_ids.keys()):
                                    delete_rsvp_card(old_id)
                                discord_rsvp_val = "0"
                            else:
                                next_ev = events[0]
                                ev_id, ev_name = next_ev.get('id'), next_ev.get('name')

                                # Enforce Single-Card Clean Channel: Delete any card that is NOT the next upcoming movie!
                                stale_ids = [ old_id for old_id in list(rsvp_message_ids.keys()) if old_id != ev_id ]
                                for stale_id in stale_ids:
                                    delete_rsvp_card(stale_id)

                                date_str, time_str = format_event_datetime(next_ev.get('scheduled_start_time'))
                                
                                u_names = []
                                ru = session.get(f"https://discord.com/api/v10/guilds/{g_id}/scheduled-events/{ev_id}/users?with_member=true", headers=headers, timeout=5)
                                if ru.status_code == 200:
                                    for uitem in ru.json():
                                        u_info, m_info = uitem.get('user', {}), uitem.get('member', {})
                                        dname = m_info.get('nick') or u_info.get('global_name') or u_info.get('username')
                                        handle = u_info.get('username')
                                        if dname: u_names.append(f"{dname} (@{handle})" if handle else dname)
                                
                                discord_rsvp_val = str(len(u_names))
                                send_rsvp_card(ev_id, ev_name, date_str, time_str, len(u_names), u_names)
                                active_msg_id = rsvp_message_ids.get(ev_id)
                                if active_msg_id:
                                    purge_old_channel_messages(active_msg_id)
                                self.root.after(0, self.update_card, "discord", f"{ev_name[:10]}: {discord_rsvp_val} RSVP")

                # Push to Firebase
                ok = push_to_firebase(plex_cnt, t_chat, t_view, fb_c, ig_c, th_f, th_v, yt_c, tt_c, x_c, snap_fol, discord_rsvp_val)
                summary_key = (plex_cnt, t_view, discord_rsvp_val, fb_c, ig_c)
                if ok and (not hasattr(self, 'last_log_key') or self.last_log_key != summary_key):
                    self.last_log_key = summary_key
                    self.root.after(0, self.log, f"Synced to Firebase | RSVP: {discord_rsvp_val} | Plex: {plex_cnt} | Twitch: {t_view_st}")
                
            except Exception as e:
                self.root.after(0, self.log, f"Loop error: {e}")
            
            time.sleep(FAST_INTERVAL)

if __name__ == "__main__":
    root = tk.Tk()
    app = BridgeGUIApp(root)
    root.mainloop()
