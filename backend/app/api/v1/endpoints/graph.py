from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Organization
from backend.app.schemas.entities import GraphData
from backend.app.services.integrity_service import IntegrityService

router = APIRouter()

@router.get("", response_model=GraphData)
def get_decision_graph(
    space_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return GraphData(nodes=[], edges=[])
    return IntegrityService.get_decision_network_graph(db, org.id, space_id)

@router.get("/metrics")
def get_metrics(
    space_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        return {
            "active_decisions": 0,
            "superseded_decisions": 0,
            "open_tasks": 0,
            "active_blockers": 0,
            "pending_reviews": 0,
            "cross_space_risks": 0
        }
    return IntegrityService.get_command_centre_summary(db, org.id, space_id)
