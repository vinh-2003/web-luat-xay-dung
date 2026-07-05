import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        await page.goto("https://vbpl.vn/")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(2000)
        
        inputs = await page.locator("input[type='text']").all()
        for inp in inputs:
            ph = await inp.get_attribute("placeholder") or ""
            if "Tìm kiếm" in ph or "nhập" in ph.lower() or "văn bản" in ph.lower():
                await inp.fill("xây dựng")
                break
                
        search_btn = page.locator("button:has-text('Tìm kiếm')").first
        await search_btn.click()
        await page.wait_for_timeout(5000)
        
        cards = await page.locator(".DocumentCard_documentTitle__aE_F_").all()
        if len(cards) > 0:
            print("Clicking first result...")
            async with context.expect_page() as new_page_info:
                await cards[0].click(timeout=3000)
                
            new_page = await new_page_info.value
            await new_page.wait_for_load_state("networkidle")
            await new_page.wait_for_timeout(3000)
            
            # Click "Thuộc tính" tab
            # We don't know the exact selector, but it's probably a div or button containing the text "Thuộc tính"
            tabs = await new_page.locator("text='Thuộc tính'").all()
            if tabs:
                print("Clicking Thuộc tính tab...")
                await tabs[0].click()
                await new_page.wait_for_timeout(2000)
                
                # Get the DOM
                html = await new_page.content()
                with open("vbpl_detail_properties.html", "w", encoding="utf-8") as f:
                    f.write(html)
                print("Saved Thuộc tính DOM")
            else:
                print("Could not find Thuộc tính tab")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
