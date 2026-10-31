import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Meeting, MeetingSpace, Organization, Space, TranscriptSegment
from backend.app.schemas.meetings import MeetingCreate, MeetingOut, MeetingDetailOut, SegmentOut
from backend.app.schemas.entities import ExtractionCandidateOut, CandidateReviewAction
from backend.app.services.meeting_service import MeetingService
from backend.app.services.extraction_service import ExtractionService
from backend.app.agents.meeting_analyst import MeetingAnalyst

router = APIRouter()

@router.get("", response_model=List[MeetingOut])
def list_meetings(
    space_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return []
    meetings = MeetingService.list_meetings(db, org.id, space_id)
    out = []
    for m in meetings:
        space = db.query(Space).filter(Space.id == m.primary_space_id).first()
        out.append(MeetingOut(
            id=m.id,
            organization_id=m.organization_id,
            primary_space_id=m.primary_space_id,
            primary_space_name=space.name if space else "Unknown",
            project_id=m.project_id,
            title=m.title,
            meeting_date=m.meeting_date,
            source_type=m.source_type,
            processing_status=m.processing_status,
            created_at=m.created_at,
            segment_count=len(m.segments),
            decision_count=len(m.decisions),
            task_count=len(m.tasks),
            blocker_count=len(m.blockers),
            spaces=[
                {"space_id": ms.space_id, "space_name": ms.space.name, "relationship_type": ms.relationship_type}
                for ms in m.spaces
            ]
        ))
    return out

@router.post("", response_model=MeetingOut)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized. Run seed first.")
    meeting = MeetingService.create_meeting(db, org.id, payload)
    
    # Automatically trigger analyst to extract candidates
    segments_dict = [
        {
            "id": s.id,
            "segment_index": s.segment_index,
            "speaker_name": s.speaker_name,
            "speaker_role": s.speaker_role,
            "content": s.content
        }
        for s in meeting.segments
    ]
    space = db.query(Space).filter(Space.id == meeting.primary_space_id).first()
    candidates = MeetingAnalyst.extract_candidates(
        transcript_text=payload.transcript_text,
        segments=segments_dict,
        space_name=space.name if space else "General"
    )
    ExtractionService.save_candidates(db, meeting.id, candidates)
    meeting.processing_status = "completed"
    db.commit()

    return MeetingOut(
        id=meeting.id,
        organization_id=meeting.organization_id,
        primary_space_id=meeting.primary_space_id,
        primary_space_name=space.name if space else "Unknown",
        project_id=meeting.project_id,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        source_type=meeting.source_type,
        processing_status=meeting.processing_status,
        created_at=meeting.created_at,
        segment_count=len(meeting.segments),
        decision_count=len(meeting.decisions),
        task_count=len(meeting.tasks),
        blocker_count=len(meeting.blockers),
        spaces=[]
    )

@router.get("/{meeting_id}", response_model=MeetingDetailOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    m = MeetingService.get_meeting(db, meeting_id)
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    space = db.query(Space).filter(Space.id == m.primary_space_id).first()
    
    segments_out = [
        SegmentOut(
            id=s.id,
            meeting_id=s.meeting_id,
            segment_index=s.segment_index,
            speaker_name=s.speaker_name,
            speaker_role=s.speaker_role,
            start_ms=s.start_ms,
            end_ms=s.end_ms,
            content=s.content,
            created_at=s.created_at
        )
        for s in m.segments
    ]

    return MeetingDetailOut(
        id=m.id,
        organization_id=m.organization_id,
        primary_space_id=m.primary_space_id,
        primary_space_name=space.name if space else "Unknown",
        project_id=m.project_id,
        title=m.title,
        meeting_date=m.meeting_date,
        source_type=m.source_type,
        processing_status=m.processing_status,
        created_at=m.created_at,
        segment_count=len(m.segments),
        decision_count=len(m.decisions),
        task_count=len(m.tasks),
        blocker_count=len(m.blockers),
        raw_transcript_text=m.raw_transcript_text,
        segments=segments_out,
        spaces=[
            {"space_id": ms.space_id, "space_name": ms.space.name, "relationship_type": ms.relationship_type}
            for ms in m.spaces
        ]
    )

@router.get("/{meeting_id}/candidates", response_model=List[ExtractionCandidateOut])
def list_candidates(meeting_id: str, db: Session = Depends(get_db)):
    candidates = ExtractionService.list_candidates(db, meeting_id)
    return [
        ExtractionCandidateOut(
            id=c.id,
            meeting_id=c.meeting_id,
            candidate_type=c.candidate_type,
            payload=json.loads(c.payload_json),
            confidence_score=float(c.confidence_score),
            status=c.status,
            reviewer_notes=c.reviewer_notes,
            created_at=c.created_at
        )
        for c in candidates
    ]

@router.post("/{meeting_id}/candidates/{candidate_id}/review")
def review_candidate(
    meeting_id: str,
    candidate_id: str,
    action_payload: CandidateReviewAction,
    db: Session = Depends(get_db)
):
    try:
        result = ExtractionService.review_candidate(
            db=db,
            candidate_id=candidate_id,
            action=action_payload.action,
            edited_payload=action_payload.edited_payload,
            reviewer_name="Engineering Lead"
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
