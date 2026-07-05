import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # We will try to search for "xây dựng"
        print("Navigating to vbpl.vn...")
        await page.goto("https://vbpl.vn/pages/vbpq-timkiem.aspx?Keyword=x%C3%A2y%20d%E1%BB%B1ng")
        await page.wait_for_load_state("networkidle")
        
        html = await page.content()
        with open("search_results.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Search results saved to search_results.html")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
