import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import SessionLocal
from backend.app.services.embedding_service import EmbeddingService
from backend.app.services.memory_service import MemoryService
from backend.app.agents.memory_linker import MemoryLinker
from backend.app.models.entities import Space, Decision

client = TestClient(app)

def test_semantic_embedding_generation_and_cosine_similarity():
    v1 = EmbeddingService.get_embedding("Processor timeout causes payment ambiguity and double charges")
    v2 = EmbeddingService.get_embedding("Idempotency keys prevent duplicate transaction authorization upon timeout")
    v3 = EmbeddingService.get_embedding("The weather in London is quite rainy in November")

    sim_related = EmbeddingService.cosine_similarity(v1, v2)
    sim_unrelated = EmbeddingService.cosine_similarity(v1, v3)

    assert len(v1) == 384
    assert len(v2) == 384
    # Related concepts should score significantly higher than unrelated concepts
    assert sim_related > sim_unrelated
    assert sim_related > 0.40

def test_api_semantic_search():
    res = client.post("/api/v1/query/semantic-search", json={
        "query": "duplicate transaction charge hazard and timeout retry",
        "top_k": 4
    })
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    # Top match should have strong similarity
    top_match = data["matches"][0]
    assert top_match["similarity"] > 0.40
    assert any(term in top_match["text"].lower() for term in ["timeout", "processor", "idempotency", "charge"])

def test_api_similarity_endpoint():
    res = client.post("/api/v1/query/similarity", json={
        "text1": "Expand canary pilot to 20% after initial gate",
        "text2": "Replace 20% expansion with 14 November readiness review"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["similarity"] > 0.50
    assert data["interpretation"] in ["related", "high_similarity"]

def test_api_memory_inspect():
    res = client.get("/api/v1/query/memory/inspect?query=idempotency+keys+and+retry")
    assert res.status_code == 200
    data = res.json()
    assert "episodic_memory" in data
    assert "semantic_memory" in data
    assert len(data["episodic_memory"]) > 0 or len(data["semantic_memory"]) > 0

def test_api_agent_chat_multi_turn_working_memory():
    session_id = "test_user_session_101"

    # Turn 1: Ask about why rollout paused
    res1 = client.post("/api/v1/query/agent-chat", json={
        "session_id": session_id,
        "message": "Why was the Smart Routing rollout paused?"
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert "pause" in data1["answer"].lower() or "halt" in data1["answer"].lower() or "timeout" in data1["answer"].lower()
    assert len(data1["reasoning_steps"]) >= 4
    assert len(data1["working_memory_state"]["turns"]) == 1

    # Turn 2: Follow-up question in the same session
    res2 = client.post("/api/v1/query/agent-chat", json={
        "session_id": session_id,
        "message": "Who owns the launch blockers?"
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert "Elena Petrova" in data2["answer"] or "Priya Nair" in data2["answer"]
    # Working memory should retain both turns
    assert len(data2["working_memory_state"]["turns"]) == 2

def test_memory_linker_semantic_supersession():
    db = SessionLocal()
    try:
        # Find payments space
        space = db.query(Space).filter(Space.name.ilike("%Payments%")).first()
        if space:
            candidates = MemoryLinker.identify_supersession_candidates(
                db=db,
                new_statement="Carry the exact same idempotency key across all processor retry hops with 72h retention",
                space_id=space.id
            )
            assert len(candidates) > 0
            assert candidates[0]["proposed_relationship"] == "SUPERSEDES"
            assert candidates[0]["confidence_score"] >= 0.85
    finally:
        db.close()

