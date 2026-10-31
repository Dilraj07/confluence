import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import (
    Meeting,
    MeetingSpace,
    Organization,
    Space,
    TranscriptSegment,
    Decision,
    Task,
    Blocker,
    EntityRelationship
)
from backend.app.schemas.meetings import (
    MeetingCreate,
    MeetingOut,
    MeetingDetailOut,
    SegmentOut,
    ConnectedMeetingOut
)
from backend.app.schemas.entities import (
    ExtractionCandidateOut,
    CandidateReviewAction,
    DecisionOut,
    TaskOut,
    BlockerOut,
    EvidenceOut,
    DecisionVersionOut
)
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

    # 1. Decisions
    decisions_out = []
    for d in m.decisions:
        d_space = db.query(Space).filter(Space.id == d.space_id).first()
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

        superseded_by_rel = db.query(EntityRelationship).filter(
            EntityRelationship.target_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()

        supersedes_rel = db.query(EntityRelationship).filter(
            EntityRelationship.source_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()

        decisions_out.append(DecisionOut(
            id=d.id,
            organization_id=d.organization_id,
            space_id=d.space_id,
            space_name=d_space.name if d_space else "Unknown",
            meeting_id=d.meeting_id,
            meeting_title=m.title,
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

    # 2. Tasks
    tasks_out = []
    for t in m.tasks:
        t_space = db.query(Space).filter(Space.id == t.space_id).first()
        tasks_out.append(TaskOut(
            id=t.id,
            organization_id=t.organization_id,
            space_id=t.space_id,
            space_name=t_space.name if t_space else "Unknown",
            meeting_id=t.meeting_id,
            meeting_title=m.title,
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

    # 3. Blockers
    blockers_out = []
    for b in m.blockers:
        b_space = db.query(Space).filter(Space.id == b.space_id).first()
        blockers_out.append(BlockerOut(
            id=b.id,
            organization_id=b.organization_id,
            space_id=b.space_id,
            space_name=b_space.name if b_space else "Unknown",
            meeting_id=b.meeting_id,
            meeting_title=m.title,
            description=b.description,
            severity=b.severity,
            status=b.status,
            reported_by=b.reported_by,
            evidence_quote=b.evidence_quote,
            transcript_segment_id=b.transcript_segment_id,
            created_at=b.created_at,
            resolved_at=b.resolved_at
        ))

    # 4. Connected Meetings
    connected_meetings_out = []
    seen_conn_ids = set()

    # Trace decisions supersessions
    for d in m.decisions:
        # SUPERSEDES: This decision supersedes a prior decision in another meeting
        supersedes_rel = db.query(EntityRelationship).filter(
            EntityRelationship.source_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()
        if supersedes_rel:
            prior_d = db.query(Decision).filter(Decision.id == supersedes_rel.target_id).first()
            if prior_d and prior_d.meeting_id != m.id and prior_d.meeting_id not in seen_conn_ids:
                prior_m = db.query(Meeting).filter(Meeting.id == prior_d.meeting_id).first()
                if prior_m:
                    prior_s = db.query(Space).filter(Space.id == prior_m.primary_space_id).first()
                    connected_meetings_out.append(ConnectedMeetingOut(
                        meeting_id=prior_m.id,
                        title=prior_m.title,
                        space_name=prior_s.name if prior_s else "Space",
                        meeting_date=prior_m.meeting_date,
                        connection_type="supersedes",
                        reason=f"Supersedes prior architectural baseline: '{prior_d.statement[:65]}...'"
                    ))
                    seen_conn_ids.add(prior_m.id)

        # SUPERSEDED_BY: This decision was superseded by a newer decision in another meeting
        superseded_by_rel = db.query(EntityRelationship).filter(
            EntityRelationship.target_id == d.id,
            EntityRelationship.relationship_type == "SUPERSEDES"
        ).first()
        if superseded_by_rel:
            newer_d = db.query(Decision).filter(Decision.id == superseded_by_rel.source_id).first()
            if newer_d and newer_d.meeting_id != m.id and newer_d.meeting_id not in seen_conn_ids:
                newer_m = db.query(Meeting).filter(Meeting.id == newer_d.meeting_id).first()
                if newer_m:
                    newer_s = db.query(Space).filter(Space.id == newer_m.primary_space_id).first()
                    connected_meetings_out.append(ConnectedMeetingOut(
                        meeting_id=newer_m.id,
                        title=newer_m.title,
                        space_name=newer_s.name if newer_s else "Space",
                        meeting_date=newer_m.meeting_date,
                        connection_type="superseded_by",
                        reason=f"Superseded by newer decision: '{newer_d.statement[:65]}...'"
                    ))
                    seen_conn_ids.add(newer_m.id)

        # AFFECTS: This decision affects another decision/meeting
        affects_rel = db.query(EntityRelationship).filter(
            EntityRelationship.source_id == d.id,
            EntityRelationship.relationship_type == "AFFECTS"
        ).first()
        if affects_rel:
            tgt_d = db.query(Decision).filter(Decision.id == affects_rel.target_id).first()
            if tgt_d and tgt_d.meeting_id != m.id and tgt_d.meeting_id not in seen_conn_ids:
                tgt_m = db.query(Meeting).filter(Meeting.id == tgt_d.meeting_id).first()
                if tgt_m:
                    tgt_s = db.query(Space).filter(Space.id == tgt_m.primary_space_id).first()
                    connected_meetings_out.append(ConnectedMeetingOut(
                        meeting_id=tgt_m.id,
                        title=tgt_m.title,
                        space_name=tgt_s.name if tgt_s else "Space",
                        meeting_date=tgt_m.meeting_date,
                        connection_type="affects",
                        reason=f"Affects delivery schedule for: '{tgt_d.statement[:65]}...'"
                    ))
                    seen_conn_ids.add(tgt_m.id)

    # Trace blockers
    for b in m.blockers:
        block_rel = db.query(EntityRelationship).filter(
            EntityRelationship.source_id == b.id,
            EntityRelationship.relationship_type == "BLOCKS"
        ).first()
        if block_rel:
            tgt_t = db.query(Task).filter(Task.id == block_rel.target_id).first()
            if tgt_t and tgt_t.meeting_id != m.id and tgt_t.meeting_id not in seen_conn_ids:
                tgt_m = db.query(Meeting).filter(Meeting.id == tgt_t.meeting_id).first()
                if tgt_m:
                    tgt_s = db.query(Space).filter(Space.id == tgt_m.primary_space_id).first()
                    connected_meetings_out.append(ConnectedMeetingOut(
                        meeting_id=tgt_m.id,
                        title=tgt_m.title,
                        space_name=tgt_s.name if tgt_s else "Space",
                        meeting_date=tgt_m.meeting_date,
                        connection_type="blocks",
                        reason=f"Blocks engineering task: '{tgt_t.title[:65]}...'"
                    ))
                    seen_conn_ids.add(tgt_m.id)

    # Check tasks blocked by upstream blockers
    for t in m.tasks:
        blocked_rel = db.query(EntityRelationship).filter(
            EntityRelationship.target_id == t.id,
            EntityRelationship.relationship_type == "BLOCKS"
        ).first()
        if blocked_rel:
            src_b = db.query(Blocker).filter(Blocker.id == blocked_rel.source_id).first()
            if src_b and src_b.meeting_id != m.id and src_b.meeting_id not in seen_conn_ids:
                src_m = db.query(Meeting).filter(Meeting.id == src_b.meeting_id).first()
                if src_m:
                    src_s = db.query(Space).filter(Space.id == src_m.primary_space_id).first()
                    connected_meetings_out.append(ConnectedMeetingOut(
                        meeting_id=src_m.id,
                        title=src_m.title,
                        space_name=src_s.name if src_s else "Space",
                        meeting_date=src_m.meeting_date,
                        connection_type="blocked_by",
                        reason=f"Blocked by upstream blocker: '{src_b.description[:65]}...'"
                    ))
                    seen_conn_ids.add(src_m.id)

    # Linked spaces
    for ms in m.spaces:
        if ms.relationship_type == "linked":
            linked_m = db.query(Meeting).filter(
                Meeting.primary_space_id == ms.space_id,
                Meeting.id != m.id
            ).order_by(Meeting.meeting_date.desc()).first()
            if linked_m and linked_m.id not in seen_conn_ids:
                linked_s = db.query(Space).filter(Space.id == linked_m.primary_space_id).first()
                connected_meetings_out.append(ConnectedMeetingOut(
                    meeting_id=linked_m.id,
                    title=linked_m.title,
                    space_name=linked_s.name if linked_s else "Space",
                    meeting_date=linked_m.meeting_date,
                    connection_type="linked_space",
                    reason=f"Shared project context with {linked_s.name if linked_s else 'Space'}"
                ))
                seen_conn_ids.add(linked_m.id)

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
        decisions=decisions_out,
        tasks=tasks_out,
        blockers=blockers_out,
        connected_meetings=connected_meetings_out,
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

