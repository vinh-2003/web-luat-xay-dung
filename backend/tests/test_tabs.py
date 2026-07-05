from bs4 import BeautifulSoup
import json

soup = BeautifulSoup(open('vbpl_detail.html', encoding='utf-8').read(), 'html.parser')

tabs = soup.find_all('div', class_='ant-tabs-tabpane')
print(f"Có {len(tabs)} tabpanes.")

for i, tab in enumerate(tabs):
    print(f"\n--- TAB {i} ---")
    print(tab.text[:500])
    
    # Try to find property pairs if this is Thuoc Tinh tab
    if 'Số hiệu' in tab.text and 'Ngày ban hành' in tab.text:
        print("\n=> Đây là tab Thuộc tính! Phân tích:")
        rows = tab.find_all('div', class_=lambda x: x and 'flex' in x and 'gap' in x) # commonly used in Tailwind
        if not rows:
            # Maybe just typical row divs
            rows = tab.find_all('div', class_=lambda x: x and 'row' in x.lower())
            
        print(f"Found {len(rows)} rows.")
        if len(rows) == 0:
            # Print children text
            for child in tab.children:
                if child.name:
                    print("- Child:", child.text[:100].strip())
