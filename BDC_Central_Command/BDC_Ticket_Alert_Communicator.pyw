# ====================================================================
# 🛡️ BDC LIVE TICKET & BUG ALERT COMMUNICATOR (DESKTOP EDITION v1.0.0)
# ====================================================================
# Real-Time Desktop Alert Hub for Whiteout Survival Alliance [BDC]
#  • 📡 24/7 Firebase Background Ticket Watcher
#  • 🔊 Melodic Audio Chimes on New Bug / Feature Submissions
#  • 🪟 Floating Desktop Toast Popups (Bottom-Right Windows Overlay)
#  • 📝 Spacious In-App Multi-Line Resolution Notes & Status Manager
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
WOS_FIREBASE_URL = "https://wos-dashboard-38d4c-default-rtdb.firebaseio.com"
WOS_FIREBASE_SECRET = "n5fTnxcK5J5ddNsT77AhZIoQGTogW3ROpk4k03Sv"
PUBLIC_WEBSITE_URL = "https://wosbdc.github.io/#feedback"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEEN_FILE = os.path.join(BASE_DIR, "seen_ticket_ids.json")
CONFIG_FILE = os.path.join(BASE_DIR, "communicator_config.json")
ICON_ICO = os.path.join(BASE_DIR, "central_command_icon.ico")
ICON_PNG = os.path.join(BASE_DIR, "central_command_icon.png")

# Palette
C_BG = "#0d1117"
C_PANEL = "#161b22"
C_INPUT = "#090d13"
C_BORDER = "#30363d"
C_ACCENT = "#06b6d4"
C_ACCENT_HOVER = "#22d3ee"
C_PURPLE = "#8b5cf6"
C_TEXT = "#f0f6fc"
C_MUTED = "#8b949e"
C_GREEN = "#10b981"
C_RED = "#ef4444"
C_YELLOW = "#eab308"
C_BLUE = "#3b82f6"

class TicketAlertCommunicator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("BDC Live Alert Communicator — Bug & Ticket Desk")
        self.root.geometry("1180x760")
        self.root.minsize(880, 580)
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
        self.filter_type = "all"  # all, pending, in_progress, completed, bug, feature
        self.search_query = ""
        self.current_toast_window = None

        self.load_local_state()

        # Build UI
        self.build_gui()

        # System Tray Icon Setup
        self.tray_icon = None
        self.setup_tray()

        # Window Close Hook
        self.root.protocol('WM_DELETE_WINDOW', self.hide_to_tray)

        # Start Background Watcher Thread
        self.watcher_thread = threading.Thread(target=self.background_watcher_loop, daemon=True)
        self.watcher_thread.start()

        # Initial fetch
        self.refresh_tickets_async()

    # ====================================================================
    # 💾 LOCAL PERSISTENCE
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
            except Exception:
                pass

    def save_local_state(self):
        try:
            with open(SEEN_FILE, "w", encoding="utf-8") as f:
                json.dump(list(self.seen_ids), f, indent=2)
        except Exception:
            pass

        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "sound_enabled": self.sound_enabled.get(),
                    "toast_enabled": self.toast_enabled.get()
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
                # Melodic alert sequence: C5 -> E5 -> G5 -> C6
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
        toast.configure(bg="#161b22")

        try:
            toast.attributes('-alpha', 0.96)
        except Exception:
            pass

        # Position at bottom-right
        screen_w = toast.winfo_screenwidth()
        screen_h = toast.winfo_screenheight()
        w = 400
        h = 165
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

        btn_done = tk.Button(btn_row, text="✅ Resolve", bg=C_GREEN, fg="#000", font=("Segoe UI", 8, "bold"),
                             relief="flat", padx=10, pady=4, cursor="hand2", command=mark_done_direct)
        btn_done.pack(side="left")

        # Auto-dismiss after 12s
        toast.after(12000, lambda: toast.destroy() if toast.winfo_exists() else None)

    # ====================================================================
    # 📡 FIREBASE DATA SYNC & BACKGROUND WATCHER
    # ====================================================================
    def background_watcher_loop(self):
        # Initial run: Mark existing tickets as seen on first startup so we don't spam 50 popups
        is_first_check = len(self.seen_ids) == 0

        while self.is_running:
            try:
                url = f"{WOS_FIREBASE_URL}/community_feedback.json?auth={WOS_FIREBASE_SECRET}"
                resp = requests.get(url, timeout=10)
                if resp.status_code == 200 and resp.json():
                    raw_data = resp.json()
                    new_tickets = {}

                    for k, v in raw_data.items():
                        if isinstance(v, dict):
                            v["id"] = k
                            new_tickets[k] = v

                            if k not in self.seen_ids:
                                self.seen_ids.add(k)
                                if not is_first_check:
                                    # Trigger alert!
                                    self.play_ticket_chime()
                                    self.show_floating_toast(k, v)

                    is_first_check = False
                    self.save_local_state()
                    self.tickets = new_tickets

                    # Update UI in main thread
                    self.root.after(0, self.render_ticket_list)
                    self.root.after(0, self.update_status_bar)

            except Exception as e:
                print(f"[Watcher Error] {e}")

            time.sleep(self.poll_interval)

    def refresh_tickets_async(self):
        def _fetch():
            try:
                url = f"{WOS_FIREBASE_URL}/community_feedback.json?auth={WOS_FIREBASE_SECRET}"
                resp = requests.get(url, timeout=10)
                if resp.status_code == 200 and resp.json():
                    raw_data = resp.json()
                    new_tickets = {}
                    for k, v in raw_data.items():
                        if isinstance(v, dict):
                            v["id"] = k
                            new_tickets[k] = v
                            self.seen_ids.add(k)
                    self.tickets = new_tickets
                    self.save_local_state()
                    self.root.after(0, self.render_ticket_list)
                    self.root.after(0, self.update_status_bar)
            except Exception as e:
                print(f"[Manual Refresh Error] {e}")

        threading.Thread(target=_fetch, daemon=True).start()

    def update_ticket_status_remote(self, item_id, new_status, admin_note=None):
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
                self.root.after(0, lambda: self.select_ticket_by_id(item_id))
                self.root.after(0, lambda: messagebox.showinfo("Success", "Ticket updated live in Firebase! 🎉"))
            else:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to update ticket ({resp.status_code})"))
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Network error: {e}"))

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
    # 🖥️ GUI LAYOUT & DESIGN
    # ====================================================================
    def build_gui(self):
        # 1. Top Header Bar
        hdr = tk.Frame(self.root, bg=C_PANEL, height=64, padx=16, pady=10)
        hdr.pack(fill="x", side="top")

        # Brand / Title
        title_box = tk.Frame(hdr, bg=C_PANEL)
        title_box.pack(side="left")

        lbl_logo = tk.Label(title_box, text="🛡️", font=("Segoe UI", 18), bg=C_PANEL, fg=C_ACCENT)
        lbl_logo.pack(side="left", padx=(0, 8))

        t_text = tk.Frame(title_box, bg=C_PANEL)
        t_text.pack(side="left")

        lbl_app_name = tk.Label(t_text, text="BDC Live Alert Communicator", font=("Segoe UI", 14, "bold"), fg=C_TEXT, bg=C_PANEL)
        lbl_app_name.pack(anchor="w")

        self.lbl_status_badge = tk.Label(t_text, text="🟢 LIVE MONITORING • Checking Firebase every 15s", font=("Segoe UI", 8, "bold"), fg=C_GREEN, bg=C_PANEL)
        self.lbl_status_badge.pack(anchor="w")

        # Right Action Buttons & Toggles
        actions_box = tk.Frame(hdr, bg=C_PANEL)
        actions_box.pack(side="right")

        # Sound Toggle Checkbutton
        chk_sound = tk.Checkbutton(actions_box, text="🔊 Audio Chimes", variable=self.sound_enabled,
                                   bg=C_PANEL, fg=C_TEXT, selectcolor=C_INPUT, activebackground=C_PANEL,
                                   activeforeground=C_TEXT, font=("Segoe UI", 9, "bold"),
                                   command=self.save_local_state)
        chk_sound.pack(side="left", padx=8)

        # Toast Toggle Checkbutton
        chk_toast = tk.Checkbutton(actions_box, text="🪟 Toast Popups", variable=self.toast_enabled,
                                   bg=C_PANEL, fg=C_TEXT, selectcolor=C_INPUT, activebackground=C_PANEL,
                                   activeforeground=C_TEXT, font=("Segoe UI", 9, "bold"),
                                   command=self.save_local_state)
        chk_toast.pack(side="left", padx=8)

        btn_test = tk.Button(actions_box, text="🔔 Test Alert", bg=C_PURPLE, fg="#fff", font=("Segoe UI", 9, "bold"),
                             relief="flat", padx=10, pady=4, cursor="hand2", command=self.trigger_test_alert)
        btn_test.pack(side="left", padx=6)

        btn_refresh = tk.Button(actions_box, text="🔄 Refresh", bg=C_INPUT, fg=C_TEXT, font=("Segoe UI", 9, "bold"),
                                relief="flat", padx=10, pady=4, cursor="hand2", command=self.refresh_tickets_async)
        btn_refresh.pack(side="left", padx=6)

        btn_web = tk.Button(actions_box, text="🌐 Open Web Tracker", bg=C_ACCENT, fg="#000", font=("Segoe UI", 9, "bold"),
                            relief="flat", padx=10, pady=4, cursor="hand2", command=lambda: webbrowser.open(PUBLIC_WEBSITE_URL))
        btn_web.pack(side="left", padx=6)

        # 2. Main Content Split Pane with Moveable Divider (Side-to-Side Splitter)
        self.paned_window = tk.PanedWindow(self.root, orient="horizontal", bg=C_BORDER,
                                           sashwidth=7, sashrelief="raised", bd=0, opaqueresize=True)
        self.paned_window.pack(fill="both", expand=True, padx=12, pady=12)

        # Left Pane: Ticket Stream
        self.left_pane = tk.Frame(self.paned_window, bg=C_PANEL, padx=12, pady=12)
        self.paned_window.add(self.left_pane, minsize=320, width=490)

        # Filter Tabs Row
        filter_box = tk.Frame(self.left_pane, bg=C_PANEL)
        filter_box.pack(fill="x", pady=(0, 8))

        self.btn_f_all = self.create_filter_tab(filter_box, "All", "all", True)
        self.btn_f_pend = self.create_filter_tab(filter_box, "🟡 Pending", "pending")
        self.btn_f_prog = self.create_filter_tab(filter_box, "🔵 In Progress", "in_progress")
        self.btn_f_done = self.create_filter_tab(filter_box, "✅ Done", "completed")
        self.btn_f_bugs = self.create_filter_tab(filter_box, "🐞 Bugs", "bug")

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

        # Scrollable Ticket Canvas List with Dual (V + H) Scrollbars
        list_container = tk.Frame(self.left_pane, bg=C_PANEL)
        list_container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(list_container, bg=C_PANEL, highlightthickness=0)
        self.v_scrollbar = tk.Scrollbar(list_container, orient="vertical", command=self.canvas.yview)
        self.h_scrollbar = tk.Scrollbar(list_container, orient="horizontal", command=self.canvas.xview)
        self.scroll_frame = tk.Frame(self.canvas, bg=C_PANEL)

        self.scroll_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        self.canvas_window_id = self.canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        
        self.canvas.configure(xscrollcommand=self.h_scrollbar.set, yscrollcommand=self.v_scrollbar.set)
        self.canvas.bind("<Configure>", self._on_canvas_resize)

        self.v_scrollbar.pack(side="right", fill="y")
        self.h_scrollbar.pack(side="bottom", fill="x")
        self.canvas.pack(side="left", fill="both", expand=True)

        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        self.canvas.bind_all("<Shift-MouseWheel>", self._on_shift_mousewheel)

        # Right Pane: Ticket Detail & Multi-Line Resolution Editor
        self.right_pane = tk.Frame(self.paned_window, bg=C_PANEL, padx=18, pady=16)
        self.paned_window.add(self.right_pane, minsize=380)

        self.build_inspector_pane()

        # Bottom Quick Status Bar
        self.statusbar = tk.Frame(self.root, bg=C_INPUT, height=26, padx=14)
        self.statusbar.pack(fill="x", side="bottom")

        self.lbl_sb_text = tk.Label(self.statusbar, text="Ready • 0 Tickets in memory", fg=C_MUTED, bg=C_INPUT, font=("Segoe UI", 8))
        self.lbl_sb_text.pack(side="left")

        self.lbl_sb_right = tk.Label(self.statusbar, text="BDC Central Command Desktop Bridge", fg=C_MUTED, bg=C_INPUT, font=("Segoe UI", 8))
        self.lbl_sb_right.pack(side="right")

    def create_filter_tab(self, parent, text, f_type, is_active=False):
        bg = C_ACCENT if is_active else C_INPUT
        fg = "#000" if is_active else C_TEXT
        btn = tk.Button(parent, text=text, bg=bg, fg=fg, font=("Segoe UI", 8, "bold"), relief="flat", padx=8, pady=3,
                        cursor="hand2", command=lambda: self.set_filter(f_type))
        btn.pack(side="left", padx=2)
        return btn

    def set_filter(self, f_type):
        self.filter_type = f_type
        for b, t in [(self.btn_f_all, "all"), (self.btn_f_pend, "pending"), (self.btn_f_prog, "in_progress"),
                     (self.btn_f_done, "completed"), (self.btn_f_bugs, "bug")]:
            if t == f_type:
                b.configure(bg=C_ACCENT, fg="#000")
            else:
                b.configure(bg=C_INPUT, fg=C_TEXT)
        self.render_ticket_list()

    def on_search_changed(self, *args):
        if not hasattr(self, 'scroll_frame'):
            return
        self.search_query = self.search_var.get().strip().lower()
        if self.search_query.startswith("🔍"):
            self.search_query = ""
        self.render_ticket_list()

    def _on_canvas_resize(self, event):
        try:
            self.canvas.itemconfig(self.canvas_window_id, width=max(event.width, 360))
        except Exception:
            pass

    def _on_mousewheel(self, event):
        try:
            self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        except Exception:
            pass

    def _on_shift_mousewheel(self, event):
        try:
            self.canvas.xview_scroll(int(-1 * (event.delta / 120)), "units")
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

        self.lbl_d_type = tk.Label(top_hdr, text="🐞 BUG REPORT", fg=C_RED, bg=C_PANEL, font=("Segoe UI", 10, "bold"))
        self.lbl_d_type.pack(side="left")

        self.lbl_d_cat = tk.Label(top_hdr, text="[Category]", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        self.lbl_d_cat.pack(side="left", padx=8)

        self.lbl_d_votes = tk.Label(top_hdr, text="👍 0 Votes", fg=C_ACCENT, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        self.lbl_d_votes.pack(side="left", padx=8)

        self.btn_d_del = tk.Button(top_hdr, text="🗑️ Delete", bg=C_INPUT, fg=C_RED, font=("Segoe UI", 8, "bold"),
                                   relief="flat", padx=8, pady=2, cursor="hand2", command=self.on_delete_clicked)
        self.btn_d_del.pack(side="right")

        # Title
        self.lbl_d_title = tk.Label(self.detail_container, text="Ticket Title", fg=C_TEXT, bg=C_PANEL,
                                    font=("Segoe UI", 13, "bold"), wraplength=520, justify="left", anchor="w")
        self.lbl_d_title.pack(fill="x", pady=(0, 4))

        # Submitter & Date
        self.lbl_d_meta = tk.Label(self.detail_container, text="👤 Submitted by Chief • Date", fg=C_MUTED, bg=C_PANEL,
                                   font=("Segoe UI", 9), anchor="w")
        self.lbl_d_meta.pack(fill="x", pady=(0, 10))

        # Description Box
        lbl_desc_hd = tk.Label(self.detail_container, text="DESCRIPTION & STEPS TO REPRODUCE:", fg=C_MUTED, bg=C_PANEL,
                               font=("Segoe UI", 8, "bold"))
        lbl_desc_hd.pack(anchor="w")

        self.txt_d_desc = tk.Text(self.detail_container, bg=C_INPUT, fg=C_TEXT, font=("Segoe UI", 10),
                                  height=4, relief="flat", wrap="word", padx=8, pady=8, bd=2)
        self.txt_d_desc.pack(fill="x", pady=(2, 10))
        self.txt_d_desc.configure(state="disabled")

        # Screenshot Button (if present)
        self.btn_d_screenshot = tk.Button(self.detail_container, text="🖼️ Open Attached Screenshot", bg="#1f2937", fg="#38bdf8",
                                          font=("Segoe UI", 9, "bold"), relief="flat", padx=10, pady=4, cursor="hand2",
                                          command=self.open_current_screenshot)
        self.btn_d_screenshot.pack(anchor="w", pady=(0, 10))

        # Status Selector Row
        stat_row = tk.Frame(self.detail_container, bg=C_PANEL)
        stat_row.pack(fill="x", pady=(4, 10))

        lbl_stat_lbl = tk.Label(stat_row, text="STATUS:", fg=C_TEXT, bg=C_PANEL, font=("Segoe UI", 9, "bold"))
        lbl_stat_lbl.pack(side="left", padx=(0, 8))

        self.stat_var = tk.StringVar(value="pending")
        self.cb_status = ttk.Combobox(stat_row, textvariable=self.stat_var, values=["pending", "in_progress", "completed", "archived"],
                                      state="readonly", width=18, font=("Segoe UI", 9, "bold"))
        self.cb_status.pack(side="left")

        # Quick Templates Row
        tmpl_row = tk.Frame(self.detail_container, bg=C_PANEL)
        tmpl_row.pack(fill="x", pady=(4, 6))

        lbl_tmpl = tk.Label(tmpl_row, text="QUICK TEMPLATES:", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8, "bold"))
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
                          relief="flat", padx=6, pady=2, cursor="hand2", command=lambda v=t_val: self.insert_template(v))
            b.pack(side="left", padx=2)

        # Multi-Line Resolution Notes Textarea
        lbl_note_hd = tk.Label(self.detail_container, text="ADMIN RESOLUTION & DEVELOPER NOTES (Enter for new lines):",
                               fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8, "bold"))
        lbl_note_hd.pack(anchor="w")

        self.txt_d_note = tk.Text(self.detail_container, bg=C_INPUT, fg=C_TEXT, font=("Segoe UI", 10),
                                  height=6, relief="flat", wrap="word", padx=10, pady=10, bd=2,
                                  insertbackground=C_ACCENT)
        self.txt_d_note.pack(fill="both", expand=True, pady=(2, 10))

        # Bottom Save Button Bar
        btn_save_row = tk.Frame(self.detail_container, bg=C_PANEL)
        btn_save_row.pack(fill="x", pady=(4, 0))

        self.btn_save_note = tk.Button(btn_save_row, text="💾 Save Status & Notes to Firebase", bg=C_GREEN, fg="#000",
                                       font=("Segoe UI", 10, "bold"), relief="flat", padx=16, pady=8, cursor="hand2",
                                       command=self.save_ticket_changes)
        self.btn_save_note.pack(side="left")

        lbl_hint = tk.Label(btn_save_row, text="Changes sync live to website immediately", fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 8))
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

    # ====================================================================
    # 📋 TICKET LIST RENDERING
    # ====================================================================
    def render_ticket_list(self):
        # Clear existing items
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

            # Apply Filter
            if self.filter_type == "pending" and t_status != "pending":
                continue
            if self.filter_type == "in_progress" and t_status != "in_progress":
                continue
            if self.filter_type == "completed" and t_status != "completed":
                continue
            if self.filter_type == "bug" and t_type != "bug":
                continue

            # Apply Search Query
            if self.search_query:
                q = self.search_query
                title = str(t.get("title", "")).lower()
                desc = str(t.get("description", "")).lower()
                auth = str(t.get("submittedBy", {}).get("name", "") if isinstance(t.get("submittedBy"), dict) else "").lower()
                cat = str(t.get("category", "")).lower()
                if q not in title and q not in desc and q not in auth and q not in cat:
                    continue

            rendered_count += 1
            self.create_ticket_card(t_id, t)

        if rendered_count == 0:
            lbl_empty = tk.Label(self.scroll_frame, text="No tickets found matching filters.",
                                 fg=C_MUTED, bg=C_PANEL, font=("Segoe UI", 10, "italic"), pady=30)
            lbl_empty.pack(fill="x")

    def create_ticket_card(self, ticket_id, ticket):
        is_selected = (self.selected_item_id == ticket_id)
        is_bug = ticket.get("type") == "bug"
        status = ticket.get("status", "pending")

        border_c = C_ACCENT if is_selected else C_BORDER
        card_bg = "#1c2128" if is_selected else C_INPUT

        card = tk.Frame(self.scroll_frame, bg=border_c, padx=1, pady=1, cursor="hand2")
        card.pack(fill="x", pady=4)

        inner = tk.Frame(card, bg=card_bg, padx=10, pady=8)
        inner.pack(fill="both", expand=True)

        # Header row: Badge, Category, Votes
        hdr = tk.Frame(inner, bg=card_bg)
        hdr.pack(fill="x")

        type_text = "🐞 BUG" if is_bug else "💡 IDEA"
        type_color = C_RED if is_bug else C_ACCENT
        lbl_type = tk.Label(hdr, text=type_text, fg=type_color, bg=card_bg, font=("Segoe UI", 8, "bold"))
        lbl_type.pack(side="left")

        lbl_cat = tk.Label(hdr, text=f"[{ticket.get('category', 'General')}]", fg=C_MUTED, bg=card_bg, font=("Segoe UI", 8))
        lbl_cat.pack(side="left", padx=4)

        if ticket.get("imageUrl"):
            lbl_img = tk.Label(hdr, text="🖼️", fg="#38bdf8", bg=card_bg, font=("Segoe UI", 8))
            lbl_img.pack(side="left")

        votes = ticket.get("voteCount", 0)
        lbl_votes = tk.Label(hdr, text=f"👍 {votes}", fg=C_ACCENT, bg=card_bg, font=("Segoe UI", 8, "bold"))
        lbl_votes.pack(side="right")

        # Title
        t_title = ticket.get("title", "Untitled Ticket")
        lbl_title = tk.Label(inner, text=t_title, fg=C_TEXT, bg=card_bg, font=("Segoe UI", 10, "bold"),
                             anchor="w", justify="left", wraplength=440)
        lbl_title.pack(fill="x", pady=(2, 2))

        def _adjust_wrap(e, lbl=lbl_title):
            try:
                lbl.configure(wraplength=max(e.width - 24, 260))
            except Exception:
                pass
        inner.bind("<Configure>", _adjust_wrap)

        # Footer: Submitter & Status Pill
        ftr = tk.Frame(inner, bg=card_bg)
        ftr.pack(fill="x")

        author = ticket.get("submittedBy", {}).get("name", "Chief") if isinstance(ticket.get("submittedBy"), dict) else "Chief"
        lbl_sub = tk.Label(ftr, text=f"👤 {author}", fg=C_MUTED, bg=card_bg, font=("Segoe UI", 8))
        lbl_sub.pack(side="left")

        stat_map = {
            "pending": ("🟡 Review", C_YELLOW),
            "in_progress": ("🔵 In Progress", C_BLUE),
            "completed": ("✅ Done", C_GREEN),
            "archived": ("⚪ Archived", C_MUTED)
        }
        s_txt, s_col = stat_map.get(status, ("🟡 Review", C_YELLOW))
        lbl_stat = tk.Label(ftr, text=s_txt, fg=s_col, bg=card_bg, font=("Segoe UI", 8, "bold"))
        lbl_stat.pack(side="right")

        # Admin Note indicator if present
        if ticket.get("adminNote"):
            lbl_note = tk.Label(inner, text=f"✨ {ticket.get('adminNote')[:40]}...", fg="#38bdf8", bg=card_bg,
                                font=("Segoe UI", 8, "italic"), anchor="w")
            lbl_note.pack(fill="x", pady=(2, 0))

        # Click handler
        def _on_click(e):
            self.select_ticket_by_id(ticket_id)

        for w in [card, inner, hdr, lbl_type, lbl_cat, lbl_votes, lbl_title, ftr, lbl_sub, lbl_stat]:
            w.bind("<Button-1>", _on_click)

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
            fg=C_RED if is_bug else C_ACCENT
        )
        self.lbl_d_cat.configure(text=f"[{t.get('category', 'General')}]")
        self.lbl_d_votes.configure(text=f"👍 {t.get('voteCount', 0)} Votes")
        self.lbl_d_title.configure(text=t.get("title", "Untitled Ticket"))

        author = t.get("submittedBy", {}).get("name", "Chief") if isinstance(t.get("submittedBy"), dict) else "Chief"
        author_gid = t.get("submittedBy", {}).get("gameId", "") if isinstance(t.get("submittedBy"), dict) else ""
        date_str = ""
        if t.get("createdAt"):
            try:
                date_str = datetime.fromtimestamp(t["createdAt"] / 1000).strftime("%b %d, %Y at %I:%M %p")
            except Exception:
                pass

        self.lbl_d_meta.configure(text=f"👤 Submitted by {author} {f'(#{author_gid})' if author_gid else ''} • {date_str}")

        # Description
        self.txt_d_desc.configure(state="normal")
        self.txt_d_desc.delete("1.0", "end")
        self.txt_d_desc.insert("1.0", t.get("description", "No additional description provided."))
        self.txt_d_desc.configure(state="disabled")

        # Screenshot
        if t.get("imageUrl"):
            self.btn_d_screenshot.pack(anchor="w", pady=(0, 10))
        else:
            self.btn_d_screenshot.pack_forget()

        # Status
        self.stat_var.set(t.get("status", "pending"))

        # Notes
        self.txt_d_note.delete("1.0", "end")
        if t.get("adminNote"):
            self.txt_d_note.insert("1.0", t.get("adminNote"))

        self.render_ticket_list()

    def update_status_bar(self):
        total = len(self.tickets)
        pending = sum(1 for t in self.tickets.values() if t.get("status") == "pending")
        in_prog = sum(1 for t in self.tickets.values() if t.get("status") == "in_progress")
        done = sum(1 for t in self.tickets.values() if t.get("status") == "completed")

        self.lbl_sb_text.configure(text=f"Total: {total} Tickets | 🟡 Pending: {pending} | 🔵 In Progress: {in_prog} | ✅ Resolved: {done}")

    def trigger_test_alert(self):
        self.play_ticket_chime()
        mock_ticket = {
            "type": "bug",
            "category": "Alliance Championship",
            "title": "Championship 5-Round Draw Badge Verification Test",
            "submittedBy": {"name": "Brian Cox", "gameId": "123456789"},
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
                img = Image.new('RGB', (64, 64), color=(6, 182, 212))

            menu = pystray.Menu(
                pystray.MenuItem("Open Alert Communicator", self.restore_from_tray, default=True),
                pystray.MenuItem("Test Alert Chime", self.trigger_test_alert),
                pystray.MenuItem("Exit Completely", self.quit_application)
            )
            self.tray_icon = pystray.Icon("BDC_Communicator", img, "BDC Live Alert Communicator", menu)
            threading.Thread(target=self.tray_icon.run, daemon=True).start()
        except Exception as e:
            print(f"[Tray Setup Note] {e}")

    def hide_to_tray(self):
        self.root.withdraw()

    def restore_from_tray(self, *args):
        self.root.deiconify()
        self.root.lift()
        self.root.focus_force()

    def quit_application(self, *args):
        self.is_running = False
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
