import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Decision,
    DecisionVersion,
    DecisionEvidence,
    Evidence,
    EntityRelationship,
    AuditEvent,
    Space,
    Meeting
)
from backend.app.schemas.entities import DecisionCreate

class DecisionService:
    @staticmethod
    def list_decisions(
        db: Session,
        organization_id: str,
        space_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Decision]:
        query = db.query(Decision).filter(Decision.organization_id == organization_id)
        if space_id:
            query = query.filter(Decision.space_id == space_id)
        if status:
            query = query.filter(Decision.status == status)
        return query.order_by(Decision.created_at.desc()).all()

    @staticmethod
    def get_decision(db: Session, decision_id: str) -> Optional[Decision]:
        return db.query(Decision).filter(Decision.id == decision_id).first()

    @staticmethod
    def supersede_decision(
        db: Session,
        new_decision_id: str,
        prior_decision_id: str,
        reason: str,
        user_name: str = "Lead Engineer"
    ) -> Dict[str, Any]:
        """
        Marks prior_decision as superseded, connects with relationship,
        increments version, and adds audit log.
        """
        prior_dec = db.query(Decision).filter(Decision.id == prior_decision_id).first()
        new_dec = db.query(Decision).filter(Decision.id == new_decision_id).first()
        if not prior_dec or not new_dec:
            raise ValueError("Both decisions must exist to supersede")

        # Update prior decision status
        prior_dec.status = "superseded"
        prior_dec.updated_at = datetime.utcnow()

        # Add version to prior decision
        next_ver = len(prior_dec.versions) + 1
        v_prior = DecisionVersion(
            decision_id=prior_dec.id,
            version_number=next_ver,
            statement=prior_dec.statement,
            status="superseded",
            change_reason=f"Superseded by decision {new_dec.id}: {reason}",
            created_by=user_name
        )
        db.add(v_prior)

        # Connect with entity relationship
        rel = EntityRelationship(
            organization_id=new_dec.organization_id,
            source_type="decision",
            source_id=new_dec.id,
            target_type="decision",
            target_id=prior_dec.id,
            relationship_type="SUPERSEDES",
            confidence_score=1.0,
            status="confirmed",
            notes=reason
        )
        db.add(rel)

        # Audit event
        audit = AuditEvent(
            organization_id=new_dec.organization_id,
            user_name=user_name,
            action="supersede_decision",
            entity_type="decision",
            entity_id=new_dec.id,
            details_json=json.dumps({
                "prior_decision_id": prior_dec.id,
                "new_decision_id": new_dec.id,
                "reason": reason
            })
        )
        db.add(audit)
        db.commit()

        return {
            "status": "success",
            "new_decision_id": new_dec.id,
            "prior_decision_id": prior_dec.id,
            "relationship": "SUPERSEDES"
        }
