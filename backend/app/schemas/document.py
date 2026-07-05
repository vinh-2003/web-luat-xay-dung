from pydantic import BaseModel
from typing import Optional

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_number: Optional[str] = None
    document_type: Optional[str] = None
    status: Optional[str] = None
    issue_date: Optional[str] = None
