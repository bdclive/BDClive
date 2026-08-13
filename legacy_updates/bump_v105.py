import os

if os.path.exists('threads_bridge_gui_v1.0.4_(windows).pyw'):
    with open('threads_bridge_gui_v1.0.4_(windows).pyw', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.4', 'v1.0.5')
    with open('threads_bridge_gui_v1.0.5_(windows).pyw', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_gui_v1.0.4_(windows).pyw')
    print("Bumped GUI script to threads_bridge_gui_v1.0.5_(windows).pyw")

if os.path.exists('threads_bridge_cli_v1.0.4_(terminal).py'):
    with open('threads_bridge_cli_v1.0.4_(terminal).py', 'r', encoding='utf-8') as f: text = f.read()
    text = text.replace('v1.0.4', 'v1.0.5')
    with open('threads_bridge_cli_v1.0.5_(terminal).py', 'w', encoding='utf-8') as f: f.write(text)
    os.remove('threads_bridge_cli_v1.0.4_(terminal).py')
    print("Bumped CLI script to threads_bridge_cli_v1.0.5_(terminal).py")