import sys
import io
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    if isinstance(sys.stdout, io.TextIOWrapper):
        sys.stdout.reconfigure(encoding='utf-8')
    if isinstance(sys.stderr, io.TextIOWrapper):
        sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from contextlib import asynccontextmanager
from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

from app.services.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo DB tables (Rất quan trọng khi deploy lên cloud mới)
    from app.db.database import engine, Base
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    
    # Khởi tạo scheduler khi ứng dụng bắt đầu
    start_scheduler()
    
    # Khởi tạo admin
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
        if not admin_user:
            print(f"Creating superuser {settings.FIRST_SUPERUSER_EMAIL}")
            hashed_pwd = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
            new_admin = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                name="Administrator",
                hashed_password=hashed_pwd,
                role="admin",
                is_active=1
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()
    yield
    
    # Khi ứng dụng tắt (Graceful Shutdown)
    print("Shutting down... Stopping all active scraper jobs to release background threads.")
    db = SessionLocal()
    try:
        from app.models.scraper import ScraperJob
        active_jobs = db.query(ScraperJob).filter(ScraperJob.status.in_(["RUNNING", "PAUSED", "PENDING"])).all()
        for job in active_jobs:
            job.status = "STOPPED"
            job.message = "Server tắt đột ngột (Graceful Shutdown)"
        db.commit()
    except Exception as e:
        print(f"Error stopping jobs during shutdown: {e}")
    finally:
        db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [str(origin) for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Web Luat Xay Dung AI Backend"}

# Include routers
from app.api.endpoints import search, chat, auth, bookmarks, admin
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(bookmarks.router, prefix=f"{settings.API_V1_STR}/bookmarks", tags=["bookmarks"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
