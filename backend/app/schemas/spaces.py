from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SpaceBase(BaseModel):
    name: str
    slug: str
    space_type: str = "project"  # department, project, topic
    description: Optional[str] = None
    sensitivity_level: str = "internal"

class SpaceCreate(BaseModel):
    name: str
    department_id: Optional[str] = None
    parent_space_id: Optional[str] = None
    space_type: str = "project"
    description: Optional[str] = None
    sensitivity_level: str = "internal"

class SpaceMemberOut(BaseModel):
    id: str
    user_id: str
    display_name: str
    email: str
    role: str

class SpaceOut(SpaceBase):
    id: str
    organization_id: str
    department_id: Optional[str] = None
    parent_space_id: Optional[str] = None
    created_at: datetime
    member_count: int = 0
    decision_count: int = 0
    task_count: int = 0
    blocker_count: int = 0

    class Config:
        from_attributes = True

class DepartmentOut(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    spaces: List[SpaceOut] = []

    class Config:
        from_attributes = True
