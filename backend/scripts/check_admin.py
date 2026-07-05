from app.db.database import SessionLocal
from app.models.user import User

db = SessionLocal()
u = db.query(User).filter_by(email='admin@example.com').first()
print('Hash:', u.hashed_password if u else 'Not found')
