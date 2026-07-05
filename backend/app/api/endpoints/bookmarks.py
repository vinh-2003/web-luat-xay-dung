from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from app.db.database import get_db
from app.models.user import Bookmark, User
from app.models.document import Document
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/")
def get_bookmarks(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Lấy danh sách các tài liệu đã lưu của người dùng hiện tại."""
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).order_by(Bookmark.created_at.desc()).all()
    
    docs = []
    for b in bookmarks:
        doc = db.query(Document).filter(Document.id == b.document_id).first()
        if doc:
            docs.append({
                "id": doc.id,
                "number": doc.document_number,
                "title": doc.title,
                "date": doc.issue_date.strftime("%d/%m/%Y") if doc.issue_date else "N/A",
                "status": doc.status,
                "type": doc.document_type or "Khác",
                "signer": doc.signer,
                "issuing_body": doc.issuing_body,
                "origin_url": doc.origin_url,
                "bookmarked_at": b.created_at
            })
            
    return {"data": docs, "message": "Success"}

@router.get("/ids")
def get_bookmarked_ids(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Lấy danh sách ID của các tài liệu đã lưu (để frontend dùng cho việc đồng bộ UI)."""
    bookmarks = db.query(Bookmark.document_id).filter(Bookmark.user_id == current_user.id).all()
    ids = [b[0] for b in bookmarks]
    return {"data": ids, "message": "Success"}

@router.post("/{document_id}")
def toggle_bookmark(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Thêm hoặc xóa đánh dấu một văn bản (Toggle)."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    existing_bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.document_id == document_id
    ).first()
    
    if existing_bookmark:
        # Xóa đánh dấu
        db.delete(existing_bookmark)
        db.commit()
        return {"bookmarked": False, "message": "Đã bỏ lưu văn bản"}
    else:
        # Thêm đánh dấu
        new_bookmark = Bookmark(user_id=current_user.id, document_id=document_id)
        db.add(new_bookmark)
        db.commit()
        return {"bookmarked": True, "message": "Đã lưu văn bản"}
