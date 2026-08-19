# ====================================================================
# 🛡️ BDC LIVE TICKET & BUG ALERT COMMUNICATOR (DESKTOP PRO EDITION)
# ====================================================================
# Real-Time Desktop Alert Hub for Whiteout Survival Alliance [BDC]
#  • 📡 24/7 Firebase Background Ticket Watcher
#  • 🔊 Melodic Audio Chimes on New Bug / Feature Submissions
#  • 🪟 Floating Desktop Toast Popups (Bottom-Right Windows Overlay)
#  • 📝 Spacious In-App Multi-Line Resolution Notes & Status Manager
#  • ↔️ Draggable Side-to-Side Splitter with Window Size/Position Memory
#  • 🔕 Windows System Tray Minimization
# ====================================================================

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import requests
import time
import sys
import os
import json
import webbrowser
import winsound
from datetime import datetime
from PIL import Image, ImageTk
import pystray

# Windows UTF-8 stdout
if sys.platform == 'win32':
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# --- CONSTANTS & CONFIGURATION ---
APP_VERSION = "v1.0.67"
WOS_FIREBASE_URL = "https://wos-dashboard-38d4c-default-rtdb.firebaseio.com"
WOS_FIREBASE_SECRET = "n5fTnxcK5J5ddNsT77AhZIoQGTogW3ROpk4k03Sv"
PUBLIC_WEBSITE_URL = "https://wosbdc.github.io/#feedback"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
SEEN_FILE = os.path.join(DATA_DIR, "seen_ticket_ids.json") if os.path.exists(os.path.join(DATA_DIR, "seen_ticket_ids.json")) else (os.path.join(BASE_DIR, "seen_ticket_ids.json") if os.path.exists(os.path.join(BASE_DIR, "seen_ticket_ids.json")) else os.path.join(DATA_DIR, "seen_ticket_ids.json"))
CONFIG_FILE = os.path.join(BASE_DIR, "communicator_config.json")
ICON_ICO = os.path.join(BASE_DIR, "central_command_icon.ico")
ICON_PNG = os.path.join(BASE_DIR, "central_command_icon.png")

# --- MODERN CYBERPUNK COLOR PALETTE ---
C_BG = "#080c14"           # Deep space black
C_HEADER = "#0d131f"       # Top header banner
C_PANEL = "#111827"        # Dark slate pane background
C_CARD_BG = "#172033"      # Elevated ticket card
C_CARD_HOVER = "#1e293b"   # Card hover glow
C_CARD_SEL = "#0f2b48"     # Selected card background
C_BORDER = "#1f293d"       # Subtle border line
C_BORDER_ACCENT = "#00d2ff"# Neon cyan highlight border
C_INPUT = "#090d16"        # Deep input boxes
C_ACCENT = "#00d2ff"       # Vibrant Neon Cyan
C_PURPLE = "#8b5cf6"       # Electric Violet
C_TEXT = "#f8fafc"         # Crisp white text
C_MUTED = "#94a3b8"        # Soft slate grey
C_GREEN = "#10b981"        # Emerald Green
C_GREEN_BG = "#064e3b"     # Emerald pill bg
C_RED = "#f43f5e"          # Crimson Rose
C_RED_BG = "#4c0519"       # Crimson pill bg
C_AMBER = "#f59e0b"        # Warm Amber
C_AMBER_BG = "#451a03"     # Amber pill bg
C_BLUE = "#38bdf8"         # Sky Blue
C_BLUE_BG = "#0c4a6e"      # Sky Blue pill bg

class AutoScrollbar(tk.Scrollbar):
    """Intelligent scrollbar that automatically hides itself when content fits the view."""
    def set(self, lo, hi):
        if float(lo) <= 0.0 and float(hi) >= 1.0:
            self.pack_forget()
        else:
            if self.cget('orient') == 'horizontal':
                self.pack(side='bottom', fill='x')
            else:
                self.pack(side='right', fill='y')
        tk.Scrollbar.set(self, lo, hi)

class TicketAlertCommunicator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title(f"BDC Live Alert Communicator {APP_VERSION} — Bug & Ticket Desk")
        self.root.minsize(920, 600)
        self.root.configure(bg=C_BG)

        # Set Window Icon
        if os.path.exists(ICON_ICO):
            try:
                self.root.iconbitmap(ICON_ICO)
            except Exception:
                pass

        # Data State
        self.tickets = {}
        self.seen_ids = set()
        self.selected_item_id = None
        self.sound_enabled = tk.BooleanVar(value=True)
        self.toast_enabled = tk.BooleanVar(value=True)
        self.poll_interval = 15  # seconds
        self.is_running = True
        self.filter_type = "all"  # all, pending, in_progress, completed, bug
        self.search_query = ""
        self.current_toast_window = None

        self.saved_geometry = "1200x780"
        self.saved_sash_pos = 500

        self.load_local_state()
        self.root.geometry(self.saved_geometry)

        # Build UI
        self.build_gui()

        # System Tray Icon Setup
        self.tray_icon = None
        self.setup_tray()

        # Window Close Hook & Persistence
        self.root.protocol('WM_DELETE_WINDOW', self.hide_to_tray)

        # Start Background Watcher Thread
        self.watcher_thread = threading.Thread(target=self.background_watcher_loop, daemon=True)
        self.watcher_thread.start()

        # Initial fetch
        self.refresh_tickets_async()

    # ====================================================================
    # 💾 LOCAL PERSISTENCE (WINDOW GEOMETRY & SASH MEMORY)
    # ====================================================================
    def load_local_state(self):
        if os.path.exists(SEEN_FILE):
            try:
                with open(SEEN_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.seen_ids = set(data)
            except Exception:
                pass

        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    self.sound_enabled.set(cfg.get("sound_enabled", True))
                    self.toast_enabled.set(cfg.get("toast_enabled", True))
                    if "geometry" in cfg:
                        self.saved_geometry = cfg["geometry"]
                    if "sash_position" in cfg:
                        self.saved_sash_pos = cfg["sash_position"]
            except Exception:
                pass

    def save_local_state(self):
        try:
            with open(SEEN_FILE, "w", encoding="utf-8") as f:
                json.dump(list(self.seen_ids), f, indent=2)
        except Exception:
            pass

        try:
            cur_geom = self.root.geometry()
            cur_sash = self.saved_sash_pos
            if hasattr(self, 'paned_window'):
                try:
                    coords = self.paned_window.sash_coord(0)
                    if coords and len(coords) > 0:
                        cur_sash = coords[0]
                except Exception:
                    pass
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "sound_enabled": self.sound_enabled.get(),
                    "toast_enabled": self.toast_enabled.get(),
                    "geometry": cur_geom,
                    "sash_position": cur_sash
                }, f, indent=2)
        except Exception:
            pass

    # ====================================================================
    # 🔊 SOUND & TOAST ALERT SYSTEM
    # ====================================================================
    def play_ticket_chime(self):
        if not self.sound_enabled.get():
            return
        def _beep():
            try:
                winsound.Beep(523, 70)
                winsound.Beep(659, 70)
                winsound.Beep(784, 80)
                winsound.Beep(1046, 150)
            except Exception:
                try:
                    winsound.MessageBeep(winsound.MB_ICONEXCLAMATION)
                except Exception:
                    pass
        threading.Thread(target=_beep, daemon=True).start()

    def show_floating_toast(self, ticket_id, ticket):
        if not self.toast_enabled.get():
            return
        self.root.after(0, lambda: self._render_toast(ticket_id, ticket))

    def _render_toast(self, ticket_id, ticket):
        if self.current_toast_window:
            try:
                self.current_toast_window.destroy()
            except Exception:
                pass
            self.current_toast_window = None

        toast = tk.Toplevel(self.root)
        self.current_toast_window = toast
        toast.overrideredirect(True)
        toast.attributes('-topmost', True)
        toast.configure(bg=C_PANEL)

        try:
            toast.attributes('-alpha', 0.96)
        except Exception:
            pass

        # Position at bottom-right
        screen_w = toast.winfo_screenwidth()
        screen_h = toast.winfo_screenheight()
        w = 420
        h = 175
        x = screen_w - w - 24
        y = screen_h - h - 60
        toast.geometry(f"{w}x{h}+{x}+{y}")

        # Border Frame
        is_bug = ticket.get("type") == "bug"
        badge_color = C_RED if is_bug else C_ACCENT
        badge_text = "🐞 NEW BUG REPORT" if is_bug else "💡 NEW FEATURE REQUEST"

        outer = tk.Frame(toast, bg=badge_color, padx=2, pady=2)
        outer.pack(fill="both", expand=True)

        inner = tk.Frame(outer, bg=C_PANEL, padx=14, pady=12)
        inner.pack(fill="both", expand=True)

        # Header Row
        hdr = tk.Frame(inner, bg=C_PANEL)
        hdr.pack(fill="x", side="top")

        lbl_badge = tk.Label(hdr, text=badge_text, fg=badge_color, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        lbl_badge.pack(side="left")

        lbl_cat = tk.Label(hdr, text=f"[{ticket.get('category', 'General')}]", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8, "bold"))
        lbl_cat.pack(side="left", padx=6)

        btn_close = tk.Label(hdr, text="✕", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 10, "bold"), cursor="hand2")
        btn_close.pack(side="right")
        btn_close.bind("<Button-1>", lambda e: toast.destroy())

        # Title
        t_title = ticket.get("title", "Untitled Ticket")
        if len(t_title) > 42:
            t_title = t_title[:39] + "..."
        lbl_title = tk.Label(inner, text=t_title, fg=C_TEXT, bg=C_PANEL, font=("Segoe UI", 11, "bold"), anchor="w")
        lbl_title.pack(fill="x", pady=(4, 2))

        # Author / Date
        author = ticket.get("submittedBy", {}).get("name", "Chief") if isinstance(ticket.get("submittedBy"), dict) else "Chief"
        lbl_sub = tk.Label(inner, text=f"👤 Submitted by {author} • Just now", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8), anchor="w")
        lbl_sub.pack(fill="x", pady=(0, 8))

        # Actions
        btn_row = tk.Frame(inner, bg=C_PANEL)
        btn_row.pack(fill="x", side="bottom")

        def open_in_app():
            toast.destroy()
            self.restore_from_tray()
            self.select_ticket_by_id(ticket_id)

        def mark_done_direct():
            toast.destroy()
            threading.Thread(target=self.update_ticket_status_remote, args=(ticket_id, "completed", None), daemon=True).start()

        btn_open = tk.Button(btn_row, text="✏️ Open & Add Note", bg=C_ACCENT, fg="#000", font=("Segoe UI", 8, "bold"),
                             relief="flat", padx=10, pady=4, cursor="hand2", command=open_in_app)
        btn_open.pack(side="left", padx=(0, 6))

        btn_done = tk.Button(btn_row, text="✅ Resolve Now", bg=C_GREEN, fg="#000", font=("Segoe UI", 8, "bold"),
                             relief="flat", padx=10, pady=4, cursor="hand2", command=mark_done_direct)
        btn_done.pack(side="left")

        # Auto-dismiss after 12 seconds
        toast.after(12000, lambda: toast.destroy() if toast.winfo_exists() else None)

    # ====================================================================
    # 🔄 FIREBASE SYNC & REMOTE OPERATIONS
    # ====================================================================
    def background_watcher_loop(self):
        while self.is_running:
            try:
                self.fetch_tickets_worker(is_background=True)
            except Exception as e:
                print(f"[Watcher Error] {e}")
            time.sleep(self.poll_interval)

    def refresh_tickets_async(self):
        threading.Thread(target=lambda: self.fetch_tickets_worker(is_background=False), daemon=True).start()

    def fetch_tickets_worker(self, is_background=False):
        url = f"{WOS_FIREBASE_URL}/community_feedback.json?auth={WOS_FIREBASE_SECRET}"
        try:
            resp = requests.get(url, timeout=12)
            if resp.status_code == 200:
                data = resp.json() or {}
                self.process_incoming_tickets(data, is_background)
        except Exception as e:
            if not is_background:
                self.root.after(0, lambda: messagebox.showerror("Connection Error", f"Failed to fetch tickets:\n{e}"))

    def process_incoming_tickets(self, raw_data, is_background):
        new_items_found = []
        is_first_load = (len(self.seen_ids) == 0 and len(self.tickets) == 0)

        for k, v in raw_data.items():
            if not isinstance(v, dict):
                continue
            item_id = v.get("id") or k
            v["id"] = item_id
            self.tickets[item_id] = v

            if item_id not in self.seen_ids:
                self.seen_ids.add(item_id)
                if not is_first_load:
                    new_items_found.append((item_id, v))

        self.save_local_state()
        self.root.after(0, self.render_ticket_list)
        self.root.after(0, self.update_status_bar)

        # Trigger chime & toasts on new arrivals
        if new_items_found:
            self.play_ticket_chime()
            for t_id, t_data in new_items_found[:3]:
                self.show_floating_toast(t_id, t_data)

    def update_ticket_status_remote(self, item_id, new_status, admin_note=None):
        def _update():
            try:
                url = f"{WOS_FIREBASE_URL}/community_feedback/{item_id}.json?auth={WOS_FIREBASE_SECRET}"
                payload = {
                    "status": new_status,
                    "updatedAt": int(time.time() * 1000)
                }
                if admin_note is not None:
                    payload["adminNote"] = admin_note

                resp = requests.patch(url, json=payload, timeout=10)
                if resp.status_code == 200:
                    if item_id in self.tickets:
                        self.tickets[item_id]["status"] = new_status
                        if admin_note is not None:
                            self.tickets[item_id]["adminNote"] = admin_note
                    self.root.after(0, self.render_ticket_list)
                    self.root.after(0, self.update_status_bar)
                    self.root.after(0, lambda: self.show_save_toast("✓ Synced to Cloud Database!"))
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Save Error", f"Failed to save changes:\n{e}"))
        threading.Thread(target=_update, daemon=True).start()

    def delete_ticket_remote(self, item_id):
        if not messagebox.askyesno("Confirm Delete", "Are you sure you want to permanently delete this ticket?"):
            return
        def _del():
            try:
                url = f"{WOS_FIREBASE_URL}/community_feedback/{item_id}.json?auth={WOS_FIREBASE_SECRET}"
                resp = requests.delete(url, timeout=10)
                if resp.status_code == 200:
                    if item_id in self.tickets:
                        del self.tickets[item_id]
                    self.selected_item_id = None
                    self.root.after(0, self.render_ticket_list)
                    self.root.after(0, self.clear_inspector)
                    self.root.after(0, lambda: messagebox.showinfo("Deleted", "Ticket deleted successfully."))
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Delete error: {e}"))
        threading.Thread(target=_del, daemon=True).start()

    # ====================================================================
    # 🖥️ GUI LAYOUT & MODERN CYBER DESIGN
    # ====================================================================
    def build_gui(self):
        # 1. Top Header Banner
        hdr = tk.Frame(self.root, bg=C_HEADER, height=68, padx=18, pady=12)
        hdr.pack(fill="x", side="top")

        # Brand / Title Box
        title_box = tk.Frame(hdr, bg=C_HEADER)
        title_box.pack(side="left")

        lbl_logo = tk.Label(title_box, text="🛡️", font=("Segoe UI", 20), bg=C_HEADER, fg=C_ACCENT)
        lbl_logo.pack(side="left", padx=(0, 10))

        t_text = tk.Frame(title_box, bg=C_HEADER)
        t_text.pack(side="left")

        title_row = tk.Frame(t_text, bg=C_HEADER)
        title_row.pack(anchor="w")

        lbl_app_name = tk.Label(title_row, text="BDC LIVE TICKET & ALERT DESK", font=("Segoe UI", 13, "bold"), fg=C_TEXT, bg=C_HEADER)
        lbl_app_name.pack(side="left")

        lbl_ver_badge = tk.Label(title_row, text=APP_VERSION, font=("Segoe UI", 8, "bold"), fg=C_ACCENT, bg="#083344", padx=6, pady=1)
        lbl_ver_badge.pack(side="left", padx=(8, 0))

        status_row = tk.Frame(t_text, bg=C_HEADER)
        status_row.pack(anchor="w", pady=(2, 0))

        self.lbl_pulse_dot = tk.Label(status_row, text="●", fg=C_GREEN, bg=C_HEADER, font=("Segoe UI", 9, "bold"))
        self.lbl_pulse_dot.pack(side="left", padx=(0, 4))

        self.lbl_status_badge = tk.Label(status_row, text="LIVE FIREBASE WATCHER • Polling every 15s", font=("Segoe UI", 8, "bold"), fg=C_MUTED, bg=C_HEADER)
        self.lbl_status_badge.pack(side="left")

        # Right Actions & Toggles
        actions_box = tk.Frame(hdr, bg=C_HEADER)
        actions_box.pack(side="right")

        # Checkbutton Toggles
        chk_sound = tk.Checkbutton(actions_box, text="🔊 Audio Chimes", variable=self.sound_enabled,
                                   bg=C_HEADER, fg=C_TEXT, selectcolor=C_INPUT, activebackground=C_HEADER,
                                   activeforeground=C_ACCENT, font=("Segoe UI", 9, "bold"),
                                   command=self.save_local_state)
        chk_sound.pack(side="left", padx=8)

        chk_toast = tk.Checkbutton(actions_box, text="🪟 Toast Popups", variable=self.toast_enabled,
                                   bg=C_HEADER, fg=C_TEXT, selectcolor=C_INPUT, activebackground=C_HEADER,
                                   activeforeground=C_ACCENT, font=("Segoe UI", 9, "bold"),
                                   command=self.save_local_state)
        chk_toast.pack(side="left", padx=8)

        btn_test = tk.Button(actions_box, text="🔔 Test Alert", bg="#6366f1", fg="#fff", font=("Segoe UI", 9, "bold"),
                             relief="flat", padx=12, pady=5, cursor="hand2", command=self.trigger_test_alert)
        btn_test.pack(side="left", padx=5)

        btn_refresh = tk.Button(actions_box, text="🔄 Refresh", bg="#1e293b", fg=C_TEXT, font=("Segoe UI", 9, "bold"),
                                relief="flat", padx=12, pady=5, cursor="hand2", command=self.refresh_tickets_async)
        btn_refresh.pack(side="left", padx=5)

        btn_web = tk.Button(actions_box, text="🌐 Open Portal", bg=C_ACCENT, fg="#080c14", font=("Segoe UI", 9, "bold"),
                            relief="flat", padx=12, pady=5, cursor="hand2", command=lambda: webbrowser.open(PUBLIC_WEBSITE_URL))
        btn_web.pack(side="left", padx=5)

        # 2. Main Content Split Pane with Moveable Divider (Side-to-Side Splitter)
        self.paned_window = tk.PanedWindow(self.root, orient="horizontal", bg=C_BORDER,
                                           sashwidth=7, sashrelief="raised", bd=0, opaqueresize=True)
        self.paned_window.pack(fill="both", expand=True, padx=12, pady=12)

        # Left Pane: Ticket Stream
        self.left_pane = tk.Frame(self.paned_window, bg=C_PANEL, padx=12, pady=12)
        self.paned_window.add(self.left_pane, minsize=340, width=self.saved_sash_pos)

        # Filter Tabs Row
        filter_box = tk.Frame(self.left_pane, bg=C_PANEL)
        filter_box.pack(fill="x", pady=(0, 8))

        self.btn_f_all = self.create_filter_tab(filter_box, "All (0)", "all", True)
        self.btn_f_pend = self.create_filter_tab(filter_box, "🟡 Pending (0)", "pending")
        self.btn_f_prog = self.create_filter_tab(filter_box, "🔵 In Progress (0)", "in_progress")
        self.btn_f_done = self.create_filter_tab(filter_box, "✅ Done (0)", "completed")
        self.btn_f_bugs = self.create_filter_tab(filter_box, "🐞 Bugs (0)", "bug")

        # Search Bar
        search_box = tk.Frame(self.left_pane, bg=C_PANEL)
        search_box.pack(fill="x", pady=(0, 8))

        self.search_var = tk.StringVar()
        if hasattr(self.search_var, 'trace_add'):
            self.search_var.trace_add("write", lambda *a: self.on_search_changed())
        else:
            self.search_var.trace("w", self.on_search_changed)
            
        ent_search = tk.Entry(search_box, textvariable=self.search_var, bg=C_INPUT, fg=C_TEXT,
                              insertbackground=C_ACCENT, font=("Segoe UI", 10), relief="flat", bd=4)
        ent_search.pack(fill="x", ipady=4)
        ent_search.insert(0, "🔍 Search tickets or author...")
        ent_search.bind("<FocusIn>", lambda e: ent_search.delete(0, "end") if "Search" in ent_search.get() else None)

        # Scrollable Ticket Canvas with Auto-Hiding Scrollbar
        list_container = tk.Frame(self.left_pane, bg=C_PANEL)
        list_container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(list_container, bg=C_PANEL, highlightthickness=0)
        self.v_scrollbar = AutoScrollbar(list_container, orient="vertical", command=self.canvas.yview)
        self.scroll_frame = tk.Frame(self.canvas, bg=C_PANEL)

        self.scroll_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas_window_id = self.canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.v_scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        self.canvas.bind("<Configure>", self._on_canvas_resize)
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

        # Right Pane: Ticket Detail & Multi-Line Resolution Editor
        self.right_pane = tk.Frame(self.paned_window, bg=C_PANEL, padx=18, pady=16)
        self.paned_window.add(self.right_pane, minsize=400)

        self.build_inspector_pane()

        # Bottom Quick Status Bar
        self.statusbar = tk.Frame(self.root, bg=C_INPUT, height=28, padx=16)
        self.statusbar.pack(fill="x", side="bottom")

        self.lbl_sb_text = tk.Label(self.statusbar, text="Ready • 0 Tickets in memory", fg=C_MUTED, bg=C_INPUT, font=("Segoe UI", 8, "bold"))
        self.lbl_sb_text.pack(side="left")

        self.lbl_save_toast = tk.Label(self.statusbar, text="", fg=C_GREEN, bg=C_INPUT, font=("Segoe UI", 8, "bold"))
        self.lbl_save_toast.pack(side="left", padx=20)

        self.lbl_sb_right = tk.Label(self.statusbar, text=f"BDC Central Command Live Bridge • {APP_VERSION}", fg=C_MUTED, bg=C_INPUT, font=("Segoe UI", 8, "bold"))
        self.lbl_sb_right.pack(side="right")

        # Restore Sash Position after render
        self.root.after(150, self._restore_sash_position)

    def _restore_sash_position(self):
        try:
            if hasattr(self, 'paned_window') and self.saved_sash_pos > 100:
                self.paned_window.sash_place(0, self.saved_sash_pos, 0)
        except Exception:
            pass

    def create_filter_tab(self, parent, text, f_type, is_active=False):
        bg = C_ACCENT if is_active else C_INPUT
        fg = "#080c14" if is_active else C_TEXT
        btn = tk.Button(parent, text=text, bg=bg, fg=fg, font=("Segoe UI", 8, "bold"), relief="flat", padx=9, pady=4,
                        cursor="hand2", command=lambda: self.set_filter(f_type))
        btn.pack(side="left", padx=2)
        return btn

    def set_filter(self, f_type):
        self.filter_type = f_type
        self.update_filter_tabs_ui()
        self.render_ticket_list()

    def update_filter_tabs_ui(self):
        total = len(self.tickets)
        pending = sum(1 for t in self.tickets.values() if t.get("status") == "pending")
        in_prog = sum(1 for t in self.tickets.values() if t.get("status") == "in_progress")
        done = sum(1 for t in self.tickets.values() if t.get("status") == "completed")
        bugs = sum(1 for t in self.tickets.values() if t.get("type") == "bug")

        tab_data = [
            (self.btn_f_all, f"All ({total})", "all"),
            (self.btn_f_pend, f"🟡 Pending ({pending})", "pending"),
            (self.btn_f_prog, f"🔵 Progress ({in_prog})", "in_progress"),
            (self.btn_f_done, f"✅ Done ({done})", "completed"),
            (self.btn_f_bugs, f"🐞 Bugs ({bugs})", "bug")
        ]

        for btn, label, t in tab_data:
            btn.configure(text=label)
            if t == self.filter_type:
                btn.configure(bg=C_ACCENT, fg="#080c14")
            else:
                btn.configure(bg=C_INPUT, fg=C_TEXT)

    def on_search_changed(self, *args):
        if not hasattr(self, 'scroll_frame'):
            return
        self.search_query = self.search_var.get().strip().lower()
        if self.search_query.startswith("🔍"):
            self.search_query = ""
        self.render_ticket_list()

    def _on_canvas_resize(self, event):
        try:
            self.canvas.itemconfig(self.canvas_window_id, width=event.width)
        except Exception:
            pass

    def _on_mousewheel(self, event):
        try:
            self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        except Exception:
            pass

    # ====================================================================
    # 🔍 RIGHT PANE: TICKET INSPECTOR & RESOLUTION EDITOR
    # ====================================================================
    def build_inspector_pane(self):
        # Empty State Placeholder
        self.lbl_no_sel = tk.Label(self.right_pane, text="👈 Select a ticket on the left to inspect and resolve",
                                   fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 12, "italic"))
        self.lbl_no_sel.pack(expand=True)

        # Container Frame (Initially hidden)
        self.detail_container = tk.Frame(self.right_pane, bg=C_PANEL)

        # Header Details
        top_hdr = tk.Frame(self.detail_container, bg=C_PANEL)
        top_hdr.pack(fill="x", pady=(0, 8))

        self.lbl_d_type = tk.Label(top_hdr, text="🐞 BUG REPORT", fg=C_RED, bg=C_RED_BG, font=("Segoe UI", 9, "bold"), padx=6, pady=2)
        self.lbl_d_type.pack(side="left")

        self.lbl_d_cat = tk.Label(top_hdr, text="[Category]", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        self.lbl_d_cat.pack(side="left", padx=8)

        self.lbl_d_votes = tk.Label(top_hdr, text="👍 0 Votes", fg=C_AMBER, bg=C_AMBER_BG, font=("Segoe UI", 9, "bold"), padx=6, pady=2)
        self.lbl_d_votes.pack(side="left", padx=4)

        self.btn_d_del = tk.Button(top_hdr, text="🗑️ Delete Ticket", bg=C_INPUT, fg=C_RED, font=("Segoe UI", 8, "bold"),
                                   relief="flat", padx=10, pady=3, cursor="hand2", command=self.on_delete_clicked)
        self.btn_d_del.pack(side="right")

        # Title
        self.lbl_d_title = tk.Label(self.detail_container, text="Ticket Title", fg=C_TEXT, bg=C_PANEL,
                                    font=("Segoe UI", 14, "bold"), wraplength=520, justify="left", anchor="w")
        self.lbl_d_title.pack(fill="x", pady=(0, 4))

        # Submitter & Date
        self.lbl_d_meta = tk.Label(self.detail_container, text="👤 Submitted by Chief • Date", fg=C_MUTED, bg=C_PANEL,
                                   font=("Segoe UI", 9), anchor="w")
        self.lbl_d_meta.pack(fill="x", pady=(0, 10))

        # Description Box
        lbl_desc_hd = tk.Label(self.detail_container, text="DESCRIPTION & DETAILS:", fg=C_MUTED, bg=C_PANEL,
                               font=("Segoe UI", 8, "bold"))
        lbl_desc_hd.pack(anchor="w")

        self.txt_d_desc = tk.Text(self.detail_container, bg=C_INPUT, fg=C_TEXT, font=("Segoe UI", 10),
                                  height=4, relief="flat", wrap="word", padx=10, pady=8, bd=2)
        self.txt_d_desc.pack(fill="x", pady=(2, 10))
        self.txt_d_desc.configure(state="disabled")

        # Screenshot Button (if present)
        self.btn_d_screenshot = tk.Button(self.detail_container, text="🖼️ Open Attached Screenshot", bg="#1e293b", fg=C_BLUE,
                                          font=("Segoe UI", 9, "bold"), relief="flat", padx=10, pady=4, cursor="hand2",
                                          command=self.open_current_screenshot)
        self.btn_d_screenshot.pack(anchor="w", pady=(0, 10))

        # Status Selector Row
        stat_row = tk.Frame(self.detail_container, bg=C_PANEL)
        stat_row.pack(fill="x", pady=(4, 10))

        lbl_stat_lbl = tk.Label(stat_row, text="UPDATE STATUS:", fg=C_TEXT, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        lbl_stat_lbl.pack(side="left", padx=(0, 8))

        self.stat_var = tk.StringVar(value="pending")
        self.cb_status = ttk.Combobox(stat_row, textvariable=self.stat_var, values=["pending", "in_progress", "completed", "archived"],
                                      state="readonly", width=18, font=("Segoe UI", 9, "bold"))
        self.cb_status.pack(side="left")

        # Quick Templates Row
        tmpl_row = tk.Frame(self.detail_container, bg=C_PANEL)
        tmpl_row.pack(fill="x", pady=(4, 6))

        lbl_tmpl = tk.Label(tmpl_row, text="QUICK RESPONSE TEMPLATES:", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8, "bold"))
        lbl_tmpl.pack(anchor="w")

        pills_box = tk.Frame(tmpl_row, bg=C_PANEL)
        pills_box.pack(fill="x", pady=(2, 0))

        for t_text, t_val in [
            ("✅ Implemented in v2.9.65", "✅ Implemented in v2.9.65"),
            ("🔍 In Review / Testing", "🔍 Under Review & Live Testing"),
            ("🛠️ Scheduled in Next Update", "🛠️ Fix Scheduled in Upcoming Patch"),
            ("ℹ️ Game Mechanic", "ℹ️ Works as Intended (Whiteout Survival Game Mechanic)")
        ]:
            b = tk.Button(pills_box, text=t_text, bg=C_INPUT, fg=C_ACCENT, font=("Segoe UI", 8, "bold"),
                          relief="flat", padx=8, pady=3, cursor="hand2", command=lambda v=t_val: self.insert_template(v))
            b.pack(side="left", padx=2)

        # Multi-Line Resolution Notes Textarea
        lbl_note_hd = tk.Label(self.detail_container, text="ADMIN RESOLUTION & DEVELOPER NOTES (Enter for new lines):",
                               fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8, "bold"))
        lbl_note_hd.pack(anchor="w", pady=(6, 0))

        self.txt_d_note = tk.Text(self.detail_container, bg=C_INPUT, fg=C_TEXT, font=("Segoe UI", 10),
                                  height=6, relief="flat", wrap="word", padx=10, pady=10, bd=2,
                                  insertbackground=C_ACCENT)
        self.txt_d_note.pack(fill="both", expand=True, pady=(2, 10))

        # Bottom Save Button Bar
        btn_save_row = tk.Frame(self.detail_container, bg=C_PANEL)
        btn_save_row.pack(fill="x", pady=(4, 0))

        self.btn_save_note = tk.Button(btn_save_row, text="💾 Save Status & Notes to Firebase", bg=C_GREEN, fg="#080c14",
                                       font=("Segoe UI", 10, "bold"), relief="flat", padx=18, pady=8, cursor="hand2",
                                       command=self.save_ticket_changes)
        self.btn_save_note.pack(side="left")

        lbl_hint = tk.Label(btn_save_row, text="Changes push live to cloud immediately", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8))
        lbl_hint.pack(side="left", padx=10)

    def insert_template(self, tmpl):
        cur = self.txt_d_note.get("1.0", "end").strip()
        if cur:
            self.txt_d_note.delete("1.0", "end")
            self.txt_d_note.insert("1.0", f"{cur}\n{tmpl}")
        else:
            self.txt_d_note.insert("1.0", tmpl)

    def clear_inspector(self):
        self.detail_container.pack_forget()
        self.lbl_no_sel.pack(expand=True)

    def open_current_screenshot(self):
        if not self.selected_item_id or self.selected_item_id not in self.tickets:
            return
        t = self.tickets[self.selected_item_id]
        img_url = t.get("imageUrl")
        if img_url:
            webbrowser.open(img_url)

    def on_delete_clicked(self):
        if self.selected_item_id:
            self.delete_ticket_remote(self.selected_item_id)

    def save_ticket_changes(self):
        if not self.selected_item_id:
            return
        new_stat = self.stat_var.get()
        note = self.txt_d_note.get("1.0", "end").strip()
        self.update_ticket_status_remote(self.selected_item_id, new_stat, note)

    def show_save_toast(self, msg):
        self.lbl_save_toast.configure(text=msg)
        self.root.after(4000, lambda: self.lbl_save_toast.configure(text=""))

    # ====================================================================
    # 📋 TICKET LIST RENDERING
    # ====================================================================
    def render_ticket_list(self):
        for widget in self.scroll_frame.winfo_children():
            widget.destroy()

        sorted_tickets = sorted(
            self.tickets.values(),
            key=lambda x: x.get("createdAt", 0),
            reverse=True
        )

        rendered_count = 0
        for t in sorted_tickets:
            t_id = t.get("id")
            t_status = t.get("status", "pending")
            t_type = t.get("type", "feature")

            if self.filter_type == "pending" and t_status != "pending": continue
            if self.filter_type == "in_progress" and t_status != "in_progress": continue
            if self.filter_type == "completed" and t_status != "completed": continue
            if self.filter_type == "bug" and t_type != "bug": continue

            if self.search_query:
                q = self.search_query
                title = str(t.get("title", "")).lower()
                desc = str(t.get("description", "")).lower()
                auth = str(t.get("submittedBy", {}).get("name", "") if isinstance(t.get("submittedBy"), dict) else "").lower()
                if q not in title and q not in desc and q not in auth: continue

            rendered_count += 1
            self.create_ticket_card(t_id, t)

        if rendered_count == 0:
            lbl_empty = tk.Label(self.scroll_frame, text="No tickets found matching filters.",
                                 fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 10, "italic"), pady=30)
            lbl_empty.pack(fill="x")

        self.update_filter_tabs_ui()

    def create_ticket_card(self, ticket_id, ticket):
        is_selected = (self.selected_item_id == ticket_id)
        is_bug = ticket.get("type") == "bug"
        status = ticket.get("status", "pending")

        border_c = C_BORDER_ACCENT if is_selected else C_BORDER
        card_bg = C_CARD_SEL if is_selected else C_CARD_BG

        card = tk.Frame(self.scroll_frame, bg=border_c, padx=1, pady=1, cursor="hand2")
        card.pack(fill="x", pady=4)

        inner = tk.Frame(card, bg=card_bg, padx=12, pady=10)
        inner.pack(fill="both", expand=True)

        # Header row: Badge, Category, Votes
        hdr = tk.Frame(inner, bg=card_bg)
        hdr.pack(fill="x")

        type_text = "🐞 BUG" if is_bug else "💡 IDEA"
        type_fg = C_RED if is_bug else C_ACCENT
        type_bg = C_RED_BG if is_bug else "#083344"
        lbl_type = tk.Label(hdr, text=type_text, fg=type_fg, bg=type_bg, font=("Segoe UI", 8, "bold"), padx=4, pady=1)
        lbl_type.pack(side="left")

        lbl_cat = tk.Label(hdr, text=f"[{ticket.get('category', 'General')}]", fg=C_MUTED, bg=card_bg, font=("Segoe UI", 8))
        lbl_cat.pack(side="left", padx=6)

        if ticket.get("imageUrl"):
            lbl_img = tk.Label(hdr, text="🖼️", fg=C_BLUE, bg=card_bg, font=("Segoe UI", 8))
            lbl_img.pack(side="left")

        votes = ticket.get("voteCount", 0)
        lbl_votes = tk.Label(hdr, text=f"👍 {votes}", fg=C_AMBER, bg=C_AMBER_BG, font=("Segoe UI", 8, "bold"), padx=4, pady=1)
        lbl_votes.pack(side="right")

        # Title with Responsive Dynamic Wrap
        t_title = ticket.get("title", "Untitled Ticket")
        lbl_title = tk.Label(inner, text=t_title, fg=C_TEXT, bg=card_bg, font=("Segoe UI", 10, "bold"),
                             anchor="w", justify="left", wraplength=440)
        lbl_title.pack(fill="x", pady=(4, 2))

        def _adjust_wrap(e, lbl=lbl_title):
            try:
                lbl.configure(wraplength=max(e.width - 24, 260))
            except Exception:
                pass
        inner.bind("<Configure>", _adjust_wrap)

        # Footer: Submitter & Status Pill
        ftr = tk.Frame(inner, bg=card_bg)
        ftr.pack(fill="x", pady=(2, 0))

        author = ticket.get("submittedBy", {}).get("name", "Chief") if isinstance(ticket.get("submittedBy"), dict) else "Chief"
        lbl_sub = tk.Label(ftr, text=f"👤 {author}", fg=C_MUTED, bg=card_bg, font=("Segoe UI", 8))
        lbl_sub.pack(side="left")

        stat_map = {
            "pending": ("🟡 Review", C_AMBER, C_AMBER_BG),
            "in_progress": ("🔵 In Progress", C_BLUE, C_BLUE_BG),
            "completed": ("✅ Done", C_GREEN, C_GREEN_BG),
            "archived": ("⚪ Archived", C_MUTED, "#1f293d")
        }
        s_txt, s_col, s_bg = stat_map.get(status, ("🟡 Review", C_AMBER, C_AMBER_BG))
        lbl_stat = tk.Label(ftr, text=s_txt, fg=s_col, bg=s_bg, font=("Segoe UI", 8, "bold"), padx=5, pady=1)
        lbl_stat.pack(side="right")

        # Admin Note indicator if present
        if ticket.get("adminNote"):
            lbl_note = tk.Label(inner, text=f"✨ {ticket.get('adminNote')[:45]}...", fg="#38bdf8", bg=card_bg,
                                font=("Segoe UI", 8, "italic"), anchor="w")
            lbl_note.pack(fill="x", pady=(3, 0))

        # Card Hover Glow & Click Handler
        def _on_enter(e):
            if self.selected_item_id != ticket_id:
                inner.configure(bg=C_CARD_HOVER)
                hdr.configure(bg=C_CARD_HOVER)
                ftr.configure(bg=C_CARD_HOVER)
                lbl_title.configure(bg=C_CARD_HOVER)
                lbl_sub.configure(bg=C_CARD_HOVER)
                lbl_cat.configure(bg=C_CARD_HOVER)
                if ticket.get("imageUrl"): lbl_img.configure(bg=C_CARD_HOVER)
                if ticket.get("adminNote"): lbl_note.configure(bg=C_CARD_HOVER)

        def _on_leave(e):
            if self.selected_item_id != ticket_id:
                inner.configure(bg=C_CARD_BG)
                hdr.configure(bg=C_CARD_BG)
                ftr.configure(bg=C_CARD_BG)
                lbl_title.configure(bg=C_CARD_BG)
                lbl_sub.configure(bg=C_CARD_BG)
                lbl_cat.configure(bg=C_CARD_BG)
                if ticket.get("imageUrl"): lbl_img.configure(bg=C_CARD_BG)
                if ticket.get("adminNote"): lbl_note.configure(bg=C_CARD_BG)

        def _on_click(e):
            self.select_ticket_by_id(ticket_id)

        for w in [card, inner, hdr, lbl_type, lbl_cat, lbl_votes, lbl_title, ftr, lbl_sub, lbl_stat]:
            w.bind("<Button-1>", _on_click)
            w.bind("<Enter>", _on_enter)
            w.bind("<Leave>", _on_leave)

    def select_ticket_by_id(self, ticket_id):
        self.selected_item_id = ticket_id
        self.lbl_no_sel.pack_forget()
        self.detail_container.pack(fill="both", expand=True)

        t = self.tickets.get(ticket_id)
        if not t:
            return

        is_bug = t.get("type") == "bug"
        self.lbl_d_type.configure(
            text="🐞 BUG REPORT" if is_bug else "💡 FEATURE REQUEST",
            fg=C_RED if is_bug else C_ACCENT,
            bg=C_RED_BG if is_bug else "#083344"
        )
        self.lbl_d_cat.configure(text=f"[{t.get('category', 'General')}]")
        self.lbl_d_votes.configure(text=f"👍 {t.get('voteCount', 0)} Votes")
        self.lbl_d_title.configure(text=t.get("title", "Untitled Ticket"))

        author = t.get("submittedBy", {}).get("name", "Chief") if isinstance(t.get("submittedBy"), dict) else "Chief"
        author_gid = t.get("submittedBy", {}).get("gameId", "") if isinstance(t.get("submittedBy"), dict) else ""
        date_str = "Recent"
        if t.get("createdAt"):
            try:
                date_str = datetime.fromtimestamp(t["createdAt"] / 1000).strftime("%b %d, %Y at %I:%M %p")
            except Exception:
                pass

        self.lbl_d_meta.configure(text=f"👤 Submitted by {author} {f'(#{author_gid})' if author_gid else ''} • {date_str}")

        self.txt_d_desc.configure(state="normal")
        self.txt_d_desc.delete("1.0", "end")
        self.txt_d_desc.insert("1.0", t.get("description", "No additional description provided."))
        self.txt_d_desc.configure(state="disabled")

        if t.get("imageUrl"):
            self.btn_d_screenshot.pack(anchor="w", pady=(0, 10))
        else:
            self.btn_d_screenshot.pack_forget()

        self.stat_var.set(t.get("status", "pending"))
        self.txt_d_note.delete("1.0", "end")
        if t.get("adminNote"):
            self.txt_d_note.insert("1.0", t.get("adminNote"))

        self.render_ticket_list()

    def update_status_bar(self):
        total = len(self.tickets)
        pending = sum(1 for t in self.tickets.values() if t.get("status") == "pending")
        in_prog = sum(1 for t in self.tickets.values() if t.get("status") == "in_progress")
        done = sum(1 for t in self.tickets.values() if t.get("status") == "completed")

        self.lbl_sb_text.configure(text=f"Total: {total} Tickets  |  🟡 Pending: {pending}  |  🔵 In Progress: {in_prog}  |  ✅ Resolved: {done}")
        self.update_filter_tabs_ui()

    def trigger_test_alert(self):
        self.play_ticket_chime()
        mock_ticket = {
            "type": "bug",
            "category": "Alliance Championship",
            "title": "Championship 5-Round Draw Badge Verification Test",
            "submittedBy": {"name": "Brian Cox", "gameId": "318843189"},
            "description": "This is a simulated test alert verifying the desktop sound chime and popup window!"
        }
        self.show_floating_toast("test_123", mock_ticket)

    # ====================================================================
    # 🔕 SYSTEM TRAY INTEGRATION (pystray)
    # ====================================================================
    def setup_tray(self):
        try:
            if os.path.exists(ICON_PNG):
                img = Image.open(ICON_PNG)
            else:
                img = Image.new('RGB', (64, 64), color=(0, 210, 255))

            menu = pystray.Menu(
                pystray.MenuItem(f"Open Alert Communicator ({APP_VERSION})", self.restore_from_tray, default=True),
                pystray.MenuItem("Test Alert Chime", self.trigger_test_alert),
                pystray.MenuItem("Exit Completely", self.quit_application)
            )
            self.tray_icon = pystray.Icon("BDC_Communicator", img, f"BDC Live Alert Communicator {APP_VERSION}", menu)
            threading.Thread(target=self.tray_icon.run, daemon=True).start()
        except Exception as e:
            print(f"[Tray Setup Note] {e}")

    def hide_to_tray(self):
        self.save_local_state()
        self.root.withdraw()

    def restore_from_tray(self, *args):
        self.root.deiconify()
        self.root.lift()
        self.root.focus_force()

    def quit_application(self, *args):
        self.is_running = False
        self.save_local_state()
        if self.tray_icon:
            try:
                self.tray_icon.stop()
            except Exception:
                pass
        self.root.destroy()
        sys.exit(0)

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = TicketAlertCommunicator()
    app.run()
