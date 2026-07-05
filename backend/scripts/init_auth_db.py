from app.db.database import engine, Base
# Import all models so Base knows about them
from app.models.user import User, ChatHistory, Bookmark
from app.models.document import Document, DocumentChunk

def init_db():
    print("Dropping tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized.")

if __name__ == "__main__":
    init_db()
