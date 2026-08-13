const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

const oldTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
                <div id="tab-yt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.4); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
                <div id="tab-tt" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.4); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
                <div id="tab-x" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: none; justify-content: center; align-items: center;">
                    <div style="transform: scale(1.4); transform-origin: center center; width: 450px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative;">
                        <iframe scrolling="no" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="filter: invert(1) hue-rotate(180deg); border: 0; width: 450px; height: 220px; pointer-events: none; position: absolute;"></iframe>
                    </div>
                </div>
            </div>`;

const newTabbedHTML = `            <div id="social-tab-content" style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
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

if (html.includes(oldTabbedHTML)) {
    html = html.replace(oldTabbedHTML, newTabbedHTML);
    html = html.replace('<title>Cloud Dashboard v10.1.33</title>', '<title>Cloud Dashboard v10.1.34</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.34 / Perfect Cookie Cutter
        
        Dashboard Updates:
        - Implemented an absolute "cookie cutter" bounding box (270x60) for the Tabbed widget to physically crop out EVERYTHING except the raw number.
        - Shifted the iframes specifically to fall perfectly inside this tiny window.
        - Scaled the resulting perfectly cropped pure number up by 1.4x, ensuring it is flawlessly centered in the UI.
        
        📝 Changelog v10.1.33`;
    
    html = html.replace('        /* 📝 Changelog v10.1.33', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact HTML. Aborting.");
}
