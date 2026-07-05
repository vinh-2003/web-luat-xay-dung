import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        await page.goto("https://vbpl.vn/")
        await page.wait_for_load_state("networkidle")
        
        inputs = await page.locator("input[type='text']").all()
        for inp in inputs:
            ph = await inp.get_attribute("placeholder") or ""
            if "Tìm kiếm" in ph:
                await inp.fill("xây dựng")
                break
                
        await page.locator("button:has-text('Tìm kiếm')").first.click()
        await page.wait_for_timeout(5000)
        
        cards = await page.locator(".DocumentCard_cardContent__5tVRC").all()
        if cards:
            title_el = cards[0].locator(".DocumentCard_documentTitle__aE_F_")
            print("Title from card:", await title_el.inner_text())
            
            async with context.expect_page() as new_page_info:
                await title_el.click(force=True)
            
            new_page = await new_page_info.value
            await new_page.wait_for_load_state("networkidle")
            await new_page.wait_for_timeout(3000)
            
            tabs = await new_page.locator("text='Thuộc tính'").all()
            if tabs:
                await tabs[0].click(force=True)
                await new_page.wait_for_timeout(2000)
                
                # try to find the container
                # We can find the element containing 'Số hiệu' and get its parent
                sohieu = new_page.locator("text='Số hiệu'")
                if await sohieu.count() > 0:
                    el = sohieu.first
                    # get parent hierarchy class names
                    parent = await el.evaluate_handle("el => el.closest('div.container') || el.closest('table') || el.parentElement.parentElement")
                    
                    html = await new_page.evaluate("(el) => el.outerHTML", parent)
                    text = await new_page.evaluate("(el) => el.innerText", parent)
                    with open("vbpl_test_props.txt", "w", encoding="utf-8") as f:
                        f.write(text)
                    print("Saved props text")
                    
                    # print some classes
                    cls = await new_page.evaluate("(el) => el.className", parent)
                    print("Parent class:", cls)
                    
            await new_page.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
