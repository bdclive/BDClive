const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');
let perfectGrid = fs.readFileSync('perfect_grid.txt', 'utf8').trim();

// Push the iframe further left to hide the livecounts.io internal icon!
perfectGrid = perfectGrid.replace(/left: -75px;/g, 'left: -135px;');
perfectGrid = perfectGrid.replace(/left: 110px;/g, 'left: 95px;');

const startIndex = html.indexOf('        <div class="counter-item mirror-box" style="border-top: 3px solid var(--meta-blue);">');
const endIndex = html.indexOf('    </div>\n\n    <div id="courtModal" class="modal">');

if (startIndex !== -1 && endIndex !== -1) {
    // replace everything from startIndex to endIndex with perfectGrid
    let newHtml = html.substring(0, startIndex) + perfectGrid + "\n" + html.substring(endIndex);
    
    // Also update version from v10.1.23 to v10.1.24
    newHtml = newHtml.replace('<title>Cloud Dashboard v10.1.23</title>', '<title>Cloud Dashboard v10.1.24</title>');
    
    // update changelog
    const newChangelog = `        /* 📝 Changelog v10.1.24 / The "Pretty" Layout Restored
        
        Dashboard Updates:
        - Restored the exact side-by-side Tabbed and Stacked layout (the "1st setup").
        - Fixed the CSS Grid truncation bug that caused the Tasks box to vanish.
        - Pushed the social counter iframes further left to visually clip out their internal logos, leaving only pure text numbers.
        
        📝 Changelog v10.1.23`;
    newHtml = newHtml.replace('        /* 📝 Changelog v10.1.23', newChangelog);
    
    fs.writeFileSync('New.html', newHtml, 'utf8');
    console.log("REPLACED SUCCESSFULLY!");
} else {
    console.log("COULD NOT FIND INDICES");
    console.log("startIndex:", startIndex);
    console.log("endIndex:", endIndex);
}
