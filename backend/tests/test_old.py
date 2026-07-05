import requests
url = "https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=142843"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
r = requests.get(url, headers=headers)
print("Length:", len(r.text))
if "Web Page Blocked" in r.text:
    print("BLOCKED!")
else:
    print("SUCCESS!")
    print(r.text[:500])
