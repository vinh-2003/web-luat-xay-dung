from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class ScraperJob(Base):
    __tablename__ = "scraper_jobs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="PENDING") # PENDING, RUNNING, PAUSED, STOPPED, COMPLETED, FAILED
    source = Column(String, default="vbpl") # vbpl, moc, all
    mode = Column(String, default="full") # full, update
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    docs_added = Column(Integer, default=0)
    docs_updated = Column(Integer, default=0)
    current_page = Column(Integer, default=1)
    total_pages = Column(Integer, nullable=True)
    message = Column(String, nullable=True)
    timeout_minutes = Column(Integer, default=60) # Tự động STOP nếu vượt quá thời gian (đặc biệt khi PAUSED)

class ScraperSchedule(Base):
    __tablename__ = "scraper_schedules"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, default="vbpl")
    mode = Column(String, default="update")
    cron_expression = Column(String, default="0 2 * * *") # Chạy lúc 2h sáng
    is_active = Column(Boolean, default=False)
