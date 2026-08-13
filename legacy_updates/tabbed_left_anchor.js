const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

const oldTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: center;">
                    <div style="width: 270px; height: 60px; overflow: hidden; position: relative; transform: scale(1.4); border-radius: 4px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -125px; top: -65px;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="width: 270px; height: 60px; overflow: hidden; position: relative; transform: scale(1.4); border-radius: 4px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -125px; top: -65px;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="width: 270px; height: 60px; overflow: hidden; position: relative; transform: scale(1.4); border-radius: 4px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -125px; top: -65px;"></iframe>
                    </div>
                </div>
            </div>`;

const newTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
            </div>`;

if (html.includes(oldTabbedHTML)) {
    html = html.replace(oldTabbedHTML, newTabbedHTML);
    html = html.replace('<title>Cloud Dashboard v10.1.34</title>', '<title>Cloud Dashboard v10.1.35</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.35 / Tabbed Left Anchor
        
        Dashboard Updates:
        - Replicated the EXACT math and styling of the Stacked Widget (which works flawlessly) for the Tabbed Widget.
        - Used \`transform-origin: left center\` to prevent the massive scaling from pushing the numbers out of the overflow boundaries.
        - Set zoom to 1.1x so the numbers are large, clean, and perfectly aligned in view.
        
        📝 Changelog v10.1.34`;
    
    html = html.replace('        /* 📝 Changelog v10.1.34', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact HTML. Aborting.");
}
