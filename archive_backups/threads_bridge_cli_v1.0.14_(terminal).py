# ====================================================================
# THREADS LAB BRIDGE - CLI STATIC BOX EDITION (v1.0.14)
# ====================================================================
import requests
import time
import sys
import os
import json

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

# --- FACEBOOK / INSTAGRAM ASSETS ---
META_PAGE_ID = "55320913267"
META_TOKEN = """EAAOJz87tfbEBSEa1Qp1BHsqbv5xdRmSIZAFqmyFdTqLCzOedtt1RvHpu4yJzgfqhd9xUw5n7qMYuWaxkeDKToywd7j4Ee4ZBfE13mZCPQl9zmIeiAIJqEiofwsLUdwFQTnCZAm3BfKMpe2xEJZA3OOEqVukYQ6ZAkyuBGIWACsuZAf2njbP8YZBUrNLeQBk8AZBeX6TWO4gAPbgZDZD""".strip()

# --- YOUTUBE ASSETS ---
YOUTUBE_API_KEY = "AIzaSyCthMF6w_oq0SzmCr_1_xqRZCou0Wz_HgU"
YOUTUBE_CHANNEL_ID = "UCG79Tq48xXqg8M9b1K-10Sg"

# --- THREADS ASSETS ---
THREADS_USER_ID = "17841400269553641"
THREADS_TOKEN = "THAAg36cTPHF1BYmJxNmlDOEwyT09wVnVXSldOVU13b2dLX2Qwck9seVg1LXg3N2ozcUJiel9tTXVqTFNxX3NqeHRLOUpPM3pCZAkF1SnY4NWUyLXFxVnVrT1N2b0Q2S3BfV2Q4cXpmblhHY2FLaEF4RVNTMi1YNkx4ZAmRiY3R4ZAl9hUQZDZD"

# --- DISCORD ASSETS ---
DISCORD_BOT_TOKEN = "MTUzMzU3OTU1MjE4NDMzNjM4NA." + "GC3hup.WqnunYrhrCJ3Ksny33YODooyYrmGIbhEasfr10"
DISCORD_GUILD_ID = "964526957721186354"
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1533569013706129538/dnx__aVXxU7rwxZGHw4zk5j-pLw5-gvoKpNOuJXJ4hOitt5qEfLjJm1MKHVC3i33lNuE"
DISCORD_EVENT_WEBHOOK_URL = "https://discord.com/api/webhooks/1533689615439892491/UxGOzEEwFd9uCwNi482J09WZ-z2gG4yxpSaPrNcT7C56Vvd8yIIaeWaiZJo_JblmBt8i"

FIREBASE_URL = "https://brians-theater-default-rtdb.firebaseio.com/labData.json"

META_INTERVAL = 45          
RETRY_COOLDOWN = 10         
TOKEN_RENEW_INTERVAL = 20 * 86400 
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
        from datetime import datetime
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

last_discord_check = 0
DISCORD_INTERVAL = 20
discord_status = "FETCHING..."
discord_event_summary = ""
last_discord_rsvp = "0"
discord_initial_run = True
discord_events_cache = {}

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
    if ev_id in rsvp_message_ids:
        del rsvp_message_ids[ev_id]
        save_rsvp_message_ids()

def get_snapchat_subscribers(username="briandivacox"):
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
    return "0", "OFFLINE"

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

def check_discord_events():
    global discord_initial_run, last_discord_check, discord_status, discord_event_summary
    if not DISCORD_BOT_TOKEN:
        discord_status = "DISABLED"
        return
    
    current_time = time.time()
    if current_time - last_discord_check < DISCORD_INTERVAL:
        return
    last_discord_check = current_time

    headers = {"Authorization": f"Bot {DISCORD_BOT_TOKEN.strip()}"}
    try:
        r_guilds = session.get("https://discord.com/api/v10/users/@me/guilds", headers=headers, timeout=5)
        if r_guilds.status_code == 429:
            retry = r_guilds.json().get('retry_after', 10)
            last_discord_check = current_time + retry
            discord_status = "RATE_LIMIT"
            return
        if r_guilds.status_code != 200:
            discord_status = f"ERR:{r_guilds.status_code}"
            return
        guilds = r_guilds.json()
        if not isinstance(guilds, list): return
        
        event_summaries = []
        for g in guilds:
            g_id = g.get('id')
            r_events = session.get(f"https://discord.com/api/v10/guilds/{g_id}/scheduled-events", headers=headers, timeout=5)
            if r_events.status_code == 429:
                retry = r_events.json().get('retry_after', 10)
                last_discord_check = current_time + retry
                discord_status = "RATE_LIMIT"
                return
            if r_events.status_code == 200:
                events = [ev for ev in r_events.json() if isinstance(ev, dict) and ev.get('status') == 1]
                events.sort(key=lambda x: x.get('scheduled_start_time') or "")
                
                if not events:
                    for old_id in list(rsvp_message_ids.keys()):
                        delete_rsvp_card(old_id)
                    discord_status = "OK (No upcoming events)"
                    continue
                
                next_ev = events[0]
                ev_id = next_ev.get('id')

                # Enforce Single-Card Clean Channel: Delete any card that is NOT the next upcoming movie!
                stale_ids = [ old_id for old_id in list(rsvp_message_ids.keys()) if old_id != ev_id ]
                for stale_id in stale_ids:
                    delete_rsvp_card(stale_id)

                active_msg_id = rsvp_message_ids.get(ev_id)
                if active_msg_id:
                    purge_old_channel_messages(active_msg_id)
                    
                ev_name = next_ev.get('name')
                start_time_iso = next_ev.get('scheduled_start_time')
                date_str, time_str = format_event_datetime(start_time_iso)
                user_names = []
                ru = session.get(f"https://discord.com/api/v10/guilds/{g_id}/scheduled-events/{ev_id}/users?with_member=true", headers=headers, timeout=5)
                if ru.status_code == 200:
                    res_users = ru.json()
                    if isinstance(res_users, list):
                        for uitem in res_users:
                            u_info = uitem.get('user', {})
                            m_info = uitem.get('member', {})
                            dname = m_info.get('nick') or u_info.get('global_name') or u_info.get('username')
                            handle = u_info.get('username')
                            if dname:
                                user_names.append(f"{dname} (@{handle})" if handle else dname)
                
                user_count = len(user_names)
                old_count = discord_events_cache.get(ev_id)
                
                if discord_initial_run or (old_count is not None and user_count != old_count):
                    send_rsvp_card(ev_id, ev_name, date_str, time_str, user_count, user_names)
                    
                discord_events_cache[ev_id] = user_count
                event_summaries.append(f"NEXT:{ev_name[:8]}:{user_count}")
                
                global last_discord_rsvp
                last_discord_rsvp = str(user_count)
                    
        discord_status = "OK"
        discord_event_summary = ", ".join(event_summaries) if event_summaries else "0 events"
        discord_initial_run = False
    except Exception:
        discord_status = "ERR"

def handle_api_status(response_or_exception):
    if isinstance(response_or_exception, Exception): return "OFFLINE"
    res = response_or_exception
    if res.status_code == 200: return "OK"
    elif res.status_code == 401: return "EXPIRED"
    elif res.status_code == 403: return "BLOCKED"
    elif res.status_code == 429: return "RATE_LIMIT"
    return f"ERR:{res.status_code}"

def get_plex_sessions():
    url = f"http://{PLEX_IP}:{PLEX_PORT}/status/sessions?X-Plex-Token={PLEX_TOKEN}"
    try:
        r = session.get(url, headers={'Accept': 'application/json'}, timeout=5)
        if r.status_code == 200:
            return r.json().get('MediaContainer', {}).get('size', 0)
        return 0
    except: return 0

def get_twitch_chatters():
    url = f"https://api.twitch.tv/helix/chat/chatters?broadcaster_id={TWITCH_BROADCASTER_ID}&moderator_id={TWITCH_BROADCASTER_ID}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200: return r.json().get('total', 0), "OK"
        return 0, handle_api_status(r)
    except Exception as e: return 0, handle_api_status(e)

def get_twitch_viewers():
    url = f"https://api.twitch.tv/helix/streams?user_login={TWITCH_CHANNEL}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json().get('data', [])
            if data: return data[0].get('viewer_count', 0), "OK"
            return 0, "LIVE_OFFLINE"
        return 0, handle_api_status(r)
    except Exception as e: return 0, handle_api_status(e)

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

def get_instagram_business_insights():
    url = f"https://graph.facebook.com/v19.0/{META_PAGE_ID}?fields=instagram_business_account{{followers_count}}&access_token={META_TOKEN}"
    try:
        r = session.get(url, timeout=5)
        if r.status_code == 200:
            ig_acc = r.json().get('instagram_business_account', {})
            return str(ig_acc.get('followers_count', 0)), "OK"
        return "0", handle_api_status(r)
    except Exception as e: return "0", handle_api_status(e)

def get_threads_data():
    url_fol = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}?fields=follower_count&access_token={THREADS_TOKEN.strip()}"
    url_view = f"https://graph.threads.net/v1.0/{THREADS_USER_ID}/threads_insights?metric=views&access_token={THREADS_TOKEN.strip()}"
    followers, views, status_state = "0", "0", "OK"
    try:
        r_fol = session.get(url_fol, timeout=5)
        if r_fol.status_code == 200: followers = str(r_fol.json().get('follower_count', 0))
        else: status_state = handle_api_status(r_fol)
        
        r_view = session.get(url_view, timeout=5)
        if r_view.status_code == 200:
            view_data = r_view.json().get('data', [])
            total_views = sum(val.get('value', 0) for val in view_data[0]['values']) if (view_data and 'values' in view_data[0]) else 0
            if total_views >= 1000000: views = f"{total_views / 1000000:.1f}m"
            elif total_views >= 1000: views = f"{total_views / 1000:.1f}k"
            else: views = str(total_views)
        else:
            if status_state == "OK": status_state = handle_api_status(r_view)
        return followers, views, status_state
    except Exception as e: return "0", "0", handle_api_status(e)

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
                if c.get('value') == 'followers': return str(c.get('count', "0")), "OK"
        return "0", handle_api_status(r)
    except Exception as e: return "0", handle_api_status(e)

def get_twitter_followers():
    try:
        r = session.get("https://mixerno.space/api/twitter-user-counter/user/briandivacox", timeout=5)
        if r.status_code == 200:
            for c in r.json().get('counts', []):
                if c.get('value') == 'followers': return str(c.get('count', "0")), "OK"
        return "0", handle_api_status(r)
    except Exception as e: return "0", handle_api_status(e)

def get_snapchat_subscribers():
    try:
        r = session.get("https://story.snapchat.com/s/briandivacox", timeout=5)
        if r.status_code == 200 and "subscribers" in r.text.lower():
            import re
            m = re.search(r'([\d\.,kKmM]+)\s+subscribers', r.text, re.IGNORECASE)
            if m: return m.group(1), "OK"
        return "0", handle_api_status(r)
    except Exception as e: return "0", handle_api_status(e)

def push_to_firebase(plex_count, chatters, viewers, fb_count, ig_count, threads_count, threads_views, yt_sub, tt_fol, x_fol, snap_fol="0", discord_rsvp="0"):
    try:
        payload = {
            "plexCount": plex_count,
            "twitchChatters": int(chatters),
            "twitchViewers": int(viewers),
            "discordRsvp": str(discord_rsvp)
        }
        if "ERR" not in str(fb_count) and "FETCHING" not in str(fb_count): payload["fbPage"] = str(fb_count)
        if "ERR" not in str(ig_count) and "FETCHING" not in str(ig_count): payload["igFol"] = str(ig_count)
        if "ERR" not in str(threads_count) and "FETCHING" not in str(threads_count): payload["threadsFol"] = str(threads_count)
        if "ERR" not in str(threads_views) and "FETCHING" not in str(threads_views): payload["threadsViews"] = str(threads_views)
        if "ERR" not in str(yt_sub) and "FETCHING" not in str(yt_sub): payload["ytSub"] = str(yt_sub)
        if "ERR" not in str(tt_fol) and "FETCHING" not in str(tt_fol): payload["ttFol"] = str(tt_fol)
        if "ERR" not in str(x_fol) and "FETCHING" not in str(x_fol): payload["xFol"] = str(x_fol)
        if "ERR" not in str(snap_fol) and "FETCHING" not in str(snap_fol) and str(snap_fol) != "0": payload["snapFol"] = str(snap_fol)
        
        session.patch(FIREBASE_URL, json=payload, timeout=3)
        return True
    except: return False

cached_fb, cached_ig, fb_status, ig_status = "0", "0", "FETCHING...", "FETCHING..."
cached_th_fol, cached_th_views, th_status = "0", "0", "FETCHING..."
cached_yt, yt_status = "799", "FETCHING..."
cached_tt, tt_status = "0", "FETCHING..."
cached_x, x_status = "0", "FETCHING..."
cached_snap, snap_status = "0", "FETCHING..."
twitch_view_status, twitch_chat_status = "FETCHING...", "FETCHING..."

last_meta_check = 0
last_failed_meta_check = 0

def get_twitch_followers():
    url = f"https://api.twitch.tv/helix/channels/followers?broadcaster_id={TWITCH_BROADCASTER_ID}"
    headers = {"Client-ID": TWITCH_CLIENT_ID, "Authorization": f"Bearer {TWITCH_TOKEN}"}
    try:
        r = session.get(url, headers=headers, timeout=5)
        if r.status_code == 200: return str(r.json().get('total', 695)), "OK"
        return "695", "OK"
    except: return "695", "OK"

# --- MAIN ENGINE LOOP (STATIC ASCII BOX) ---
try:
    while True:
        current_time = time.time()
        check_discord_events()
        p_count = get_plex_sessions()
        t_chatters, twitch_chat_status = get_twitch_chatters()
        t_viewers, twitch_view_status = get_twitch_viewers()
        t_fol, _ = get_twitch_followers()
        tw_display = f"{t_fol} ({t_viewers} Live)" if t_viewers > 0 else f"{t_fol}"
        
        time_for_normal_check = (current_time - last_meta_check >= META_INTERVAL)
        time_for_retry_check = (current_time - last_failed_meta_check >= RETRY_COOLDOWN)
        has_errors = ("ERR" in [fb_status, ig_status, th_status]) or ("FETCHING" in [fb_status, ig_status])

        if time_for_normal_check or (has_errors and time_for_retry_check):
            fb_val, fb_status = get_facebook_page_insights()
            if fb_status == "OK": cached_fb = fb_val
            ig_val, ig_status = get_instagram_business_insights()
            if ig_status == "OK": cached_ig = ig_val
            th_fol_res, th_view_res, th_status = get_threads_data()
            if th_status == "OK": cached_th_fol, cached_th_views = th_fol_res, th_view_res
            yt_val, yt_status = get_youtube_subscribers()
            if yt_status == "OK": cached_yt = yt_val
            tt_val, tt_status = get_tiktok_followers()
            if tt_status == "OK": cached_tt = tt_val
            x_val, x_status = get_twitter_followers()
            if x_status == "OK": cached_x = x_val
            snap_val, snap_status = get_snapchat_subscribers()
            if snap_status == "OK": cached_snap = snap_val
            
            if all(s == "OK" for s in [fb_status, ig_status, th_status, yt_status, tt_status, x_status]):
                last_meta_check = current_time
            else: last_failed_meta_check = current_time
        
        success = push_to_firebase(p_count, t_chatters, t_viewers, cached_fb, cached_ig, cached_th_fol, cached_th_views, cached_yt, cached_tt, cached_x, cached_snap, last_discord_rsvp)
        global_status = "RUNNING" if success else "DB_ERR"
        
        # Clear screen and draw a crisp static box!
        os.system('cls' if os.name == 'nt' else 'clear')
        print("╔════════════════════════════════════════════════════════════════════════════════╗")
        print("║                     🎬 BRIAN'S THEATER LAB BRIDGE ENGINE                      ║")
        print(f"║ [STATUS: {global_status:<7}] Plex: {p_count:<2} | Twitch: {tw_display:<14} | DiscEvents: {discord_status:<12} ║")
        print("╠════════════════════════════════════════════════════════════════════════════════╣")
        print(f"║ Meta  FB: {cached_fb:<6} | IG: {cached_ig:<6} | Threads: {cached_th_fol}/{cached_th_views:<12}                ║")
        print(f"║ Media YT: {cached_yt:<6} | TT: {cached_tt:<6} | X: {cached_x:<7} | Snap: {cached_snap:<6}            ║")
        print("╚════════════════════════════════════════════════════════════════════════════════╝")
        time.sleep(FAST_INTERVAL)
except Exception as e:
    print(f"\nCRASH: {e}")
    input("\nExit...")
