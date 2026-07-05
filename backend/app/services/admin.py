from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.user import User, ChatSession
from app.models.document import Document
from app.schemas.admin import UserCreateAdmin
from app.core.security import get_password_hash
from app.utils.email import send_email
import secrets

class AdminService:
    @staticmethod
    def get_stats(db: Session) -> Dict[str, Any]:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == 1).count()
        total_docs = db.query(Document).count()
        total_sessions = db.query(ChatSession).count()
        
        # Biểu đồ loại văn bản
        docs_by_type = db.query(Document.document_type, func.count(Document.id)).group_by(Document.document_type).all()
        document_stats_by_type = [{"name": t[0] if t[0] else "Chưa xác định", "value": t[1]} for t in docs_by_type]
        
        # Biểu đồ trạng thái văn bản
        docs_by_status = db.query(Document.status, func.count(Document.id)).group_by(Document.status).all()
        document_stats_by_status = [{"name": s[0] if s[0] else "N/A", "value": s[1]} for s in docs_by_status]
        
        # Dữ liệu gần đây
        recent_users = db.query(User).order_by(User.id.desc()).limit(5).all()
        recent_docs = db.query(Document).order_by(Document.issue_date.desc()).limit(5).all()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_documents": total_docs,
            "total_chat_sessions": total_sessions,
            "document_stats_by_type": document_stats_by_type,
            "document_stats_by_status": document_stats_by_status,
            "recent_users": [{"id": u.id, "name": u.name, "email": u.email, "created_at": u.created_at} for u in recent_users],
            "recent_documents": [{"id": d.id, "title": d.title, "document_number": d.document_number, "issue_date": d.issue_date, "status": d.status} for d in recent_docs]
        }

    @staticmethod
    def get_users(
        db: Session, skip: int = 0, limit: int = 10, search: Optional[str] = None, sort_by: str = "created_at", order: str = "desc"
    ):
        query = db.query(User)
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(User.name.ilike(search_term), User.email.ilike(search_term)))
            
        if sort_by == "name":
            order_column = User.name
        elif sort_by == "role":
            order_column = User.role
        else:
            order_column = User.created_at
            
        if order == "asc":
            query = query.order_by(order_column.asc())
        else:
            query = query.order_by(order_column.desc())
            
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": [{"id": u.id, "email": u.email, "name": u.name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at} for u in users]
        }

    @staticmethod
    def toggle_user_status(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.is_active = 0 if user.is_active == 1 else 1
        db.commit()
        return user

    @staticmethod
    def create_user(db: Session, new_user_data: UserCreateAdmin):
        user = db.query(User).filter(User.email == new_user_data.email).first()
        if user:
            return None, "Email already registered"
            
        password = secrets.token_urlsafe(8)
        new_user = User(
            name=new_user_data.name,
            email=new_user_data.email,
            hashed_password=get_password_hash(password),
            role=new_user_data.role,
            is_active=1
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send email
        html_content = f"""
        <h2>Xin chào {new_user.name},</h2>
        <p>Tài khoản của bạn trên hệ thống Quản lý Văn bản đã được tạo thành công.</p>
        <p><b>Email đăng nhập:</b> {new_user.email}</p>
        <p><b>Mật khẩu:</b> {password}</p>
        <p>Vui lòng đăng nhập và đổi mật khẩu trong lần đầu tiên sử dụng.</p>
        """
        send_email(new_user.email, "Tài khoản hệ thống đã được tạo", html_content)
        return new_user, None

    @staticmethod
    def get_documents(
        db: Session, skip: int = 0, limit: int = 50, search: Optional[str] = None, 
        document_type: Optional[str] = None, status: Optional[str] = None, 
        sort_by: str = "issue_date", order: str = "desc"
    ):
        query = db.query(Document)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Document.title.ilike(search_term),
                    Document.document_number.ilike(search_term)
                )
            )
            
        if document_type:
            query = query.filter(Document.document_type == document_type)
            
        if status:
            query = query.filter(Document.status == status)
            
        if sort_by == "title":
            order_column = Document.title
        elif sort_by == "document_number":
            order_column = Document.document_number
        else:
            order_column = Document.issue_date
            
        if order == "asc":
            query = query.order_by(order_column.asc())
        else:
            query = query.order_by(order_column.desc())
            
        total = query.count()
        docs = query.offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": [{"id": d.id, "document_number": d.document_number, "title": d.title, "issue_date": str(d.issue_date) if d.issue_date else None, "status": d.status, "document_type": d.document_type, "origin_url": d.origin_url} for d in docs]
        }

    @staticmethod
    def get_documents_filters(db: Session):
        types = db.query(Document.document_type).filter(Document.document_type != None, Document.document_type != "").distinct().all()
        statuses = db.query(Document.status).filter(Document.status != None, Document.status != "").distinct().all()
        return {
            "types": [t[0] for t in types],
            "statuses": [s[0] for s in statuses]
        }
