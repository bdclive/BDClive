import re

with open('New.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_tool = '''<div style="position:fixed; bottom: 20px; right: 20px; z-index: 9999; background: #111; border: 2px solid var(--yt-red); padding: 15px; color: white; border-radius: 8px; text-align: center; font-family: sans-serif;">
    <div style="margin-bottom: 10px; font-weight: bold;">Alignment Tool</div>
    <div>
        <button onclick="adjY(-5)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">Up</button><br>
        <button onclick="adjX(-5)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">Left</button>
        <button onclick="adjX(5)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">Right</button><br>
        <button onclick="adjY(5)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">Down</button>
    </div>
    <div style="margin-top: 10px;">
        Zoom: <button onclick="adjS(-0.05)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">-</button> 
        <button onclick="adjS(0.05)" style="padding: 5px 15px; margin: 2px; cursor: pointer;">+</button>
    </div>
    <div id="debug-coords" style="margin-top: 10px; color: #0f0; font-family: monospace;">Top: 0px, Left: 0px, Scale: 1.0</div>
</div>
<script>
let curT = 0; let curL = 0; let curS = 1.0;
function adjY(d) { curT+=d; updateF(); }
function adjX(d) { curL+=d; updateF(); }
function adjS(d) { curS+=d; updateF(); }
function updateF() {
    document.querySelectorAll('iframe').forEach(f => {
        if(f.src.includes('livecounts')) {
            f.style.top = curT + 'px';
            f.style.left = curL + 'px';
            f.style.transform = 'scale(' + curS + ')';
        }
    });
    document.getElementById('debug-coords').innerText = 'Top: ' + curT + 'px, Left: ' + curL + 'px, Scale: ' + curS.toFixed(2);
}
</script>
</body>'''

text = re.sub(r'<div style="position:fixed; bottom: 20px; right: 20px;.*?</script>\n</body>', new_tool, text, flags=re.DOTALL)

with open('New.html', 'w', encoding='utf-8') as f:
    f.write(text)