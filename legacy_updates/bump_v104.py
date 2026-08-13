import os

if os.path.exists('threads_bridge_gui_v1.0.3.py'):
    with open('threads_bridge_gui_v1.0.3.py', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.3', 'v1.0.4')
    with open('threads_bridge_gui_v1.0.4.py', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_gui_v1.0.3.py')
    print("Bumped GUI script to threads_bridge_gui_v1.0.4.py")

if os.path.exists('threads_bridge_cli_v1.0.3.py'):
    with open('threads_bridge_cli_v1.0.3.py', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.3', 'v1.0.4')
    with open('threads_bridge_cli_v1.0.4.py', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_cli_v1.0.3.py')
    print("Bumped CLI script to threads_bridge_cli_v1.0.4.py")