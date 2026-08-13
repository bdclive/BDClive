import re

with open('New.html', 'r', encoding='utf-8') as f:
    text = f.read()

# The exact new 300x80 iframe codes
yt_frame = '<iframe height="80px" width="300px" frameborder="0" src="https://livecounts.io/embed/youtube-live-subscriber-counter/UCMuv7PfbLVm8IZsd6Bgqqzg" style="border: 0; width:300px; height:80px; filter: invert(1) hue-rotate(180deg); mix-blend-mode: screen;"></iframe>'
tt_frame = '<iframe height="80px" width="300px" frameborder="0" src="https://livecounts.io/embed/tiktok-live-follower-counter/briandivacox" style="border: 0; width:300px; height:80px; filter: invert(1) hue-rotate(180deg); mix-blend-mode: screen;"></iframe>'
x_frame = '<iframe height="80px" width="300px" frameborder="0" src="https://livecounts.io/embed/twitter-live-follower-counter/briandivacox" style="border: 0; width:300px; height:80px;"></iframe>'

# Replace the Stacked Widget internals
new_stack_content = f'''<div style="display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; width: 100%; height: 100%;">
    {{yt_frame}}
    {{tt_frame}}
    {{x_frame}}
</div>'''

# Replace the old Stacked widget internals with the new 300x80 frames
text = re.sub(r'<div class="counter-item mirror-box" id="social-stack-box"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>', 
              f'<div class="counter-item mirror-box" id="social-stack-box" style="border-top: 3px solid #91a4b8; padding: 0; display: flex; flex-direction: column; overflow: hidden; align-items: center; grid-area: 2 / 1 / 4 / 2;">\n    {new_stack_content}\n</div>', text, flags=re.DOTALL)

with open('New.html', 'w', encoding='utf-8') as f:
    f.write(text)