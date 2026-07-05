from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    question: str
    history: List[Dict[str, Any]] = []
    session_id: Optional[int] = None
    
class ChatResponse(BaseModel):
    answer: str
    session_id: Optional[int] = None

class ChatMessageSchema(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionSchema(BaseModel):
    id: int
    title: str
    created_at: datetime
    
    class Config:
        from_attributes = True
