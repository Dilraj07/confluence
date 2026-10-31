import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_agentic_search_why_paused():
    res = client.post("/api/v1/query/ask", json={
        "query": "Why was the Smart Routing rollout paused?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "search"
    ans_lower = data["answer"].lower()
    assert ("pause" in ans_lower or "halt" in ans_lower or "timeout" in ans_lower)
    assert "timeout" in ans_lower
    assert "duplicate" in ans_lower or "hazard" in ans_lower or "ambiguity" in ans_lower or "retried" in ans_lower
    assert len(data["sources"]) > 0
    assert len(data["reasoning_steps"]) >= 4
    step_names = [s["step"] for s in data["reasoning_steps"]]
    assert "Context Router" in step_names
    assert "Multi-Hop Entity Retrieval" in step_names
    assert "Lineage & Dependency Trace" in step_names
    assert "Grounded Synthesis" in step_names

def test_agentic_search_supersession():
    res = client.post("/api/v1/query/ask", json={
        "query": "What changed from the original rollout plan?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    ans_lower = data["answer"].lower()
    assert "supersed" in ans_lower or "replaced" in ans_lower or "change" in ans_lower
    assert "14 november" in ans_lower or "readiness" in ans_lower or "gate" in ans_lower
    assert len(data["reasoning_steps"]) > 0

def test_agentic_search_prerequisites():
    res = client.post("/api/v1/query/ask", json={
        "query": "What must happen before we can expand to 20%?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    ans_lower = data["answer"].lower()
    assert "payments" in ans_lower
    assert "risk" in ans_lower or "fraud" in ans_lower
    assert "reliability" in ans_lower or "sre" in ans_lower

def test_agentic_search_blockers():
    res = client.post("/api/v1/query/ask", json={
        "query": "Find all blockers affecting the 14 November readiness review.",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    ans_lower = data["answer"].lower()
    assert "blocker" in ans_lower or "launch" in ans_lower
    assert "elena petrova" in ans_lower or "daniel foster" in ans_lower or "priya nair" in ans_lower
    assert "sarah kim" in ans_lower or "fatima ali" in ans_lower or "omar hassan" in ans_lower
    assert len(data["related_blocker_ids"]) > 0

def test_agentic_search_priya_nair_latency():
    res = client.post("/api/v1/query/ask", json={
        "query": "What did Priya Nair say about canary latency thresholds?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "650" in data["answer"]
    assert "0.5" in data["answer"]
    assert "Priya Nair" in data["answer"]

def test_agentic_search_fatima_ali_fraud():
    res = client.post("/api/v1/query/ask", json={
        "query": "What did Fatima Ali report about fraud controls?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Fatima Ali" in data["answer"]
    assert "fail safely" in data["answer"].lower()

def test_agentic_search_idempotency_elena():
    res = client.post("/api/v1/query/ask", json={
        "query": "Who is working on idempotency keys?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Elena Petrova" in data["answer"]
    assert "idempotency" in data["answer"].lower()

def test_mode_b_task_creation_and_execution():
    res = client.post("/api/v1/query/ask", json={
        "query": "Create a follow-up task for Daniel Foster to verify idempotent failover retry logic.",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "task_command"
    assert data["proposed_action"] is not None
    pa = data["proposed_action"]
    assert pa["type"] == "create_task"
    assert "verify idempotent failover retry logic" in pa["title"].lower()
    assert pa["assignee_name"] == "Daniel Foster"
    assert pa["space_name"] == "Payments Platform"

    # Now execute the proposed action to persist it
    exec_res = client.post("/api/v1/query/execute-action", json={
        "action_type": pa["type"],
        "payload": pa
    })
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["success"] is True
    assert exec_data["entity_type"] == "task"
    assert exec_data["entity_id"] is not None

def test_mode_c_memory_correction_and_execution():
    res = client.post("/api/v1/query/ask", json={
        "query": "The 20% pilot expansion was superseded, not approved.",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "memory_correction"
    assert data["proposed_action"] is not None
    pa = data["proposed_action"]

    # Execute action to record audit
    exec_res = client.post("/api/v1/query/execute-action", json={
        "action_type": pa["type"],
        "payload": pa
    })
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["success"] is True

