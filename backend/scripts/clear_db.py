from app.db.database import SessionLocal
from app.models.document import Document

db = SessionLocal()
db.query(Document).delete()
db.commit()
db.close()
print('Cleared docs')
