const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

const oldTabbedHTML = `        <!-- SOCIAL TABBED WIDGET -->
        <div class="counter-item mirror-box" id="social-tab-box" style="border-top: 3px solid var(--yt-red); padding: 0; display: flex; flex-direction: column; overflow: hidden; grid-area: 1 / 4;">
            <div style="display: flex; justify-content: space-around; width: 100%; background: #0b0f14; z-index: 10; border-bottom: 1px solid var(--border-color);">
                <div class="social-tab" onclick="switchSocialTab('yt')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid var(--yt-red);">
                    <i class="fa-brands fa-youtube" style="color:var(--yt-red); font-size: 14px;"></i>
                </div>
                <div class="social-tab" onclick="switchSocialTab('tt')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid transparent;">
                    <i class="fa-brands fa-tiktok" style="color:var(--tt-cyan); font-size: 14px;"></i>
                </div>
                <div class="social-tab" onclick="switchSocialTab('x')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid transparent;">
                    <i class="fa-brands fa-x-twitter" style="color:#ffffff; font-size: 14px;"></i>
                </div>
            </div>
            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: var(--card-bg);">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                    <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg"></iframe>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox"></iframe>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox"></iframe>
                </div>
            </div>
        </div>`;

const newTabbedHTML = `        <!-- SOCIAL TABBED WIDGET -->
        <div class="counter-item mirror-box" id="social-tab-box" style="border-top: 3px solid var(--yt-red); padding: 0; display: flex; flex-direction: column; overflow: hidden; grid-area: 1 / 4;">
            <div style="display: flex; justify-content: space-around; width: 100%; background: rgba(0,0,0,0.4); z-index: 10; border-bottom: 1px solid var(--border-color);">
                <div id="tab-btn-yt" class="social-tab" onclick="switchSocialTab('yt')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid var(--yt-red); transition: 0.3s;">
                    <i class="fa-brands fa-youtube" style="color:var(--yt-red); font-size: 14px;"></i>
                </div>
                <div id="tab-btn-tt" class="social-tab" onclick="switchSocialTab('tt')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid transparent; transition: 0.3s; opacity: 0.5;">
                    <i class="fa-brands fa-tiktok" style="color:var(--tt-cyan); font-size: 14px;"></i>
                </div>
                <div id="tab-btn-x" class="social-tab" onclick="switchSocialTab('x')" style="padding: 8px 0; cursor: pointer; flex: 1; text-align: center; border-bottom: 2px solid transparent; transition: 0.3s; opacity: 0.5;">
                    <i class="fa-brands fa-x-twitter" style="color:#ffffff; font-size: 14px;"></i>
                </div>
            </div>
            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <!-- To make it beautiful, center the iframe inside a scaling container -->
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: center;">
                    <div style="transform: scale(0.65); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(0.65); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(0.65); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
            </div>
        </div>`;

if (html.includes(oldTabbedHTML)) {
    html = html.replace(oldTabbedHTML, newTabbedHTML);
} else {
    console.log("Could not find old tab HTML strictly.");
    // Try a looser match
    let startIdx = html.indexOf('<!-- SOCIAL TABBED WIDGET -->');
    let endIdx = html.indexOf('<!-- REFINED SOCIAL STACK WIDGET -->');
    if (startIdx !== -1 && endIdx !== -1) {
        html = html.substring(0, startIdx) + newTabbedHTML + '\n\n        ' + html.substring(endIdx);
    } else {
        console.log("FAILED to replace HTML");
    }
}

const switchJs = `        function switchSocialTab(platform) {
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

        function openCourt() {`;

html = html.replace('        function openCourt() {', switchJs);

html = html.replace('<title>Cloud Dashboard v10.1.27</title>', '<title>Cloud Dashboard v10.1.28</title>');

let changelog = `        /* 📝 Changelog v10.1.28 / Tabbed Widget Repaired
        
        Dashboard Updates:
        - Added missing javascript function switchSocialTab() so the tabs are actually clickable.
        - Fixed the visual styling of the Tabbed widget to match the dark-mode (inverted) livecounts styling.
        - Used a CSS transform scale and flex centering so the iframe fits perfectly and beautifully inside the box without being cut off.
        - Made unselected tabs semi-transparent and added smooth transitions.
        
        📝 Changelog v10.1.27`;

html = html.replace('        /* 📝 Changelog v10.1.27', changelog);

fs.writeFileSync('New.html', html);
console.log("Updated HTML successfully!");
