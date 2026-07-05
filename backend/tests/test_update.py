import asyncio
from app.services.scraper import LuatXayDungScraper

async def test_update():
    scraper = LuatXayDungScraper()
    await scraper.update_existing_documents()

if __name__ == "__main__":
    asyncio.run(test_update())
