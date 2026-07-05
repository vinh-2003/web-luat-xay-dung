from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.document import Document, DocumentChunk

def keep_5_docs():
    db = SessionLocal()
    try:
        # Get all document IDs
        docs = db.query(Document).order_by(Document.id).all()
        if len(docs) <= 5:
            print(f"Chỉ có {len(docs)} văn bản trong DB, không cần xóa.")
            return

        docs_to_keep = docs[:5]
        docs_to_delete = docs[5:]

        ids_to_keep = [d.id for d in docs_to_keep]
        ids_to_delete = [d.id for d in docs_to_delete]

        print(f"Sẽ giữ lại 5 văn bản: {ids_to_keep}")
        print(f"Sẽ xóa {len(ids_to_delete)} văn bản.")

        # Delete chunks for documents to delete
        deleted_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id.in_(ids_to_delete)).delete(synchronize_session=False)
        print(f"Đã xóa {deleted_chunks} chunks.")

        # Delete documents
        deleted_docs = db.query(Document).filter(Document.id.in_(ids_to_delete)).delete(synchronize_session=False)
        print(f"Đã xóa {deleted_docs} văn bản.")

        db.commit()
        print("Xóa thành công.")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    keep_5_docs()
