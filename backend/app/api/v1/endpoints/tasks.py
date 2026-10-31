from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Task, Space, Meeting, Organization
from backend.app.schemas.entities import TaskOut

router = APIRouter()

@router.get("", response_model=List[TaskOut])
def list_tasks(
    space_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return []
    query = db.query(Task).filter(Task.organization_id == org.id)
    if space_id:
        query = query.filter(Task.space_id == space_id)
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    out = []
    for t in tasks:
        space = db.query(Space).filter(Space.id == t.space_id).first()
        meeting = db.query(Meeting).filter(Meeting.id == t.meeting_id).first()
        out.append(TaskOut(
            id=t.id,
            organization_id=t.organization_id,
            space_id=t.space_id,
            space_name=space.name if space else "Unknown",
            meeting_id=t.meeting_id,
            meeting_title=meeting.title if meeting else "Unknown",
            title=t.title,
            description=t.description,
            assignee_name=t.assignee_name,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            evidence_quote=t.evidence_quote,
            transcript_segment_id=t.transcript_segment_id,
            created_at=t.created_at,
            updated_at=t.updated_at
        ))
    return out
