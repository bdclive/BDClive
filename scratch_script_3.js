
        // Main App Connectors
        const sConf = {apiKey: atob("QUl6YVN5QXZ4ZktnX3NwUE52RTJ3Y1QtdlRsOFlUUXU0TDN0Xzd3"), authDomain: "livecounters-8eaa8.firebaseapp.com", projectId: "livecounters-8eaa8", databaseURL: "https://livecounters-8eaa8-default-rtdb.firebaseio.com/", appId: "1:386919719539:web:c60c0d185c3d7e97ecc006" };
        const vConf = {apiKey: "AIzaSyCokXnEtboNuUIASBMz2ZzS0GuchemoJYI", authDomain: "lbbb-webcounter.firebaseapp.com", projectId: "lbbb-webcounter", databaseURL: "https://lbbb-webcounter-default-rtdb.firebaseio.com/", appId: "1:217634980859:web:49ef2b0aa7fe7d0bb1415e" };
        
        // New RedBull & WOS App Connectors
        const rbConf = { databaseURL: "https://redbull-tracker-d99fc-default-rtdb.firebaseio.com/" };
        const wosConf = { databaseURL: "https://wos-dashboard-38d4c-default-rtdb.firebaseio.com/" };

        const sApp = firebase.initializeApp(sConf, "sApp"); 
        const vApp = firebase.initializeApp(vConf, "vApp");
        const rbApp = firebase.initializeApp(rbConf, "rbApp");
        const wosApp = firebase.initializeApp(wosConf, "wosApp");

        const sDb = sApp.database(); 
        const vDb = vApp.database();
        const rbDb = rbApp.database();
        const wosDb = wosApp.database();
        
        const fNum = (val) => { 
            if (val === null || val === undefined || val === "" || val === "---") return "0"; 
            const strVal = val.toString().trim();
            if (/[a-zA-Z]$/.test(strVal)) return strVal; 
            const num = parseFloat(strVal.replace(/,/g, '')); 
            return isNaN(num) ? val : new Intl.NumberFormat('en-US').format(num); 
        };
        
        let lastPulseTime = 0; let alertTimeout = null;

        // Viewers / Visitors Trackers
        vDb.ref("totalViewCount").on("value", s => document.getElementById("totalViewsCounter").innerText = fNum(s.val()));
        vDb.ref("visitorsConnected").on("value", s => document.getElementById("visitorCounter").innerText = fNum(s.numChildren()));
        
        // RedBull Tracker (Connected to standalone DB)
        rbDb.ref("Counters/RedBull/totalViewCount").on("value", s => {
            document.getElementById("rb-views-num").innerText = fNum(s.val());
        });
        
        // Smart listener for RedBull Online - Handles either plain numbers or active connection nodes
        rbDb.ref("Counters/RedBull/visitorsConnected").on("value", s => {
            const val = s.val();
            document.getElementById("rb-online-num").innerText = fNum(val !== null ? (typeof val === 'object' ? s.numChildren() : val) : 0);
        });

        // WOS Dashboard Tracker
        wosDb.ref("stats/totalViews").on("value", s => {
            document.getElementById("wos-views-num").innerText = fNum(s.val());
        });

        wosDb.ref("presence").on("value", s => {
            const val = s.val();
            document.getElementById("wos-online-num").innerText = fNum(val !== null ? (typeof val === 'object' ? s.numChildren() : val) : 0);
        });

        sDb.ref('labData').on('value', (s) => {
            const d = s.val(); if (!d) return;
            document.getElementById('plex-count-num').innerText = fNum(d.plexCount);
            document.getElementById('threads-fol-num').innerText = fNum(d.threadsFol);
            document.getElementById('threads-views-num').innerText = fNum(d.threadsViews);
            document.getElementById('snap-fol-num').innerText = fNum(d.snapFol || "3303");
            if (document.getElementById('snap-views-num')) document.getElementById('snap-views-num').innerText = fNum(d.snapViews || "1200");
            document.getElementById('fb-page-num').innerText = fNum(d.fbPage || "1011");
            document.getElementById('fb-views-num').innerText = fNum(d.fbViews || "8051");
            document.getElementById('fb-personal-num').innerText = fNum(d.fbPersonal || "5478");
            document.getElementById('twitch-view-num').innerText = fNum(d.twitchViewers);
            document.getElementById('twitch-chatter-num').innerText = fNum(d.twitchChatters);
            document.getElementById('ig-fol-num').innerText = fNum(d.igFol);
            document.getElementById('ig-views-num').innerText = fNum(d.igViews || "0");

            if(d.ytSub) document.getElementById('yt-sub-num').innerText = fNum(d.ytSub);
            if(d.ttFol) document.getElementById('tt-fol-num').innerText = fNum(d.ttFol);
            if(d.xFol) document.getElementById('xFol') ? document.getElementById('xFol').innerText = fNum(d.xFol) : (document.getElementById('x-fol-num') && (document.getElementById('x-fol-num').innerText = fNum(d.xFol)));

            // Dynamic Grand Total Calculations across 9 platforms
            const igF = parseInt(d.igFol || 5860);
            const thF = parseInt(d.threadsFol || 335);
            const fbP = parseInt(d.fbPage || 1011);
            const fbPersonal = parseInt(d.fbPersonal || 5478);
            const twF = parseInt(d.twitchFol || 695);
            const ytS = parseInt(d.ytSub || 799);
            const ttF = parseInt(d.ttFol || 255);
            const xF = parseInt(d.xFol || 50551);
            const snapF = parseInt(d.snapFol || 3303);
            const bskyF = 29;

            const grandFol = igF + thF + fbP + fbPersonal + twF + ytS + ttF + xF + snapF + bskyF;

            const igV = parseInt(d.igViews || 5342);
            const thV = parseInt(d.threadsViews || 6600);
            const fbV = parseInt(d.fbViews || 8051);
            const ytV = parseInt(d.ytViews || 305291);
            const snapV = parseInt(d.snapViews || 1200);

            const grandViews = igV + thV + fbV + ytV + snapV;

            const gFolElem = document.getElementById('grand-total-fol-num');
            const gViewsElem = document.getElementById('grand-total-views-num');
            if (gFolElem) gFolElem.innerText = fNum(grandFol);
            if (gViewsElem) gViewsElem.innerText = fNum(grandViews);
            
            if(d.discordRsvp !== undefined) document.getElementById('m-rsvp').innerText = fNum(d.discordRsvp);
            
            if (d.lastChatActivity && d.lastChatActivity > lastPulseTime) { 
                if (lastPulseTime !== 0) {
                    const dot = document.getElementById('chat-alert-dot');
                    dot.classList.add('pulse-active');
                    clearTimeout(alertTimeout);
                    alertTimeout = setTimeout(() => { dot.classList.remove('pulse-active'); }, 8000);
                }
                lastPulseTime = d.lastChatActivity;
            }
        });

        let currentTasksDatabaseSnapshot = null;
        sDb.ref('tasks').on('value', (s) => {
            const t = s.val(); if (!t) return;
            currentTasksDatabaseSnapshot = t; 
            
            const safeNum = (val) => { const n = parseInt(val, 10); return isNaN(n) ? 0 : n; };

            const cDiva = safeNum(t.BrianDivaCox_count);
            const cUpdate = safeNum(t.Update_count || t.Tweet_to_Facebook_count || t.Brian_Cox_s_list_count);
            const cTheater = safeNum(t.BriansTheater_count || t.Brian_s_Theater_count || t.Brian_s_Theater_ToDo_list_count);
            const cMyTasks = safeNum(t.My_Tasks_count);
            const cBDCF = safeNum(t.The_BDCF_Crew_count);
            const cWOS = safeNum(t.WOS_count);

            const dynamicTotal = cDiva + cUpdate + cTheater + cMyTasks + cBDCF + cWOS;
            
            document.getElementById('task-k1').innerText = fNum(dynamicTotal);
            document.getElementById('task-k2').innerText = fNum(cDiva);
            document.getElementById('task-k3').innerText = fNum(cUpdate);
            document.getElementById('task-k4').innerText = fNum(cTheater);
            document.getElementById('task-k5').innerText = fNum(cMyTasks);
            document.getElementById('task-k6').innerText = fNum(cBDCF);
            document.getElementById('task-k7').innerText = fNum(cWOS);
        });

        function openSpecificTaskList(listKey) {
            let targetListId = "";
            let lookupKey = listKey;
            
            if (listKey === 'Update' && currentTasksDatabaseSnapshot) {
                lookupKey = currentTasksDatabaseSnapshot['Tweet_to_Facebook_id'] ? 'Tweet_to_Facebook' : (currentTasksDatabaseSnapshot['Update_id'] ? 'Update' : 'Brian_Cox_s_list');
            }
            if (listKey === 'BriansTheater' && currentTasksDatabaseSnapshot && !currentTasksDatabaseSnapshot['BriansTheater_id']) lookupKey = 'Brian_s_Theater_ToDo_list';

            if (currentTasksDatabaseSnapshot && currentTasksDatabaseSnapshot[lookupKey + "_id"]) {
                targetListId = currentTasksDatabaseSnapshot[lookupKey + "_id"];
            }
            let destinationUrl = "https://tasks.google.com/tasks/";
            if (targetListId) { destinationUrl += `?listid=${encodeURIComponent(targetListId)}`; }
            window.open(destinationUrl, 'GoogleTasksWorkspace', 'width=720,height=800,resizable=yes,scrollbars=yes');
        }

        function parseToSeconds(str) {
            if (!str || str.toLowerCase().includes("scheduled")) return 0;
            let total = 0;
            const dMatch = str.match(/(\d+)\s*(d|day|days)/i);
            const hMatch = str.match(/(\d+)\s*(h|hr|hour|hours)/i);
            const mMatch = str.match(/(\d+)\s*(m|min|mins|minute|minutes)/i);
            const sMatch = str.match(/(\d+)\s*(s|sec|secs|second|seconds)/i);
            if (dMatch) total += parseInt(dMatch[1]) * 86400;
            if (hMatch) total += parseInt(hMatch[1]) * 3600;
            if (mMatch) total += parseInt(mMatch[1]) * 60;
            if (sMatch) total += parseInt(sMatch[1]);
            return total;
        }

        function formatTickerText(prefix, totalSecs) {
            let days = Math.floor(totalSecs / 86400);
            let hours = Math.floor((totalSecs % 86400) / 3600);
            let mins = Math.floor((totalSecs % 3600) / 60);
            let secs = totalSecs % 60;
            let output = prefix;
            if (days > 0) output += `${days} Day${days !== 1 ? 's' : ''}`;
            else if (hours > 0) output += `${hours}hr ${mins}m ${secs}sec`;
            else if (mins > 0) output += `${mins}m ${secs}sec`;
            else output += `${secs}sec`;
            return output;
        }
        
        let nowInt, nextInt, localNowSecs = 0, localNextSecs = 0;
        sDb.ref('theaterSync').on('value', (snapshot) => {
            const m = snapshot.val(); if (!m) return;
            
            document.getElementById('m-count').innerText = fNum(m.moviesCount || m.movieCount);
            document.getElementById('m-open').innerText = m.daysOpen || "0";
            document.getElementById('tv-count').innerText = fNum(m.tvCount || m.showCount);

            const now = new Date();
            const showStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);
            const showEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 56, 0);
            const nowTitleEl = document.getElementById('m-now');
            const nowTimeEl = document.getElementById('m-left');
            const nextTitleEl = document.getElementById('m-next');
            const nextTimeEl = document.getElementById('m-time');

            const isIdle = !m.nowPlaying || m.nowPlaying.toLowerCase().includes("no movie playing");
            nowTitleEl.innerText = isIdle ? "No Movie Playing" : m.nowPlaying;

            if (!isIdle) {
                const showEnd = (m.showEndTime && !isNaN(new Date(m.showEndTime).getTime())) 
                    ? new Date(m.showEndTime) 
                    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 56, 0);
                
                localNowSecs = Math.floor((showEnd - now) / 1000);
                if (localNowSecs > 0) {
                    const runNowTicker = () => {
                        if (localNowSecs <= 0) {
                            nowTimeEl.innerText = "Cinema Idle";
                            nowTitleEl.innerText = "No Movie Playing";
                            clearInterval(nowInt);
                            return;
                        }
                        let h = Math.floor(localNowSecs / 3600);
                        let mins = Math.floor((localNowSecs % 3600) / 60);
                        let s = localNowSecs % 60;
                        let text = "Left: ";
                        if (h > 0) text += `${h}h ${mins}m ${s}s`;
                        else if (mins > 0) text += `${mins}m ${s}s`;
                        else text += `${s}s`;
                        nowTimeEl.innerText = text;
                        localNowSecs--;
                    };
                    runNowTicker();
                    nowInt = setInterval(runNowTicker, 1000);
                } else {
                    nowTimeEl.innerText = "Streaming Live";
                }
            } else {
                nowTimeEl.innerText = "Cinema Idle";
            }

            nextTitleEl.innerText = m.nextTitle || "Masters of the Universe";
            document.getElementById('m-today-label').style.display = "none";
                
                let targetShow = null;
                if (m.nextTime && m.nextTime !== "TBD" && !m.nextTime.includes("None")) {
                    targetShow = new Date(m.nextTime);
                    if (isNaN(targetShow.getTime())) {
                        let relSecs = parseToSeconds(m.nextTime);
                        if (relSecs > 0) {
                            targetShow = new Date(now.getTime() + (relSecs * 1000));
                        } else {
                            let clean = m.nextTime.includes("202") ? m.nextTime : m.nextTime + ", 2026";
                            targetShow = new Date(clean);
                        }
                    }
                }
                
                if (!targetShow || isNaN(targetShow.getTime())) {
                    targetShow = showStart;
                    if (now >= showEnd) {
                        targetShow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0, 0);
                    }
                }
                
                localNextSecs = Math.floor((targetShow - now) / 1000);
                if (localNextSecs > 0) {
                    const runNextTicker = () => {
                        if (localNextSecs <= 0) {
                            nextTimeEl.innerText = "Show Starting...";
                            clearInterval(nextInt);
                            document.getElementById('m-today-label').style.display = "none";
                            return;
                        }
                        
                        const isToday = (targetShow.toDateString() === now.toDateString());
                        if (localNextSecs <= 86400 && isToday) {
                            document.getElementById('m-today-label').style.display = "inline";
                            let hours = Math.floor(localNextSecs / 3600);
                            let mins = Math.floor((localNextSecs % 3600) / 60);
                            let secs = localNextSecs % 60;
                            let output = "";
                            if (hours > 0) output += `${hours}h ${mins}m ${secs}s`;
                            else if (mins > 0) output += `${mins}m ${secs}s`;
                            else output += `${secs}s`;
                            nextTimeEl.innerText = output;
                        } else if (localNextSecs <= 86400) {
                            document.getElementById('m-today-label').style.display = "none";
                            let hours = Math.floor(localNextSecs / 3600);
                            let mins = Math.floor((localNextSecs % 3600) / 60);
                            let secs = localNextSecs % 60;
                            let output = "";
                            if (hours > 0) output += `${hours}h ${mins}m ${secs}s`;
                            else if (mins > 0) output += `${mins}m ${secs}s`;
                            else output += `${secs}s`;
                            nextTimeEl.innerText = output;
                        } else {
                            document.getElementById('m-today-label').style.display = "none";
                            const calendarDays = Math.ceil(localNextSecs / 86400);
                            nextTimeEl.innerText = `In: ${calendarDays} Day${calendarDays !== 1 ? 's' : ''}`;
                        }
                        localNextSecs--;
                    };
                    runNextTicker();
                    nextInt = setInterval(runNextTicker, 1000);
                }
        });
        
        const twitchLabApi = 'https://script.google.com/macros/s/AKfycby0ndGELJv0Q6yAR8PKMsvo3u-hZ2qAL80sVahxyeyrLy_qDXhkcYZkKBoq6HhdrhyO/exec';
        async function syncTwitchFollowers() { try { const res = await fetch(twitchLabApi + '?t=' + Date.now()); const data = await res.json(); if (data.twitch) document.getElementById('twitch-fol-num').innerText = fNum(data.twitch.followers); } catch (e) {} }
        setInterval(syncTwitchFollowers, 60000); syncTwitchFollowers();
        
        function switchSocialTab(platform) {
            // Hide all tabs
            document.getElementById('tab-yt').style.display = 'none';
            document.getElementById('tab-tt').style.display = 'none';
            document.getElementById('tab-x').style.display = 'none';
            
            // Reset button opacities and borders
            document.getElementById('tab-btn-yt').style.opacity = '0.5';
            document.getElementById('tab-btn-yt').style.borderBottom = '2px solid transparent';
            document.getElementById('tab-btn-tt').style.opacity = '0.5';
            document.getElementById('tab-btn-tt').style.borderBottom = '2px solid transparent';
            document.getElementById('tab-btn-x').style.opacity = '0.5';
            document.getElementById('tab-btn-x').style.borderBottom = '2px solid transparent';
            
            // Activate selected
            document.getElementById('tab-' + platform).style.display = 'flex';
            document.getElementById('tab-btn-' + platform).style.opacity = '1';
            
            let color = 'transparent';
            if(platform === 'yt') color = 'var(--yt-red)';
            if(platform === 'tt') color = 'var(--tt-cyan)';
            if(platform === 'x') color = '#ffffff';
            
            document.getElementById('tab-btn-' + platform).style.borderBottom = '2px solid ' + color;
            document.getElementById('social-tab-box').style.borderTop = '3px solid ' + color;
        }

        function openCourt() { document.getElementById('modal-player').src = "https://video.ibm.com/embed/23891775?autoplay=1"; document.getElementById('courtModal').style.display = "block"; }
        function closeCourt() { document.getElementById('modal-player').src = ""; document.getElementById('courtModal').style.display = "none"; }
        function openTheater() { document.getElementById('theater-player').src = "https://docs.google.com/spreadsheets/d/1NEMy5X5leBqlVs9nxNwY2ynusLgyjmymekFk4avzUv0/edit?gid=428404608&rm=minimal"; document.getElementById('theaterModal').style.display = "block"; }
        function closeTheater() { document.getElementById('theater-player').src = ""; document.getElementById('theaterModal').style.display = "none"; }
        function openTwitch() { window.open(`Live.html?host=${window.location.hostname}`, 'TwitchStudio', `width=1480,height=820`); }
        async function getBsky() { try { const r = await fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=briandivacox.bsky.social'); const p = await r.json(); if (p.followersCount !== undefined) document.getElementById('bsky-num').innerText = fNum(p.followersCount); } catch (e) {} }
        getBsky(); setInterval(getBsky, 300000);

        /* 📝 Changelog v10.1.56 / Task Box Firebase Key Fix
        - Repaired a critical disconnection in the Task Box where BriansTheater tasks were mathematically hardcoded to look for a broken Firebase Key, causing it to incorrectly display 0.

        📝 Changelog v10.1.55 / Calendar-Aware TODAY Logic
        - The `TODAY` label now mathematically calculates the seconds remaining until midnight in the local timezone, and ONLY displays if the movie is scheduled for the exact same calendar day!
        
        📝 Changelog v10.1.54 / BriansTheater Today Logic
        - The `TODAY` label will now ONLY display when a scheduled movie is strictly less than 24 hours away (i.e. actually today).
        - Countdowns greater than 1 day will no longer violently tick seconds on the screen (formatting simplified to `Xday Yhr Zm`).
        
        📝 Changelog v10.1.53 / Python Terminal Spam Fix
        - Refactored `threads_bridge.py` terminal output logic (now v1.16.6).
        - Swapped sys.stdout carriage returns with standard print() change detection to prevent text waterfall spam in IDLE and raw CMD.
        
        📝 Changelog v10.1.52 / Threads Backend Restored
        - Completely rewrote the Python Threads Bridge script (v1.16.5) to fix the Meta API 400 Bad Request error.
        - Mathmatically locked the views query to a 30-day sliding window to respect Meta's Insight API limits.
        - Injected an autonomous Token Manager to permanently auto-renew the Threads token every 20 days.
        
        📝 Changelog v10.1.51 / Stacked Border Color
        
        Dashboard Updates:
        - Applied custom slate-blue (#91a4b8) border color to the top of the Stacked Widget per user selection.
        
        📝 Changelog v10.1.50 / Borderless Stack
        
        Dashboard Updates:
        - Removed the horizontal separator lines (border-bottom) between the bots in the Stacked Widget, creating a sleek, single unified block of counters.
        
        📝 Changelog v10.1.49 / Glassmorphism Seamless Iframes
        
        Dashboard Updates:
        - Applied 'mix-blend-mode: screen' to ALL social counters (Stacked and Tabbed widgets).
        - Removed the harsh '#000' inner backgrounds, allowing the beautiful '--panel-bg' to shine through natively. The black background of the inverted iframes simply melts away leaving only the crisp white numbers magically floating inside the container!
        
        📝 Changelog v10.1.48 / Pixel-Perfect Micro Adjustment
        
        Dashboard Updates:
        - Fine-tuned the CSS clip-path inset from 75px to 86px. This micro-adjustment eliminates the tiny, 5-pixel sliver of the native logos that was still stubbornly clinging to the edge of the numbers, resulting in absolute perfection.
        
        📝 Changelog v10.1.47 / Re-Calibrated Clip Path
        
        Dashboard Updates:
        - Decreased the massive 155px CSS clip-path inset to a precise 75px. This completely restores all the sliced-off numbers while still perfectly eliminating the native livecounts logos from the visible area.
        - Adjusted the wrapper padding slightly (left: 105px) to ensure the numbers are beautifully centered relative to the FontAwesome icons.
        
        📝 Changelog v10.1.46 / The Ultimate Stacked Fix
        
        Dashboard Updates:
        - Realized the "weird blocks" behind the icons were actually the native livecounts logos (scaled up). Applied a precise CSS clip-path to slice off the left 155px of the iframes, completely erasing the native logos from existence.
        - Restored the CSS inversion filter to the X counter, but replaced the brightness dampener with a raw contrast(5) boost to achieve a pure pitch black background without dimming the white text.
        
        📝 Changelog v10.1.45 / Native Dark Mode X
        
        Dashboard Updates:
        - Realized that the livecounts.io X (Twitter) counter is already natively pitch black (dark mode). Completely removed the CSS inversion filters from it so it displays its native, flawless pitch black background with bright white text!
        
        📝 Changelog v10.1.44 / Stacked Alignment & X Blackout
        
        Dashboard Updates:
        - Shifted the stacked counters back to the right (95px) to re-center them correctly next to the new icons.
        - Applied an ultra-aggressive contrast(10) blackout filter to the X (Twitter) counters to absolutely force their background into a pure, pitch black that perfectly matches the others.
        
        📝 Changelog v10.1.43 / Stacked Polish
        
        Dashboard Updates:
        - Replaced the bulky text titles (YOUTUBE/TIKTOK/X) in the Stacked Widget with clean FontAwesome icons.
        - Slided the stacked counter numbers significantly to the left (65px) now that the text is gone, giving them a much better visual center.
        - Applied a heavy contrast filter to the X (Twitter) counter to force its dark-gray background to a pitch black without dimming the white numbers.
        
        📝 Changelog v10.1.42 / Stacked Scale & Cinema Today
        
        Dashboard Updates:
        - Increased the font size of the Stacked Widget titles (YOUTUBE/TIKTOK/X) to 12px for better readability in the larger box.
        - Drastically scaled up the iframes in the Stacked Widget from 0.40 to 0.65 to take full advantage of their new vertical space.
        - Applied the same CSS guillotine clip-path to the Stacked Widgets to ensure their massive size doesn't reveal the usernames.
        - Added dynamic "TODAY" text in bright purple beneath the "Up Next" title in the Cinema Box, which only appears when an active live countdown is ticking.
        
        📝 Changelog v10.1.41 / Version Sync
        
        Dashboard Updates:
        - Updated the version number in the Cinema footer to v10.1.41 so it perfectly syncs with the rest of the application.
        
        📝 Changelog v10.1.40 / Stacked Widget Expansion
        
        Dashboard Updates:
        - Expanded the Stacked Widget box to span two full rows (filling the empty space below it).
        - Removed the fixed 150px height constraint, giving the stacked iframes much more vertical room to breathe.
        
        📝 Changelog v10.1.39 / Tabbed Right Shift -10
        
        Dashboard Updates:
        - Fine-tuned the Tabbed numbers push to exactly 10 pixels off the left wall (left anchor at 65px) for the perfect sweet spot.
        
        📝 Changelog v10.1.38 / Tabbed Right Shift
        
        Dashboard Updates:
        - Pushed the Tabbed numbers 20 pixels off the left wall (changed left anchor from 55px to 75px) to perfectly center them in the box.
        
        📝 Changelog v10.1.37 / Deep Username Crop
        
        Dashboard Updates:
        - Deepened the CSS clip-path guillotine from 65px to 76px to completely sever the last remaining pixels of the username/avatar from the top of the Tabbed counter.
        
        📝 Changelog v10.1.36 / Tabbed Username Crop
        
        Dashboard Updates:
        - Applied a highly specific CSS clip-path to slice off the top 65px of the livecounts iframes in the Tabbed widget.
        - This flawlessly hides the username/profile header that was photobombing the top of the counter, while keeping the number perfectly centered and unshifted.
        
        📝 Changelog v10.1.35 / Tabbed Left Anchor
        
        Dashboard Updates:
        - Replicated the EXACT math and styling of the Stacked Widget (which works flawlessly) for the Tabbed Widget.
        - Used `transform-origin: left center` to prevent the massive scaling from pushing the numbers out of the overflow boundaries.
        - Set zoom to 1.1x so the numbers are large, clean, and perfectly aligned in view.
        
        📝 Changelog v10.1.34 / Perfect Cookie Cutter
        
        Dashboard Updates:
        - Implemented an absolute "cookie cutter" bounding box (270x60) for the Tabbed widget to physically crop out EVERYTHING except the raw number.
        - Shifted the iframes specifically to fall perfectly inside this tiny window.
        - Scaled the resulting perfectly cropped pure number up by 1.4x, ensuring it is flawlessly centered in the UI.
        
        📝 Changelog v10.1.33 / Natural Scaling
        
        Dashboard Updates:
        - Removed all the complex iframe CSS clipping and manual translations.
        - Simply scaled the entire wrapper from the absolute center so that the browser's native overflow masking naturally hides the outer logos and bottom text perfectly.
        
        📝 Changelog v10.1.32 / Perfectly Aligned Pure Numbers
        
        Dashboard Updates:
        - Fine-tuned the Tabbed counters to exactly 1.3x scale (the sweet spot).
        - Added a CSS clip-path to completely hide the bottom text labels ("subscribers"/"followers"), leaving ONLY the pure massive number.
        - Re-aligned the translations so this pure number is flawlessly dead-center.
        
        📝 Changelog v10.1.31 / Tabbed Counter Rescale
        
        Dashboard Updates:
        - Reverted the Tabbed counter zoom back down from the massive 1.6x to a perfect 1.1x.
        - Tuned the x-offset to perfectly center the numbers while keeping logos hidden, matching exactly how it was designed originally.
        
        📝 Changelog v10.1.30 / Massive Tabbed Counters
        
        Dashboard Updates:
        - Scaled the Tabbed counters up drastically to 1.6x zoom.
        - Adjusted translations to ensure the massive numbers remain perfectly centered and the logos remain entirely clipped.
        
        📝 Changelog v10.1.29 / Blown Up Counters
        
        Dashboard Updates:
        - "Blown up" the iframes inside the Tabbed Widget (scaled to 0.95).
        - Offset the iframes left by 140px to completely hide the internal branding logos off-screen.
        - Shifted the wrappers right by 55px to ensure the raw numbers are perfectly centered.
        
        📝 Changelog v10.1.28 / Tabbed Widget Repaired
        
        Dashboard Updates:
        - Added missing javascript function switchSocialTab() so the tabs are actually clickable.
        - Fixed the visual styling of the Tabbed widget to match the dark-mode (inverted) livecounts styling.
        - Used a CSS transform scale and flex centering so the iframe fits perfectly and beautifully inside the box without being cut off.
        - Made unselected tabs semi-transparent and added smooth transitions.
        
        📝 Changelog v10.1.27 / Final Perfect Grid Fix
        
        Dashboard Updates:
        - Fixed the "Site Counters" (Tales/Plex) box missing its grid assignment. It is now explicitly pinned to Box 1 (Row 1, Col 1).
        - Shifted Meta to Box 2, Twitch to Box 3, Tabbed stays at Box 4.
        - Stacked (Twitter) is Box 5, Bsky Box 6, Snap Box 7, Court Stream Box 8.
        - Tasks is Box 10 & 11, Cinema is Box 12.
        
        📝 Changelog v10.1.26 / Absolute Precision Grid
        
        Dashboard Updates:
        - Applied explicit grid-area coordinates to every single box to force them exactly where requested.
        - Row 1: Meta, Twitch, Bsky, Tabbed
        - Row 2: Stacked, Snapchat, [Empty Space], Court Stream
        - Row 3: [Empty Space], Tasks (Spanning 2), BriansTheater
        
        📝 Changelog v10.1.25 / Task Box Moved Up
        
        Dashboard Updates:
        - Repositioned the Tasks Box to exactly the middle of the layout (Row 3, Col 2-3).
        - Repositioned the BriansTheater Cinema Box to sit right next to Tasks (Row 3, Col 4).
        - Pushed Snapchat and Court Stream down to the row below.
        
        📝 Changelog v10.1.24 / The "Pretty" Layout Restored
        
        Dashboard Layout Restructure: 
        - Re-ordered widgets for strict structural alignment based on user feedback.
        - Kept BOTH Tabbed and Stacked social widgets to allow side-by-side comparison.
        - Centered Tasks Box beautifully in Row 4 using span 2.
        - Pushed Cinema and Court stream strictly to the lower level.

        📝 Changelog v10.1.20 / HTML Build Update
        
        Social Trackers Grouping: Designed a highly refined, horizontally-split vertical stack layout that aligns the YouTube, TikTok, and X counters inside a single widget. Fixed the alignment offset bugs by dynamically centering the iframes over text-based labels.

        📝 Changelog v10.1.14 / HTML Build Update
        
        Theme Synchronization: Color-coded the "Online" labels in the primary grid to identically match the neon accent colors of their respective networks (Tales = Light Purple, RedBull = Cyan, WOS = Blue).

        📝 Changelog v10.1.13 / HTML Build Update
        
        WOS Layout Re-design: Implemented the 'Grid Footer Approach' to prevent horizontal squishing. The top grid was reverted to 3 columns, and a custom semi-transparent horizontal footer bar was added inside the box dedicated solely to WOS metrics.
        Icon Cleanup: Removed the top-right neon wand icon from the Tales Detected box to fix overlap issues with the new data points.

        📝 Changelog v10.1.12 / HTML Build Update
        
        WOS Integration: Added a new 4th column to the 'Tales Detected' top box for WOS Views and WOS Online counters.
        Firebase App Expansion: Added a 4th initialization (wosApp) connecting securely to 'wos-dashboard-38d4c' realtime database.
        Realtime Sync: Bound 'stats/totalViews' and 'presence' listeners from WOS database directly into the Cloud Dashboard DOM.
        Grid Update: Expanded the top dashboard grid layout to `repeat(4, 1fr)` to accommodate the new metrics.

        📝 Changelog v10.1.11 / HTML Build Update

        Mirror Box Re-Architecture: Migrated the primary 'Tales Detected' box layout to a 3-column CSS Grid format.
        Stacking Implementation: Stacked "Tales Detected" above the standard "Online" counter in the left column.
        RedBull Extension: Added a new UI block for "RedBull Views", stacked above "RedBull Online" in the right column.
        Center Weighting: Spanned Plex across both grid rows in the center, scaling its typography up slightly to maintain visual balance and anchor the module.
        Smart Listeners: Updated the rbDb online listener to seamlessly process either plain integer values or numChildren arrays without breaking the display logic.
        Version Bump: Updated document title and cinema footer to reflect v10.1.11.

        📝 Changelog v10.1.10 / HTML Build Update
        Cross-Database RedBull Integration: Initialized a third Firebase connection (rbApp) directly to 'redbull-tracker-d99fc' to pull data independently from the primary labData structure.
        Exact Path Routing: Mapped the listener exactly to 'Counters/RedBull/totalViewCount' based on the newly supplied database schema.
        */
    