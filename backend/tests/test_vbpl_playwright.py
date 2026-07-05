import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Navigating to vbpl.vn...")
        await page.goto("https://vbpl.vn/")
        await page.wait_for_load_state("networkidle")
        
        html = await page.content()
        with open("vbpl_root.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Root HTML saved to vbpl_root.html")
        
        # Check if there is an input with placeholder or name=keyword
        inputs = await page.locator("input").element_handles()
        print(f"Found {len(inputs)} inputs")
        for inp in inputs:
            placeholder = await inp.get_attribute("placeholder")
            name = await inp.get_attribute("name")
            print(f"Input name={name}, placeholder={placeholder}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
