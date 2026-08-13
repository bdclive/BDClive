const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

if (html.includes('left: 75px; top: 50%; transform: translateY(-50%) scale(1.1);')) {
    html = html.replaceAll('left: 75px; top: 50%; transform: translateY(-50%) scale(1.1);', 'left: 65px; top: 50%; transform: translateY(-50%) scale(1.1);');
    html = html.replace('<title>Cloud Dashboard v10.1.38</title>', '<title>Cloud Dashboard v10.1.39</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.39 / Tabbed Right Shift -10
        
        Dashboard Updates:
        - Fine-tuned the Tabbed numbers push to exactly 10 pixels off the left wall (left anchor at 65px) for the perfect sweet spot.
        
        📝 Changelog v10.1.38`;
    
    html = html.replace('        /* 📝 Changelog v10.1.38', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact string. Aborting.");
}
