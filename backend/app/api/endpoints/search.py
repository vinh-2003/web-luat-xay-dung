from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
import math
from app.db.database import get_db
from app.models.document import Document
from app.schemas.search import SearchFiltersResponse, SearchResponse

router = APIRouter()

@router.get("/filters", response_model=SearchFiltersResponse)
async def get_search_filters(db: Session = Depends(get_db)):
    """
    Lấy danh sách các giá trị độc nhất (distinct) cho các bộ lọc: Loại văn bản, Cơ quan ban hành, Trạng thái
    """
    doc_types = db.query(Document.document_type).distinct().filter(Document.document_type != None).all()
    statuses = db.query(Document.status).distinct().filter(Document.status != None).all()
    bodies = db.query(Document.issuing_body).distinct().filter(Document.issuing_body != None).all()
    
    return {
        "doc_types": [t[0] for t in doc_types if t[0] and t[0] != "N/A"],
        "statuses": [s[0] for s in statuses if s[0] and s[0] != "N/A"],
        "issuing_bodies": [b[0] for b in bodies if b[0] and b[0] != "N/A"]
    }

@router.get("/", response_model=SearchResponse)
async def search_documents(
    query: str = None, 
    doc_type: str = None, 
    status_filter: str = None, 
    issuing_body: str = None,
    issue_date_from: str = None,
    issue_date_to: str = None,
    effective_date_from: str = None,
    effective_date_to: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = "relevance",
    db: Session = Depends(get_db)
):
    """
    Tìm kiếm văn bản truyền thống (Full-text) và lọc theo tiêu chí, có phân trang và sắp xếp.
    """
    db_query = db.query(Document)
    
    if query:
        db_query = db_query.filter(
            Document.title.ilike(f"%{query}%") | 
            Document.document_number.ilike(f"%{query}%") |
            Document.content.ilike(f"%{query}%")
        )
        
    if doc_type:
        types = [t.strip() for t in doc_type.split(',') if t.strip()]
        if types:
            db_query = db_query.filter(Document.document_type.in_(types) | Document.document_type.ilike(f"%{types[0]}%"))
            
    if status_filter:
        statuses = [s.strip().lower() for s in status_filter.split(',') if s.strip()]
        if statuses and "all" not in statuses:
            db_query = db_query.filter(or_(*[Document.status.ilike(f"%{s}%") for s in statuses]))
            
    if issuing_body:
        bodies = [b.strip() for b in issuing_body.split(',') if b.strip()]
        if bodies:
            db_query = db_query.filter(or_(*[Document.issuing_body.ilike(f"%{b}%") for b in bodies]))
            
    from sqlalchemy import cast, Date
    
    if issue_date_from:
        db_query = db_query.filter(Document.issue_date >= cast(issue_date_from, Date))
    if issue_date_to:
        db_query = db_query.filter(Document.issue_date <= cast(issue_date_to, Date))
        
    if effective_date_from:
        db_query = db_query.filter(Document.effective_date >= cast(effective_date_from, Date))
    if effective_date_to:
        db_query = db_query.filter(Document.effective_date <= cast(effective_date_to, Date))
        
    # Sắp xếp (Sorting) via SQL
    if sort_by == "issue_date_desc":
        db_query = db_query.order_by(desc(Document.issue_date))
    elif sort_by == "issue_date_asc":
        db_query = db_query.order_by(asc(Document.issue_date))
    elif sort_by == "effective_date_desc":
        db_query = db_query.order_by(desc(Document.effective_date))
    elif sort_by == "relevance" and not query:
        # Nếu sort relevance nhưng không có query thì mặc định sort theo ngày ban hành mới nhất
        db_query = db_query.order_by(desc(Document.issue_date))

    # Tính toán tổng số trang
    total_records = db_query.count()
    total_pages = math.ceil(total_records / page_size)
    
    # Lấy dữ liệu phân trang
    offset = (page - 1) * page_size
    docs = db_query.offset(offset).limit(page_size).all()
    
    if query and sort_by == "relevance":
        # Tự sort trên backend: Ưu tiên title matching query (Trọng số 2) hơn content matching query (Trọng số 1)
        query_lower = query.lower()
        docs.sort(key=lambda d: 2 if query_lower in (d.title or "").lower() or query_lower in (d.document_number or "").lower() else 1, reverse=True)

    result = []
    for doc in docs:
        result.append({
            "id": doc.id,
            "number": doc.document_number,
            "title": doc.title,
            "date": doc.issue_date.strftime("%d/%m/%Y") if doc.issue_date else "N/A",
            "status": doc.status,
            "type": doc.document_type or "Khác",
            "signer": doc.signer,
            "issuing_body": doc.issuing_body,
            "origin_url": doc.origin_url
        })
        
    return {
        "data": result, 
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages
        },
        "message": "Success"
    }
