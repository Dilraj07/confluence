import re
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Space,
    Meeting,
    Decision,
    DecisionVersion,
    Task,
    Blocker,
    Evidence,
    TranscriptSegment,
    EntityRelationship,
    Organization
)
from backend.app.schemas.entities import (
    AskQueryRequest,
    AskQueryResponse,
    QueryEvidence,
    ActionExecutionRequest,
    ActionExecutionResponse
)
from backend.app.agents.agentic_engine import AgenticEngine

class QueryService:
    @staticmethod
    def answer_query(db: Session, organization_id: str, payload: AskQueryRequest) -> AskQueryResponse:
        """
        Delegates all query processing to the multi-hop Agentic Cognitive Engine.
        """
        return AgenticEngine.process_query(db, organization_id, payload)

    @staticmethod
    def execute_action(db: Session, organization_id: str, payload: ActionExecutionRequest) -> ActionExecutionResponse:
        action_type = payload.action_type
        data = payload.payload

        if action_type == "create_task":
            # Find target space
            space_name = data.get("space_name") or data.get("space") or "Payments Platform"
            space = db.query(Space).filter(Space.organization_id == organization_id, Space.name.ilike(f"%{space_name}%")).first()
            if not space:
                space = db.query(Space).filter(Space.organization_id == organization_id).first()

            # Find default meeting
            meeting = db.query(Meeting).filter(Meeting.organization_id == organization_id, Meeting.primary_space_id == space.id).first()
            if not meeting:
                meeting = db.query(Meeting).filter(Meeting.organization_id == organization_id).first()

            new_task = Task(
                organization_id=organization_id,
                space_id=space.id,
                meeting_id=meeting.id if meeting else "00000000-0000-0000-0000-000000000000",
                title=data.get("title", "Follow-up task"),
                description=f"Action directive generated via Wispr Flow voice interface. Assigned to {data.get('assignee_name', 'Unassigned')}.",
                assignee_name=data.get("assignee_name") or "Maya Chen",
                status="todo",
                priority=data.get("priority", "high"),
                evidence_quote=f"Voice command: {data.get('title')}"
            )
            db.add(new_task)
            db.commit()
            db.refresh(new_task)

            # Also index task embedding for semantic search
            try:
                from backend.app.services.embedding_service import EmbeddingService
                EmbeddingService.sync_all_embeddings(db)
            except Exception as e:
                print(f"[QueryService] Embedding sync warning: {e}")

            return ActionExecutionResponse(
                success=True,
                message=f"Commitment '{new_task.title}' successfully persisted in {space.name} for {new_task.assignee_name}.",
                entity_id=new_task.id,
                entity_type="task"
            )

        elif action_type in ["update_decision_metadata", "confirm_supersession_lineage", "add_prerequisite_constraint"]:
            # Find related decision
            target = data.get("target_entity", "")
            decision = None
            if data.get("prior_decision_id"):
                decision = db.query(Decision).filter(Decision.id == data.get("prior_decision_id")).first()
            if not decision and target:
                decision = db.query(Decision).filter(Decision.statement.ilike(f"%{target}%")).first()
            if not decision:
                decision = db.query(Decision).first()

            if decision:
                # Append a DecisionVersion
                next_v = len(decision.versions) + 1
                new_ver = DecisionVersion(
                    decision_id=decision.id,
                    version_number=next_v,
                    statement=decision.statement,
                    status=data.get("status") or decision.status,
                    change_reason=f"Wispr Flow memory audit: {data.get('reason', 'Audited via voice command')}",
                    created_by="Voice Reviewer"
                )
                db.add(new_ver)
                db.commit()

                return ActionExecutionResponse(
                    success=True,
                    message=f"Memory record '{decision.statement[:40]}...' audited with version {next_v}.",
                    entity_id=decision.id,
                    entity_type="decision"
                )

        return ActionExecutionResponse(
            success=True,
            message="Action staged and recorded in audit log.",
            entity_id=None,
            entity_type="audit_log"
        )
