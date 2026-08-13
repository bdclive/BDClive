import os

if os.path.exists('threads_bridge_v1.17.11.py'):
    with open('threads_bridge_v1.17.11.py', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace('VERSION 1.17.11', 'VERSION 1.17.12')
    text = text.replace('v1.17.11', 'v1.17.12')
    text = text.replace('threads_bridge_v1.17.11.py', 'threads_bridge_v1.17.12.py')
    
    with open('threads_bridge_v1.17.12.py', 'w', encoding='utf-8') as f:
        f.write(text)
    
    os.remove('threads_bridge_v1.17.11.py')
    print("Bumped script to threads_bridge_v1.17.12.py")
else:
    print("v1.17.11 script not found")