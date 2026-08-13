const fs = require('fs');
let html = fs.readFileSync('New.html', 'utf8');
let newGrid = fs.readFileSync('new_grid.txt', 'utf8').trim();

const startIndex = html.indexOf('        <div class="counter-item mirror-box" style="border-top: 3px solid var(--meta-blue);">');
const endIndex = html.indexOf('    <div id="courtModal" class="modal">');

if (startIndex !== -1 && endIndex !== -1) {
    const newHtml = html.substring(0, startIndex) + newGrid + "\n    </div>\n\n" + html.substring(endIndex);
    fs.writeFileSync('New.html', newHtml, 'utf8');
    console.log("REPLACED SUCCESSFULLY!");
} else {
    console.log("COULD NOT FIND INDICES. start:", startIndex, "end:", endIndex);
}
