const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

// The items we need to update are:
// 1. Tales Detected (Site Counters) -> `<div class="counter-item mirror-box" style="border-top: 3px solid var(--light-purple); height: auto; min-height: 150px; padding-bottom: 0; padding-top: 5px;">`
// 2. Meta -> `style="border-top: 3px solid var(--meta-blue); grid-area: 1 / 1;"`
// 3. Twitch -> `style="border-top: 3px solid var(--twitch-purple); cursor: pointer; grid-area: 1 / 2;"`
// 4. Tabbed -> `style="border-top: 3px solid var(--yt-red); padding: 0; display: flex; flex-direction: column; overflow: hidden; grid-area: 1 / 4;"`
// 5. Stacked -> `style="border-top: 3px solid var(--border-color); padding: 0; display: flex; flex-direction: column; overflow: hidden; align-items: stretch; height: 150px; grid-area: 2 / 1;"`
// 6. Bsky -> `style="border-top: 3px solid var(--bsky-electric); grid-area: 1 / 3;"`
// 7. Snap -> `style="border-top: 3px solid var(--snap-yellow); grid-area: 2 / 2;"`
// 8. Court Stream -> `style="grid-area: 2 / 4;"`
// 9. Tasks -> `style="border-top: 3px solid var(--tasks-blue); padding: 10px 12px 5px 12px; grid-area: 3 / 2 / 4 / 4; height: 150px;"`
// 10. Cinema -> `style="border-top: 3px solid var(--cinema-green); padding-left: 0; grid-area: 3 / 4; cursor: pointer;"`

html = html.replace(
    '<div class="counter-item mirror-box" style="border-top: 3px solid var(--light-purple); height: auto; min-height: 150px; padding-bottom: 0; padding-top: 5px;">',
    '<div class="counter-item mirror-box" id="site-counters-box" style="border-top: 3px solid var(--light-purple); height: auto; min-height: 150px; padding-bottom: 0; padding-top: 5px; grid-area: 1 / 1;">'
);

html = html.replace(
    'style="border-top: 3px solid var(--meta-blue); grid-area: 1 / 1;"',
    'style="border-top: 3px solid var(--meta-blue); grid-area: 1 / 2;"'
);

html = html.replace(
    'style="border-top: 3px solid var(--twitch-purple); cursor: pointer; grid-area: 1 / 2;"',
    'style="border-top: 3px solid var(--twitch-purple); cursor: pointer; grid-area: 1 / 3;"'
);

html = html.replace(
    'style="border-top: 3px solid var(--bsky-electric); grid-area: 1 / 3;"',
    'style="border-top: 3px solid var(--bsky-electric); grid-area: 2 / 2;"'
);

// Tabbed is already 1/4
// Stacked is already 2/1

html = html.replace(
    'style="border-top: 3px solid var(--snap-yellow); grid-area: 2 / 2;"',
    'style="border-top: 3px solid var(--snap-yellow); grid-area: 2 / 3;"'
);

// Court Stream is already 2/4
// Tasks is already 3/2 / 4/4
// Cinema is already 3/4

html = html.replace('<title>Cloud Dashboard v10.1.26</title>', '<title>Cloud Dashboard v10.1.27</title>');

let changelog = `        /* 📝 Changelog v10.1.27 / Final Perfect Grid Fix
        
        Dashboard Updates:
        - Fixed the "Site Counters" (Tales/Plex) box missing its grid assignment. It is now explicitly pinned to Box 1 (Row 1, Col 1).
        - Shifted Meta to Box 2, Twitch to Box 3, Tabbed stays at Box 4.
        - Stacked (Twitter) is Box 5, Bsky Box 6, Snap Box 7, Court Stream Box 8.
        - Tasks is Box 10 & 11, Cinema is Box 12.
        
        📝 Changelog v10.1.26`;

html = html.replace('        /* 📝 Changelog v10.1.26', changelog);

fs.writeFileSync('New.html', html);
console.log("Updated HTML successfully!");
