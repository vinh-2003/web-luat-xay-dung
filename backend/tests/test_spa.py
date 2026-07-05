import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Truy cập trang chủ...")
        await page.goto("https://vbpl.vn/")
        await page.wait_for_load_state("networkidle")
        
        print("Đang tìm kiếm...")
        inputs = await page.locator("input[type='text']").all()
        for inp in inputs:
            ph = await inp.get_attribute("placeholder") or ""
            if "Tìm kiếm" in ph:
                await inp.fill("xây dựng")
                break
                
        btn = page.locator("button:has-text('Tìm kiếm')").first
        if await btn.count() > 0:
            await btn.click()
        else:
            await page.keyboard.press("Enter")
            
        await page.wait_for_timeout(5000)
        
        cards = await page.locator(".DocumentCard_cardContent__5tVRC").all()
        if cards:
            title_el = cards[0].locator(".DocumentCard_documentTitle__aE_F_")
            print("Title:", await title_el.inner_text())
            
            # Xóa thuộc tính target="_blank" để bắt buộc mở trong cùng tab
            await title_el.evaluate("el => el.removeAttribute('target')")
            
            print("Clicking...")
            await title_el.click(force=True)
            await page.wait_for_load_state("networkidle")
            await page.wait_for_timeout(3000)
            
            print("Current URL after click:", page.url)
            
            full_text = await page.locator("body").inner_text()
            print(f"Độ dài full_text: {len(full_text)}")
            if "Web Page Blocked" in full_text:
                print("Bị WAF block!")
            else:
                print("Thành công lấy nội dung SPA!")
                print(full_text[:500])
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
