const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

const oldTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.6) translateX(40px) translateY(-5px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.6) translateX(40px) translateY(-5px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.6) translateX(40px) translateY(-5px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
            </div>`;

const newTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.1) translateX(50px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.1) translateX(50px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.1) translateX(50px); transform-origin: center center; width: 450px; height: 220px; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute; left: -140px; top: 15px;"></iframe>
                    </div>
                </div>
            </div>`;

if (html.includes(oldTabbedHTML)) {
    html = html.replace(oldTabbedHTML, newTabbedHTML);
    html = html.replace('<title>Cloud Dashboard v10.1.30</title>', '<title>Cloud Dashboard v10.1.31</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.31 / Tabbed Counter Rescale
        
        Dashboard Updates:
        - Reverted the Tabbed counter zoom back down from the massive 1.6x to a perfect 1.1x.
        - Tuned the x-offset to perfectly center the numbers while keeping logos hidden, matching exactly how it was designed originally.
        
        📝 Changelog v10.1.30`;
    
    html = html.replace('        /* 📝 Changelog v10.1.30', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact HTML. Aborting.");
}
