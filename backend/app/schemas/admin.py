from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreateAdmin(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"

class ScraperStartRequest(BaseModel):
    source: str
    mode: str
    timeout_minutes: int
    
class ScheduleCreate(BaseModel):
    cron_expression: str
    is_active: bool = True
