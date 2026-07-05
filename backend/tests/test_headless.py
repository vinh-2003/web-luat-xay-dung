import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        print("Truy cập chi tiết...")
        url = "https://vbpl.vn/van-ban/chi-tiet/luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xay-dung-so-62-2020-qh14--142843"
        await page.goto(url)
        await page.wait_for_load_state("networkidle")
        
        await page.wait_for_timeout(3000)
        
        print("Trang hiện tại:", page.url)
        full_text = await page.locator("body").inner_text()
        print(f"Độ dài full_text: {len(full_text)}")
        if "Web Page Blocked" in full_text:
            print("Vẫn bị WAF block!")
        else:
            print("Thành công bypass WAF!")
            
            # Lưu HTML để phân tích
            html = await page.content()
            with open("vbpl_detail.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("Đã lưu vbpl_detail.html")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
