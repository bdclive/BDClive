import re
import requests

html = open('livecounts.html', encoding='utf-8').read()
js_files = re.findall(r'src="(/_next/static/[^"]+)"', html)

for js in set(js_files):
    url = f"https://livecounts.io{js}"
    try:
        r = requests.get(url)
        content = r.text
        # Search for api endpoints
        apis = re.findall(r'https://[a-zA-Z0-9.-]+/api/[^\s\"\'\\]+', content)
        if apis:
            print(f"Found in {js}:")
            for a in set(apis): print("  " + a)
            
        endpoints = re.findall(r'["\']/api/[^\s\"\'\\]+["\']', content)
        if endpoints:
            print(f"Found relative API in {js}:")
            for a in set(endpoints): print("  " + a)
            
        # Also look for mixerno
        mix = re.findall(r'["\']https://[^\s\"\'\\]*mixerno[^\s\"\'\\]*["\']', content)
        if mix:
            print(f"Found mixerno in {js}:")
            for a in set(mix): print("  " + a)
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")