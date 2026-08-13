import os

if os.path.exists('threads_bridge_gui_v1.0.1.py'):
    with open('threads_bridge_gui_v1.0.1.py', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.1', 'v1.0.2')
    with open('threads_bridge_gui_v1.0.2.py', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_gui_v1.0.1.py')
    print("Bumped GUI script to threads_bridge_gui_v1.0.2.py")

if os.path.exists('threads_bridge_cli_v1.0.1.py'):
    with open('threads_bridge_cli_v1.0.1.py', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.1', 'v1.0.2')
    with open('threads_bridge_cli_v1.0.2.py', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_cli_v1.0.1.py')
    print("Bumped CLI script to threads_bridge_cli_v1.0.2.py")