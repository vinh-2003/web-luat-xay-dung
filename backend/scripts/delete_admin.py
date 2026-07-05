from app.db.database import SessionLocal
from app.models.user import User

db = SessionLocal()
db.query(User).filter_by(email='admin@example.com').delete()
db.commit()
print("Deleted admin user")
