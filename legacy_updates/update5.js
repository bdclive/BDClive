const fs = require('fs');

let lines = fs.readFileSync('New.html', 'utf8').split('\n');
let perfectGrid = fs.readFileSync('perfect_grid2.txt', 'utf8').trim();

// find start (line containing var(--meta-blue) right after counter-grid starts)
let startIdx = lines.findIndex(l => l.includes('        <div class="counter-item mirror-box" style="border-top: 3px solid var(--meta-blue)'));
// find end (the closing div of the last item before courtModal)
let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('<div id="courtModal" class="modal">'));

if (startIdx !== -1 && endIdx !== -1) {
    // The closing </div> for counter-grid is at endIdx - 2.
    // The last widget's </div> is at endIdx - 3.
    // We want to replace everything from startIdx to endIdx - 3 inclusive.
    
    let before = lines.slice(0, startIdx).join('\n');
    let after = lines.slice(endIdx - 2).join('\n'); // keep the </div> that closes counter-grid, and the empty line, and courtModal
    
    let newHtml = before + '\n' + perfectGrid + '\n' + after;
    
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
    console.log("startIndex:", startIdx);
    console.log("endIndex:", endIdx);
}
