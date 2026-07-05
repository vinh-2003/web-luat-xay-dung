from app.db.database import engine, Base
from app.models.scraper import ScraperJob, ScraperSchedule

# Import other models if needed, but since we just need to create all registered models:
import app.models.scraper

def create_tables():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_tables()
