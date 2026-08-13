import re

with open('New.html', 'r', encoding='utf-8') as f:
    text = f.read()

def replace_iframe_style(match):
    src = match.group(1)
    return f'<iframe scrolling="no" src="{src}" style="border: 0; width: 450px; height: 220px; pointer-events: none;"></iframe>'

text = re.sub(r'<iframe scrolling="no" src="([^"]+)" style="[^"]*"></iframe>', replace_iframe_style, text)
text = re.sub(r'<div style="position: absolute; left: 65px; top: 50%; transform: translateY\(-50%\) scale\(1\.1\); transform-origin: left center; width: 450px; height: 220px;">', '<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">', text)
text = re.sub(r'<div style="position: absolute; left: 105px; top: 50%; transform: translateY\(-50%\) scale\(0\.65\); transform-origin: left center; width: 450px; height: 220px;">', '<div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding-left: 50px;">', text)

with open('New.html', 'w', encoding='utf-8') as f:
    f.write(text)