import asyncio
from playwright.async_api import async_playwright

async def main():
    url = "https://vbpl.vn/van-ban/chi-tiet/luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xay-dung-so-62-2020-qh14--142843"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Lấy cookie bằng cách vào trang chủ trước
        print("Truy cập trang chủ để lấy session...")
        await page.goto("https://vbpl.vn/pages/vbpq-timkiem.aspx?Keyword=xây%20dựng")
        await page.wait_for_load_state("networkidle")
        
        print("Đang truy cập trang chi tiết...")
        url = "https://vbpl.vn/van-ban/chi-tiet/luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xay-dung-so-62-2020-qh14--142843"
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        
        print("Trang hiện tại:", page.url)
        
        # Thử tìm các tab
        tabs = await page.locator(".tab-pane, .tab-content, .nav-tabs li a, .tabs li a, a.tab").all()
        for i, tab in enumerate(tabs):
            try:
                text = await tab.inner_text()
                print(f"Tab {i}: {text.strip()}")
            except:
                pass
                
        # Tìm div chứa properties
        props_tables = await page.locator("table").all()
        print(f"Có {len(props_tables)} bảng trên trang")
        for i, tbl in enumerate(props_tables):
            text = await tbl.inner_text()
            if "Tình trạng hiệu lực" in text or "Số hiệu" in text:
                print("Tìm thấy bảng thuộc tính!")
                print(text)
                
        # Tìm div chứa toàn văn
        content_divs = await page.locator(".toanvan, .toanvancontent, #toanvan, #toanvancontent, .content").all()
        print(f"Có {len(content_divs)} div nội dung")
        if content_divs:
            for div in content_divs:
                class_name = await div.get_attribute("class")
                id_name = await div.get_attribute("id")
                print(f"Tìm thấy div: id={id_name}, class={class_name}")
                text = await div.inner_text()
                print(f"Độ dài text: {len(text)}")
        
        # Fallback for full text
        full_text = await page.locator("body").inner_text()
        print(f"Độ dài full_text fallback: {len(full_text)}")
        print("Nội dung:")
        print(full_text)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
