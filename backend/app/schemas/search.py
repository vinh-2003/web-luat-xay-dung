from pydantic import BaseModel
from typing import List, Optional

class SearchFiltersResponse(BaseModel):
    doc_types: List[str]
    statuses: List[str]
    issuing_bodies: List[str]

class SearchDocument(BaseModel):
    id: int
    number: Optional[str] = None
    title: Optional[str] = None
    date: str
    status: Optional[str] = None
    type: str
    signer: Optional[str] = None
    issuing_body: Optional[str] = None
    origin_url: Optional[str] = None

class PaginationData(BaseModel):
    page: int
    page_size: int
    total_records: int
    total_pages: int

class SearchResponse(BaseModel):
    data: List[SearchDocument]
    pagination: PaginationData
    message: str
