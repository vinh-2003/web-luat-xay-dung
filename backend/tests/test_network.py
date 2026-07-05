import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Intercept network requests
        api_responses = []
        page.on("response", lambda response: asyncio.create_task(handle_response(response, api_responses)))
        
        print("Truy cập trang chủ...")
        await page.goto("https://vbpl.vn/pages/vbpq-timkiem.aspx?Keyword=xây%20dựng")
        
        print("Waiting 10s...")
        await page.wait_for_timeout(10000)
        
        with open("api_responses.txt", "w", encoding="utf-8") as f:
            for url, status in api_responses:
                f.write(f"{status} {url}\n")
                
        await browser.close()

async def handle_response(response, lst):
    try:
        url = response.url
        if "api" in url or "graphql" in url or ".json" in url or "vbpl.vn" in url:
            lst.append((url, response.status))
    except:
        pass

if __name__ == "__main__":
    asyncio.run(main())
