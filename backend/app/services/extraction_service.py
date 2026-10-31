import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Meeting,
    TranscriptSegment,
    ExtractionCandidate,
    Decision,
    DecisionEvidence,
    DecisionVersion,
    Task,
    Blocker,
    Evidence,
    AuditEvent
)

class ExtractionService:
    @staticmethod
    def validate_quote_in_segment(quote: str, segment_content: str) -> bool:
        """Checks if normalized quote exists in segment text."""
        norm_quote = " ".join(quote.lower().split())
        norm_content = " ".join(segment_content.lower().split())
        return norm_quote in norm_content

    @staticmethod
    def save_candidates(db: Session, meeting_id: str, candidates: List[Dict[str, Any]]) -> List[ExtractionCandidate]:
        created = []
        for cand in candidates:
            row = ExtractionCandidate(
                meeting_id=meeting_id,
                candidate_type=cand["candidate_type"],
                payload_json=json.dumps(cand["payload"]),
                confidence_score=cand.get("confidence_score", 0.9),
                status="pending"
            )
            db.add(row)
            created.append(row)
        db.commit()
        for r in created:
            db.refresh(r)
        return created

    @staticmethod
    def list_candidates(db: Session, meeting_id: str) -> List[ExtractionCandidate]:
        return db.query(ExtractionCandidate).filter(ExtractionCandidate.meeting_id == meeting_id).all()

    @staticmethod
    def review_candidate(
        db: Session,
        candidate_id: str,
        action: str,  # approve, reject
        edited_payload: Optional[Dict[str, Any]] = None,
        reviewer_name: str = "Lead Reviewer"
    ) -> Dict[str, Any]:
        candidate = db.query(ExtractionCandidate).filter(ExtractionCandidate.id == candidate_id).first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found")

        meeting = db.query(Meeting).filter(Meeting.id == candidate.meeting_id).first()
        if not meeting:
            raise ValueError(f"Meeting for candidate not found")

        if action == "reject":
            candidate.status = "rejected"
            db.commit()
            return {"status": "rejected", "candidate_id": candidate_id}

        # Otherwise approve
        candidate.status = "approved"
        payload = edited_payload if edited_payload else json.loads(candidate.payload_json)

        created_entity_id = None
        entity_type = candidate.candidate_type

        # 1. Resolve segment and evidence
        segment_id = payload.get("transcript_segment_id")
        quote = payload.get("evidence_quote") or payload.get("quote", "")

        # Find segment if needed
        segment = None
        if segment_id:
            segment = db.query(TranscriptSegment).filter(TranscriptSegment.id == segment_id).first()
        elif quote:
            # Try finding segment with quote
            candidate_segments = db.query(TranscriptSegment).filter(TranscriptSegment.meeting_id == meeting.id).all()
            for s in candidate_segments:
                if ExtractionService.validate_quote_in_segment(quote, s.content):
                    segment = s
                    segment_id = s.id
                    break

        evidence_row = None
        if segment and quote:
            evidence_row = Evidence(
                organization_id=meeting.organization_id,
                meeting_id=meeting.id,
                transcript_segment_id=segment.id,
                quote=quote,
                speaker_name=segment.speaker_name or payload.get("speaker_name"),
                confidence_score=candidate.confidence_score
            )
            db.add(evidence_row)
            db.flush()

        # 2. Persist canonical record
        target_space_id = payload.get("space_id") or meeting.primary_space_id

        if entity_type == "decision":
            decision = Decision(
                organization_id=meeting.organization_id,
                space_id=target_space_id,
                meeting_id=meeting.id,
                statement=payload.get("statement", ""),
                rationale=payload.get("rationale"),
                decision_type=payload.get("decision_type", "architecture"),
                status="active",
                impact_level=payload.get("impact_level", "medium"),
                confidence=candidate.confidence_score,
                decided_by=payload.get("decided_by", segment.speaker_name if segment else "Team"),
                approved_by=reviewer_name
            )
            db.add(decision)
            db.flush()
            created_entity_id = decision.id

            # Initial version
            version = DecisionVersion(
                decision_id=decision.id,
                version_number=1,
                statement=decision.statement,
                status="active",
                change_reason="Initial extracted decision approved",
                source_meeting_id=meeting.id,
                created_by=reviewer_name
            )
            db.add(version)

            if evidence_row:
                link = DecisionEvidence(
                    decision_id=decision.id,
                    evidence_id=evidence_row.id
                )
                db.add(link)

        elif entity_type == "task":
            task = Task(
                organization_id=meeting.organization_id,
                space_id=target_space_id,
                meeting_id=meeting.id,
                title=payload.get("title", ""),
                description=payload.get("description"),
                assignee_name=payload.get("assignee_name"),
                status="todo",
                priority=payload.get("priority", "medium"),
                evidence_quote=quote,
                transcript_segment_id=segment.id if segment else None
            )
            db.add(task)
            db.flush()
            created_entity_id = task.id

        elif entity_type == "blocker":
            blocker = Blocker(
                organization_id=meeting.organization_id,
                space_id=target_space_id,
                meeting_id=meeting.id,
                description=payload.get("description", ""),
                severity=payload.get("severity", "medium"),
                status="active",
                reported_by=payload.get("reported_by", segment.speaker_name if segment else None),
                evidence_quote=quote,
                transcript_segment_id=segment.id if segment else None
            )
            db.add(blocker)
            db.flush()
            created_entity_id = blocker.id

        # 3. Audit trail
        audit = AuditEvent(
            organization_id=meeting.organization_id,
            user_name=reviewer_name,
            action=f"approve_{entity_type}",
            entity_type=entity_type,
            entity_id=created_entity_id,
            details_json=json.dumps({"candidate_id": candidate_id, "payload": payload})
        )
        db.add(audit)
        db.commit()

        return {
            "status": "approved",
            "candidate_id": candidate_id,
            "entity_type": entity_type,
            "entity_id": created_entity_id
        }

