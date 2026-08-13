import os

if os.path.exists('threads_bridge_v1.17.8.py'):
    with open('threads_bridge_v1.17.8.py', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace('VERSION 1.17.8', 'VERSION 1.17.9')
    text = text.replace('v1.17.8', 'v1.17.9')
    text = text.replace('threads_bridge_v1.17.8.py', 'threads_bridge_v1.17.9.py')
    
    with open('threads_bridge_v1.17.9.py', 'w', encoding='utf-8') as f:
        f.write(text)
    
    os.remove('threads_bridge_v1.17.8.py')
    print("Bumped script to threads_bridge_v1.17.9.py")
else:
    print("v1.17.8 script not found")