import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine, Base
from app.models.document import Document, DocumentChunk
from app.models.user import User

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset successful.")

if __name__ == "__main__":
    reset_db()
