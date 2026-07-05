import requests
url = "https://vbpl.vn/van-ban/chi-tiet/luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xay-dung-so-62-2020-qh14--142843"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive'
}
r = requests.get(url, headers=headers)
from bs4 import BeautifulSoup
soup = BeautifulSoup(r.text, 'html.parser')

print("=== THUỘC TÍNH ===")
idx = r.text.find("Tình trạng hiệu lực")
if idx != -1:
    print("Found at:", idx)
    print(r.text[max(0, idx-500) : min(len(r.text), idx+500)])
else:
    print("Not found!")
