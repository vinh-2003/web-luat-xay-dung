from bs4 import BeautifulSoup

soup = BeautifulSoup(open('vbpl_detail.html', encoding='utf-8').read(), 'html.parser')

print("=== THUỘC TÍNH ===")
props_label = soup.find(string=lambda t: t and 'Tình trạng hiệu lực' in t)
if props_label:
    parent = props_label.parent
    while parent and parent.name != 'div' and parent.name != 'table' and len(parent.text) < 100:
        parent = parent.parent
    if parent:
        print(parent.parent.text[:1000])

print("=== NOIDUNG ===")
divs = soup.find_all('div')
large_divs = [d for d in divs if d.get('class') and len(d.text) > 2000]
for d in large_divs[:5]:
    print(f"Class: {d.get('class')}, Len: {len(d.text)}")
