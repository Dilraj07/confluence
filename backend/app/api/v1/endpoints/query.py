from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Organization
from backend.app.schemas.entities import (
    AskQueryRequest,
    AskQueryResponse,
    ActionExecutionRequest,
    ActionExecutionResponse,
    SemanticSearchRequest,
    SemanticSearchResponse,
    SimilarityRequest,
    SimilarityResponse,
    AgentChatRequest,
    AgentChatResponse
)
from backend.app.services.query_service import QueryService
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.memory_service import MemoryService
from backend.app.agents.agentic_engine import AgenticEngine

router = APIRouter()

@router.post("/ask", response_model=AskQueryResponse)
def ask_confluence(
    payload: AskQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Main Agentic AI query endpoint.
    Processes natural-language queries through multi-hop hybrid retrieval,
    decision lineage tracing, evidence verification, and grounded synthesis.
    """
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized.")
    return QueryService.answer_query(db, org.id, payload)

@router.post("/execute-action", response_model=ActionExecutionResponse)
def execute_query_action(
    payload: ActionExecutionRequest,
    db: Session = Depends(get_db)
):
    """
    Executes a staged action (task creation, memory amendment, supersession confirmation).
    """
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized.")
    return QueryService.execute_action(db, org.id, payload)

@router.post("/semantic-search", response_model=SemanticSearchResponse)
def semantic_search(
    payload: SemanticSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Pure dense semantic similarity search over embedded entities and transcript segments.
    """
    matches = EmbeddingService.search_similar_records(
        db=db,
        query=payload.query,
        entity_types=payload.entity_types,
        space_id=payload.space_id,
        top_k=payload.top_k,
        min_score=payload.min_score
    )
    return SemanticSearchResponse(
        query=payload.query,
        count=len(matches),
        matches=matches
    )

@router.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(
    payload: SimilarityRequest
):
    """
    Computes dense vector cosine similarity between any two arbitrary statements.
    Useful for contradiction detection and policy alignment checks.
    """
    v1 = EmbeddingService.get_embedding(payload.text1)
    v2 = EmbeddingService.get_embedding(payload.text2)
    sim = EmbeddingService.cosine_similarity(v1, v2)

    interpretation = "unrelated"
    if sim >= 0.75:
        interpretation = "high_similarity"
    elif sim >= 0.55:
        interpretation = "related"
    elif sim <= 0.15:
        interpretation = "dissimilar"

    return SimilarityResponse(
        text1=payload.text1,
        text2=payload.text2,
        similarity=round(float(sim), 4),
        interpretation=interpretation
    )

@router.post("/sync-embeddings")
def sync_embeddings(
    force: bool = False,
    db: Session = Depends(get_db)
):
    """
    Re-synchronizes and embeds all transcript segments, decisions, tasks, and blockers.
    """
    counts = EmbeddingService.sync_all_embeddings(db=db, force=force)
    return {
        "status": "success",
        "synced": counts,
        "message": f"Successfully indexed embeddings for {sum(counts.values())} organizational entities."
    }

@router.post("/agent-chat", response_model=AgentChatResponse)
def agent_chat(
    payload: AgentChatRequest,
    db: Session = Depends(get_db)
):
    """
    Multi-turn Conversational Agent endpoint with working session memory.
    Maintains dialogue history and entity focus across conversational turns.
    """
    org = db.query(Organization).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not initialized.")

    # Retrieve session working memory
    session_memory = MemoryService.get_session_working_memory(payload.session_id)

    # Process through Agentic Engine
    query_payload = AskQueryRequest(
        query=payload.message,
        space_id=payload.space_id or session_memory.get("active_space_id"),
        scope=payload.scope
    )
    res = AgenticEngine.process_query(db, org.id, query_payload)

    # Update session working memory
    MemoryService.update_session_working_memory(
        session_id=payload.session_id,
        user_message=payload.message,
        assistant_message=res.answer,
        space_id=payload.space_id,
        entity_ids={
            "decisions": res.related_decision_ids,
            "tasks": res.related_task_ids,
            "blockers": res.related_blocker_ids
        },
        staged_action=res.proposed_action
    )

    updated_state = MemoryService.get_session_working_memory(payload.session_id)

    return AgentChatResponse(
        session_id=payload.session_id,
        answer=res.answer,
        confidence=res.confidence,
        reasoning_steps=res.reasoning_steps or [],
        sources=res.sources,
        working_memory_state=updated_state,
        staged_action=res.proposed_action
    )

@router.get("/memory/inspect")
def inspect_memory(
    query: str = Query(..., description="Concept or entity to recall"),
    space_id: Optional[str] = Query(None, description="Space ID filter"),
    db: Session = Depends(get_db)
):
    """
    Inspects Episodic, Semantic, and Contradiction Memory records for a given query concept.
    """
    episodic = MemoryService.recall_episodic_memory(db, query=query, space_ids=[space_id] if space_id else None, top_k=4)
    semantic = MemoryService.recall_semantic_memory(db, query=query, space_ids=[space_id] if space_id else None, top_k=4)
    contradictions = MemoryService.detect_semantic_contradictions_and_supersessions(db, new_statement=query, space_id=space_id, threshold=0.45)

    return {
        "query": query,
        "episodic_memory": episodic,
        "semantic_memory": semantic,
        "potential_contradictions_or_supersessions": contradictions
    }
