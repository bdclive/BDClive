const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

if (html.includes('left: 55px; top: 50%; transform: translateY(-50%) scale(1.1);')) {
    html = html.replaceAll('left: 55px; top: 50%; transform: translateY(-50%) scale(1.1);', 'left: 75px; top: 50%; transform: translateY(-50%) scale(1.1);');
    html = html.replace('<title>Cloud Dashboard v10.1.37</title>', '<title>Cloud Dashboard v10.1.38</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.38 / Tabbed Right Shift
        
        Dashboard Updates:
        - Pushed the Tabbed numbers 20 pixels off the left wall (changed left anchor from 55px to 75px) to perfectly center them in the box.
        
        📝 Changelog v10.1.37`;
    
    html = html.replace('        /* 📝 Changelog v10.1.37', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact string. Aborting.");
}
