import os

if os.path.exists('threads_bridge_v1.17.4.py'):
    with open('threads_bridge_v1.17.4.py', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace('VERSION 1.17.4', 'VERSION 1.17.5')
    text = text.replace('v1.17.4', 'v1.17.5')
    text = text.replace('threads_bridge_v1.17.4.py', 'threads_bridge_v1.17.5.py')
    
    with open('threads_bridge_v1.17.5.py', 'w', encoding='utf-8') as f:
        f.write(text)
    
    os.remove('threads_bridge_v1.17.4.py')
    print("Bumped script to threads_bridge_v1.17.5.py")
else:
    print("v1.17.4 script not found")