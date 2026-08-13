const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');
let perfectGrid = fs.readFileSync('perfect_grid2.txt', 'utf8').trim();

const startIndex = html.indexOf('        <div class="counter-item mirror-box" style="border-top: 3px solid var(--meta-blue);');
const endIndex = html.indexOf('    </div>\n\n    <div id="courtModal" class="modal">');

if (startIndex !== -1 && endIndex !== -1) {
    let newHtml = html.substring(0, startIndex) + perfectGrid + "\n" + html.substring(endIndex);
    newHtml = newHtml.replace('<title>Cloud Dashboard v10.1.25</title>', '<title>Cloud Dashboard v10.1.26</title>');
    
    const newChangelog = `        /* 📝 Changelog v10.1.26 / Absolute Precision Grid
        
        Dashboard Updates:
        - Applied explicit grid-area coordinates to every single box to force them exactly where requested.
        - Row 1: Meta, Twitch, Bsky, Tabbed
        - Row 2: Stacked, Snapchat, [Empty Space], Court Stream
        - Row 3: [Empty Space], Tasks (Spanning 2), BriansTheater
        
        📝 Changelog v10.1.25`;
    newHtml = newHtml.replace('        /* 📝 Changelog v10.1.25', newChangelog);
    
    fs.writeFileSync('New.html', newHtml, 'utf8');
    console.log("REPLACED SUCCESSFULLY!");
} else {
    console.log("COULD NOT FIND INDICES");
    console.log("startIndex:", startIndex);
    console.log("endIndex:", endIndex);
}
