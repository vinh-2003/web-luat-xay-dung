import asyncio
import time
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.document import Document, DocumentChunk
from app.services.scraper import LuatXayDungScraper
from app.services.gemini import GeminiService

def re_embed():
    db = SessionLocal()
    scraper = LuatXayDungScraper()
    gemini_service = GeminiService()

    try:
        docs = db.query(Document).all()
        for doc in docs:
            print(f"Re-embedding văn bản: {doc.title} (ID: {doc.id})")
            # Xóa các chunks cũ
            deleted = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete(synchronize_session=False)
            print(f"  Đã xóa {deleted} chunks cũ.")
            
            # Tạo chunks mới
            if not doc.content:
                continue

            chunks = scraper._chunk_text(doc.content)
            for i, original_chunk_text in enumerate(chunks):
                chunk_text = f"[Văn bản: {doc.title}]\n[Số hiệu: {doc.document_number}]\n\n{original_chunk_text}"
                try:
                    embed_vector = gemini_service.generate_embedding(chunk_text)
                    chunk_obj = DocumentChunk(
                        document_id=doc.id,
                        chunk_text=chunk_text,
                        embedding=embed_vector
                    )
                    db.add(chunk_obj)
                    
                    # Ngủ 1 giây để tránh lỗi 429
                    time.sleep(1)
                except Exception as e:
                    print(f"  Lỗi sinh embedding chunk {i}: {e}")
            
            db.commit()
            print(f"  Đã sinh xong {len(chunks)} chunks mới.")
            
        print("Hoàn tất Re-embedding.")
    except Exception as e:
        print(f"Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    re_embed()
