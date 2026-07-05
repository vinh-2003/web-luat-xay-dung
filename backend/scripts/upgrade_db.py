from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.database import Base
from app.models.user import User, ChatHistory, Bookmark
from app.models.document import Document, DocumentChunk

def upgrade():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS bookmarks CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS chat_history CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        conn.commit()
    print("Dropped users, chat_history, bookmarks.")
    
    # recreate missing tables
    Base.metadata.create_all(bind=engine)
    print("Recreated tables.")

if __name__ == "__main__":
    upgrade()
