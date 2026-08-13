const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

if (html.includes('id="social-stack-box" style="border-top: 3px solid var(--border-color); padding: 0; display: flex; flex-direction: column; overflow: hidden; align-items: stretch; height: 150px; grid-area: 2 / 1;"')) {
    html = html.replace(
        'id="social-stack-box" style="border-top: 3px solid var(--border-color); padding: 0; display: flex; flex-direction: column; overflow: hidden; align-items: stretch; height: 150px; grid-area: 2 / 1;"',
        'id="social-stack-box" style="border-top: 3px solid var(--border-color); padding: 0; display: flex; flex-direction: column; overflow: hidden; align-items: stretch; grid-area: 2 / 1 / 4 / 2;"'
    );
    html = html.replace('<title>Cloud Dashboard v10.1.39</title>', '<title>Cloud Dashboard v10.1.40</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.40 / Stacked Widget Expansion
        
        Dashboard Updates:
        - Expanded the Stacked Widget box to span two full rows (filling the empty space below it).
        - Removed the fixed 150px height constraint, giving the stacked iframes much more vertical room to breathe.
        
        📝 Changelog v10.1.39`;
    
    html = html.replace('        /* 📝 Changelog v10.1.39', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact string. Aborting.");
}
