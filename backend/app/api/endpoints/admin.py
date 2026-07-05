from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import secrets

from app.db.database import get_db
from app.models.user import User, ChatSession
from app.models.document import Document, DocumentChunk
from app.models.scraper import ScraperJob, ScraperSchedule
from app.api.deps import get_current_active_admin
from app.services.scraper import start_scraper_background_task
from app.services.scheduler import reload_scheduler
from app.utils.email import send_email
from app.core.security import get_password_hash
from app.schemas.admin import UserCreateAdmin, ScraperStartRequest, ScheduleCreate
from app.schemas.document import DocumentUpdate
from app.services.admin import AdminService

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    return AdminService.get_stats(db)

@router.get("/users")
def get_users(
    skip: int = 0, 
    limit: int = 10, 
    search: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_admin)
):
    return AdminService.get_users(db, skip, limit, search, sort_by, order)

@router.put("/users/{user_id}/status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
    
    user = AdminService.toggle_user_status(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User status changed to {'active' if user.is_active == 1 else 'inactive'}", "is_active": user.is_active}

@router.put("/users/{user_id}/role")
def change_user_role(user_id: int, role: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    if role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'user'")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}", "role": user.role}

@router.post("/users")
def create_user(new_user: UserCreateAdmin, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    user, error = AdminService.create_user(db, new_user)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "User created successfully", "id": user.id}

@router.post("/users/{user_id}/reset-password")
def reset_user_password(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    password = secrets.token_urlsafe(8)
    user.hashed_password = get_password_hash(password)
    db.commit()
    
    # Send email
    html_content = f"""
    <h2>Xin chào {user.name},</h2>
    <p>Quản trị viên đã cấp lại mật khẩu cho tài khoản của bạn.</p>
    <p><b>Email đăng nhập:</b> {user.email}</p>
    <p><b>Mật khẩu mới:</b> {password}</p>
    <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể để đảm bảo an toàn.</p>
    """
    send_email(user.email, "Mật khẩu của bạn đã được thiết lập lại", html_content)
    
    return {"message": "Password reset successfully and emailed to user"}


@router.get("/documents")
def get_documents(
    skip: int = 0, 
    limit: int = 50,
    search: Optional[str] = None,
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "issue_date",
    order: str = "desc",
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_admin)
):
    return AdminService.get_documents(db, skip, limit, search, document_type, status, sort_by, order)

@router.get("/documents/filters")
def get_documents_filters(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    return AdminService.get_documents_filters(db)

@router.put("/documents/{doc_id}")
def update_document(doc_id: int, doc_in: DocumentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    from app.crud import crud_document
    doc = crud_document.document.get(db, id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    crud_document.document.update(db, db_obj=doc, obj_in=doc_in)
    return {"message": "Document updated successfully"}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    from app.crud import crud_document
    doc = crud_document.document.get(db, id=doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    crud_document.document.remove(db, id=doc_id)
    return {"message": "Document, chunks and bookmarks deleted successfully"}


@router.post("/scraper/run")
def trigger_scraper(req: ScraperStartRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    # Check if any job is RUNNING
    running_job = db.query(ScraperJob).filter(ScraperJob.status == "RUNNING").first()
    if running_job:
        raise HTTPException(status_code=400, detail="Có một tiến trình cào dữ liệu đang chạy. Vui lòng dừng hoặc chờ nó hoàn thành.")
        
    job = ScraperJob(
        source=req.source,
        mode=req.mode,
        timeout_minutes=req.timeout_minutes,
        status="PENDING"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    background_tasks.add_task(start_scraper_background_task, job.id)
    return {"message": "Scraper started in background", "job_id": job.id}

@router.post("/scraper/{job_id}/pause")
def pause_scraper(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    job = db.query(ScraperJob).filter(ScraperJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "RUNNING":
        raise HTTPException(status_code=400, detail="Chỉ có thể tạm dừng khi đang RUNNING")
    job.status = "PAUSED"
    db.commit()
    return {"message": "Job paused"}

@router.post("/scraper/{job_id}/resume")
def resume_scraper(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    job = db.query(ScraperJob).filter(ScraperJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "PAUSED":
        raise HTTPException(status_code=400, detail="Chỉ có thể tiếp tục khi đang PAUSED")
    job.status = "RUNNING"
    db.commit()
    return {"message": "Job resumed"}

@router.post("/scraper/{job_id}/stop")
def stop_scraper(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    job = db.query(ScraperJob).filter(ScraperJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in ["RUNNING", "PAUSED", "PENDING"]:
        raise HTTPException(status_code=400, detail="Job đã kết thúc")
    job.status = "STOPPED"
    job.ended_at = func.now()
    db.commit()
    return {"message": "Job stopped"}

@router.get("/scraper/status")
def get_scraper_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    # Lấy job đang chạy hoặc tạm dừng
    active_job = db.query(ScraperJob).filter(ScraperJob.status.in_(["RUNNING", "PAUSED", "PENDING"])).order_by(ScraperJob.id.desc()).first()
    if active_job:
        return active_job
    # Nếu không có active thì lấy job gần nhất
    latest_job = db.query(ScraperJob).order_by(ScraperJob.id.desc()).first()
    return latest_job

@router.get("/scraper/history")
def get_scraper_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    total = db.query(ScraperJob).count()
    jobs = db.query(ScraperJob).order_by(ScraperJob.id.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "items": jobs
    }

@router.get("/scraper/schedules")
def get_schedules(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    schedules = db.query(ScraperSchedule).all()
    return schedules

@router.post("/scraper/schedules")
def create_schedule(sched_in: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    # Hiện tại cho phép 1 schedule duy nhất cho đơn giản, có thể mở rộng sau
    existing = db.query(ScraperSchedule).first()
    if existing:
        existing.source = sched_in.source
        existing.mode = sched_in.mode
        existing.cron_expression = sched_in.cron_expression
        existing.is_active = sched_in.is_active
        db.commit()
    else:
        new_sched = ScraperSchedule(
            source=sched_in.source,
            mode=sched_in.mode,
            cron_expression=sched_in.cron_expression,
            is_active=sched_in.is_active
        )
        db.add(new_sched)
        db.commit()
    
    reload_scheduler()
    return {"message": "Schedule updated"}
