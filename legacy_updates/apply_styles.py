import re

with open('New.html', 'r', encoding='utf-8') as f:
    text = f.read()

def update_iframe(match):
    src = match.group(1)
    return f'<iframe scrolling="no" src="{src}" style="border: 0; width: 450px; height: 220px; pointer-events: none; position: relative; top: 60px; left: -65px; transform: scale(1.1); clip-path: inset(76px 0px 0px 0px);"></iframe>'

text = re.sub(r'<iframe scrolling="no" src="([^"]+)" style="[^"]*"></iframe>', update_iframe, text)

# Update the alignment tool defaults so it starts at these new values
text = text.replace('let curT = 0; let curL = 0; let curS = 1.0;', 'let curT = 60; let curL = -65; let curS = 1.1;')

with open('New.html', 'w', encoding='utf-8') as f:
    f.write(text)