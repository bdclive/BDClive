import re

with open('New.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('; filter: invert(1) hue-rotate(180deg); mix-blend-mode: screen;', '')

with open('New.html', 'w', encoding='utf-8') as f:
    f.write(text)