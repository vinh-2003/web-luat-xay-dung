from app.db.database import engine, Base
from app.models.document import Document, DocumentChunk

print("Dropping tables...")
Base.metadata.drop_all(bind=engine)
print("Creating tables with 3072 dimensions...")
Base.metadata.create_all(bind=engine)
print("Done.")
