from app.db.database import SessionLocal
from app.models.document import Document

db = SessionLocal()
docs = db.query(Document).all()
print(f"Total docs: {len(docs)}")
for d in docs:
    print(d.title, d.document_number, d.status)
db.close()
