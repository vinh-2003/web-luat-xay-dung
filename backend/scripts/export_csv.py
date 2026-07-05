import csv
from app.db.database import SessionLocal
from app.models.document import Document

db = SessionLocal()
docs = db.query(Document).all()

with open("c:/Users/Admin/Downloads/documents.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "document_number", "title", "issue_date", "effective_date", "status", "document_type", "signer", "issuing_body", "origin_url"])
    for d in docs:
        writer.writerow([d.id, d.document_number, d.title, d.issue_date, d.effective_date, d.status, d.document_type, d.signer, d.issuing_body, d.origin_url])
        print(f"{d.document_number} | {d.title} | {d.issue_date} | {d.status} | {d.document_type}")
print(f"Exported {len(docs)} documents to CSV.")
