from typing import Optional
from sqlalchemy.orm import Session
from app.crud.crud_base import CRUDBase
from app.models.document import Document
from app.schemas.document import DocumentUpdate

# Since DocumentCreate doesn't exist yet, we use a placeholder or generic dict
class CRUDDocument(CRUDBase[Document, dict, DocumentUpdate]):
    def get_by_document_number(self, db: Session, *, document_number: str) -> Optional[Document]:
        return db.query(Document).filter(Document.document_number == document_number).first()

    def update(self, db: Session, *, db_obj: Document, obj_in: DocumentUpdate) -> Document:
        update_data = obj_in.dict(exclude_unset=True)
        if "issue_date" in update_data and update_data["issue_date"] is not None:
            from datetime import datetime
            try:
                # Assuming string YYYY-MM-DD from schema
                update_data["issue_date"] = datetime.strptime(update_data["issue_date"], "%Y-%m-%d").date()
            except:
                del update_data["issue_date"] # Ignore invalid format
                
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def remove(self, db: Session, *, id: int) -> Document:
        # Custom remove to handle cascades if not configured at DB level
        from app.models.user import Bookmark
        from app.models.document import DocumentChunk
        
        db.query(Bookmark).filter(Bookmark.document_id == id).delete()
        db.query(DocumentChunk).filter(DocumentChunk.document_id == id).delete()
        
        return super().remove(db, id=id)

document = CRUDDocument(Document)
