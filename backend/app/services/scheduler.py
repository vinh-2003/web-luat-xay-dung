from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.scraper import ScraperSchedule, ScraperJob
from app.services.scraper import run_scraper_logic
import asyncio

scheduler = AsyncIOScheduler()

def execute_scheduled_job(source: str, mode: str):
    db = SessionLocal()
    try:
        # Create a new job
        new_job = ScraperJob(source=source, mode=mode)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        print(f"Scheduled ScraperJob started: {new_job.id} (Source: {source}, Mode: {mode})")
        # Run it asynchronously
        asyncio.create_task(run_scraper_logic(new_job.id))
    except Exception as e:
        print(f"Error executing scheduled job: {e}")
    finally:
        db.close()

def reload_scheduler():
    """Tải lại toàn bộ lịch trình từ CSDL vào APScheduler"""
    # Xoá toàn bộ job cũ
    scheduler.remove_all_jobs()
    
    db = SessionLocal()
    try:
        schedules = db.query(ScraperSchedule).filter(ScraperSchedule.is_active == True).all()
        for sched in schedules:
            try:
                trigger = CronTrigger.from_crontab(sched.cron_expression)
                scheduler.add_job(
                    execute_scheduled_job,
                    trigger=trigger,
                    args=[sched.source, sched.mode],
                    id=f"schedule_{sched.id}",
                    replace_existing=True
                )
                print(f"Loaded schedule {sched.id}: {sched.cron_expression} (Source: {sched.source})")
            except Exception as e:
                print(f"Lỗi cú pháp cron_expression cho schedule {sched.id}: {e}")
    except Exception as e:
        print(f"Lỗi nạp scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        reload_scheduler()
