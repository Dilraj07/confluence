from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Blocker, Space, Meeting, Organization
from backend.app.schemas.entities import BlockerOut

router = APIRouter()

@router.get("", response_model=List[BlockerOut])
def list_blockers(
    space_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return []
    query = db.query(Blocker).filter(Blocker.organization_id == org.id)
    if space_id:
        query = query.filter(Blocker.space_id == space_id)
    if status:
        query = query.filter(Blocker.status == status)
    
    blockers = query.order_by(Blocker.created_at.desc()).all()
    out = []
    for b in blockers:
        space = db.query(Space).filter(Space.id == b.space_id).first()
        meeting = db.query(Meeting).filter(Meeting.id == b.meeting_id).first()
        out.append(BlockerOut(
            id=b.id,
            organization_id=b.organization_id,
            space_id=b.space_id,
            space_name=space.name if space else "Unknown",
            meeting_id=b.meeting_id,
            meeting_title=meeting.title if meeting else "Unknown",
            description=b.description,
            severity=b.severity,
            status=b.status,
            reported_by=b.reported_by,
            evidence_quote=b.evidence_quote,
            transcript_segment_id=b.transcript_segment_id,
            created_at=b.created_at,
            resolved_at=b.resolved_at
        ))
    return out

