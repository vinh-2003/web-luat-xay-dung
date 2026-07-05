import asyncio
from app.services.scraper import run_scraper_job

if __name__ == "__main__":
    try:
        run_scraper_job()
    except KeyboardInterrupt:
        print("Đã hủy bỏ bởi người dùng.")
