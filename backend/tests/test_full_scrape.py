import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        url = "https://vbpl.vn/van-ban/chi-tiet/luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xay-dung-so-62-2020-qh14--142843"
        print("Truy cập:", url)
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        
        print("Chờ load Nội dung...")
        await page.wait_for_selector(".ant-tabs-tabpane", timeout=15000)
        
        # 1. Lấy toàn văn (nội dung)
        content_el = page.locator(".ant-tabs-tabpane").first
        full_text = await content_el.inner_text()
        print(f"Độ dài toàn văn: {len(full_text)}")
        print(f"Trích đoạn: {full_text[:200].replace(chr(10), ' ')}")
        
        # 2. Chuyển sang tab Thuộc tính
        print("Click tab Thuộc tính...")
        tab_btn = page.locator(".ant-tabs-tab-btn", has_text="Thuộc tính").first
        if await tab_btn.count() > 0:
            await tab_btn.click()
            await page.wait_for_timeout(2000) # Wait for React to render
            
            # Lấy nội dung tab Thuộc tính
            props_el = page.locator(".ant-tabs-tabpane-active").first
            props_text = await props_el.inner_text()
            print("\n--- TEXT THUỘC TÍNH ---")
            print(props_text)
            
            # Lưu ra file để dễ phân tích
            with open("props.txt", "w", encoding="utf-8") as f:
                f.write(props_text)
        else:
            print("Không tìm thấy nút Thuộc tính!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
