import os

if os.path.exists('threads_bridge_v1.17.0.py'):
    with open('threads_bridge_v1.17.0.py', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace('VERSION 1.17.0', 'VERSION 1.17.1')
    text = text.replace('v1.17.0', 'v1.17.1')
    text = text.replace('threads_bridge_v1.17.0.py', 'threads_bridge_v1.17.1.py')
    
    with open('threads_bridge_v1.17.1.py', 'w', encoding='utf-8') as f:
        f.write(text)
    
    os.remove('threads_bridge_v1.17.0.py')
    print("Bumped script to threads_bridge_v1.17.1.py")
else:
    print("v1.17.0 script not found")