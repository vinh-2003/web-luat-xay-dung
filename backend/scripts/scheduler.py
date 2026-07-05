import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.scraper import LuatXayDungScraper
import datetime

def run_scheduler():
    scraper = LuatXayDungScraper()
    
    async def job_update_docs():
        print(f"[{datetime.datetime.now()}] Bắt đầu tiến trình cập nhật văn bản cũ...")
        await scraper.update_existing_documents()
        
    async def job_scrape_new():
        print(f"[{datetime.datetime.now()}] Bắt đầu tiến trình cào văn bản mới...")
        await scraper.scrape_vbpl()

    scheduler = AsyncIOScheduler()
    
    # Thiết lập chạy vào 2h sáng hằng ngày
    scheduler.add_job(job_update_docs, 'cron', hour=2, minute=0)
    scheduler.add_job(job_scrape_new, 'cron', hour=2, minute=30) # Chạy cào mới sau khi cập nhật cũ 30 phút
    
    print("Scheduler đã khởi động. Các tiến trình sẽ chạy vào 2h sáng hằng ngày.")
    print("Bấm Ctrl+C để thoát.")
    
    scheduler.start()
    
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        pass

if __name__ == "__main__":
    run_scheduler()
