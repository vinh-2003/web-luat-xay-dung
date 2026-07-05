from bs4 import BeautifulSoup
import json

with open("vbpl_detail_dom.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")
text = soup.get_text(separator=' | ', strip=True)

if "Số hiệu" in text and "Loại văn bản" in text:
    print("Found properties in text!")
    # Let's find tables or divs that might hold the key-value pairs
    # Often it's a definition list, or div with grid/flex, or a table
    divs = soup.find_all("div")
    for d in divs:
        dt = d.get_text(separator=' | ', strip=True)
        if "Số hiệu" in dt and "Loại văn bản" in dt and len(dt) < 1000:
            print("Found property container:")
            print(dt)
            break
else:
    print("Properties not found in the initial DOM.")
