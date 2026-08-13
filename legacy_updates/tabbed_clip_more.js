const fs = require('fs');

let html = fs.readFileSync('New.html', 'utf8');

if (html.includes('clip-path: inset(65px 0px 0px 0px);')) {
    html = html.replaceAll('clip-path: inset(65px 0px 0px 0px);', 'clip-path: inset(76px 0px 0px 0px);');
    html = html.replace('<title>Cloud Dashboard v10.1.36</title>', '<title>Cloud Dashboard v10.1.37</title>');
    
    let changelog = `        /* 📝 Changelog v10.1.37 / Deep Username Crop
        
        Dashboard Updates:
        - Deepened the CSS clip-path guillotine from 65px to 76px to completely sever the last remaining pixels of the username/avatar from the top of the Tabbed counter.
        
        📝 Changelog v10.1.36`;
    
    html = html.replace('        /* 📝 Changelog v10.1.36', changelog);
    
    fs.writeFileSync('New.html', html);
    console.log("Updated HTML successfully!");
} else {
    console.log("Could not find exact clip-path. Aborting.");
}
