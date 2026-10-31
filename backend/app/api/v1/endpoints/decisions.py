from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.db.session import get_db
from backend.app.models.entities import Decision, Space, Meeting, Organization, EntityRelationship
from backend.app.schemas.entities import DecisionOut, EvidenceOut, DecisionVersionOut
from backend.app.services.decision_service import DecisionService

router = APIRouter()

class SupersedeRequest(BaseModel):
    prior_decision_id: str
    reason: str

@router.get("", response_model=List[DecisionOut])
def list_decisions(
    space_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return []
    decisions = DecisionService.list_decisions(db, org.id, space_id, status)
    out = []
    for d in decisions:
        space = db.query(Space).filter(Space.id == d.space_id).first()
        meeting = db.query(Meeting).filter(Meeting.id == d.meeting_id).first()

        # Check supersession links
        superseded_by_rel = db.query(EntityRelationship).filter(
            EntityRelationship.target_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()

        supersedes_rel = db.query(EntityRelationship).filter(
            EntityRelationship.source_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()

        ev_list = []
        for dl in d.evidence_links:
            ev = dl.evidence
            ev_list.append(EvidenceOut(
                id=ev.id,
                meeting_id=ev.meeting_id,
                transcript_segment_id=ev.transcript_segment_id,
                quote=ev.quote,
                speaker_name=ev.speaker_name,
                start_offset=ev.start_offset,
                end_offset=ev.end_offset,
                confidence_score=float(ev.confidence_score) if ev.confidence_score else 1.0
            ))

        versions_out = [
            DecisionVersionOut(
                id=v.id,
                version_number=v.version_number,
                statement=v.statement,
                status=v.status,
                change_reason=v.change_reason,
                created_by=v.created_by,
                created_at=v.created_at
            )
            for v in d.versions
        ]

        out.append(DecisionOut(
            id=d.id,
            organization_id=d.organization_id,
            space_id=d.space_id,
            space_name=space.name if space else "Unknown",
            meeting_id=d.meeting_id,
            meeting_title=meeting.title if meeting else "Unknown",
            statement=d.statement,
            rationale=d.rationale,
            decision_type=d.decision_type or "architecture",
            status=d.status,
            impact_level=d.impact_level,
            confidence=float(d.confidence) if d.confidence else 0.9,
            decided_by=d.decided_by,
            approved_by=d.approved_by,
            created_at=d.created_at,
            updated_at=d.updated_at,
            evidence_items=ev_list,
            versions=versions_out,
            superseded_by_id=superseded_by_rel.source_id if superseded_by_rel else None,
            supersedes_id=supersedes_rel.target_id if supersedes_rel else None
        ))
    return out

@router.post("/{decision_id}/supersede")
def supersede_decision(
    decision_id: str,
    payload: SupersedeRequest,
    db: Session = Depends(get_db)
):
    try:
        res = DecisionService.supersede_decision(
            db=db,
            new_decision_id=decision_id,
            prior_decision_id=payload.prior_decision_id,
            reason=payload.reason
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
