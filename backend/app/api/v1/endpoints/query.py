from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Organization
from backend.app.schemas.entities import (
    AskQueryRequest,
    AskQueryResponse,
    ActionExecutionRequest,
    ActionExecutionResponse
)
from backend.app.services.query_service import QueryService

router = APIRouter()

@router.post("/ask", response_model=AskQueryResponse)
def ask_confluence(
    payload: AskQueryRequest,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized.")
    return QueryService.answer_query(db, org.id, payload)

@router.post("/execute-action", response_model=ActionExecutionResponse)
def execute_query_action(
    payload: ActionExecutionRequest,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized.")
    return QueryService.execute_action(db, org.id, payload)

