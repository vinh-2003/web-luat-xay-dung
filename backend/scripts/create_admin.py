from app.core.config import settings
from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin_user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
if not admin_user:
    print(f"Creating superuser {settings.FIRST_SUPERUSER_EMAIL}")
    try:
        hashed_pwd = get_password_hash(settings.FIRST_SUPERUSER_PASSWORD)
        print("Hash generated:", hashed_pwd)
        new_admin = User(
            email=settings.FIRST_SUPERUSER_EMAIL,
            name="Administrator",
            hashed_password=hashed_pwd,
            role="admin",
            is_active=1
        )
        db.add(new_admin)
        db.commit()
        print("Success")
    except Exception as e:
        print("Error:", e)
else:
    print("User already exists")
db.close()
