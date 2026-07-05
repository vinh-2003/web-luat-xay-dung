from sqlalchemy import Column, Integer, String, Text, Date, Boolean
from pgvector.sqlalchemy import Vector
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_number = Column(String, index=True, unique=True, nullable=False) # Số hiệu văn bản
    title = Column(Text, nullable=False) # Tên văn bản
    issue_date = Column(Date, nullable=True) # Ngày ban hành
    effective_date = Column(Date, nullable=True) # Ngày có hiệu lực
    status = Column(String, index=True, default="N/A") # Trạng thái (Còn hiệu lực, Hết hiệu lực...)
    document_type = Column(String, index=True, nullable=True) # Loại văn bản (Luật, Nghị định...)
    signer = Column(String, nullable=True) # Người ký
    issuing_body = Column(String, nullable=True) # Cơ quan ban hành
    content = Column(Text, nullable=False) # Nội dung toàn văn
    origin_url = Column(String, nullable=False) # URL nguồn gốc (vbpl.vn, moc.gov.vn)
    
    # Vector embedding cho nội dung (giả sử dùng model Gemini sinh ra vector 3072 chiều)
    embedding = Column(Vector(3072), nullable=True)

class DocumentChunk(Base):
    """
    Lưu trữ các đoạn nhỏ của văn bản (chunk) để phục vụ cho Semantic Search (RAG).
    Mỗi văn bản dài sẽ được chia nhỏ thành nhiều chunks.
    """
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(3072), nullable=True)
