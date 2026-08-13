const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

const oldTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
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

const newTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px; clip-path: inset(65px 0px 0px 0px);"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px; clip-path: inset(65px 0px 0px 0px);"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none;">
                    <div style="position: absolute; left: 55px; top: 50%; transform: translateY(-50%) scale(1.1); transform-origin: left center; width: 450px; height: 220px;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px; clip-path: inset(65px 0px 0px 0px);"></iframe>
                    </div>
                </div>
            </div>`;

if (html.includes(oldTabbedHTML)) {
    html = html.replace(oldTabbedHTML, newTabbedHTML);
    html = html.replace('<title>Cloud Dashboard v10.1.35</title>', '<title>Cloud Dashboard v10.1.36</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.36 / Tabbed Username Crop
        
        Dashboard Updates:
        - Applied a highly specific CSS clip-path to slice off the top 65px of the livecounts iframes in the Tabbed widget.
        - This flawlessly hides the username/profile header that was photobombing the top of the counter, while keeping the number perfectly centered and unshifted.
        
        📝 Changelog v10.1.35`;
    
    html = html.replace('        /* 📝 Changelog v10.1.35', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact HTML. Aborting.");
}
