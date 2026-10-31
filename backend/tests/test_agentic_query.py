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
    assert "paused at 5%" in data["answer"]
    assert "Timeout Ambiguity" in data["answer"]
    assert "Duplicate Authorisation Hazard" in data["answer"]
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
    assert "SUPERSEDED" in data["answer"]
    assert "14 November readiness review" in data["answer"]
    assert len(data["reasoning_steps"]) > 0

def test_agentic_search_prerequisites():
    res = client.post("/api/v1/query/ask", json={
        "query": "What must happen before we can expand to 20%?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Payments Platform" in data["answer"]
    assert "Risk & Fraud" in data["answer"]
    assert "Site Reliability Engineering" in data["answer"]
    assert "Security & Compliance" in data["answer"]

def test_agentic_search_blockers():
    res = client.post("/api/v1/query/ask", json={
        "query": "Find all blockers affecting the 14 November readiness review.",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Active launch blockers" in data["answer"]
    assert "Elena Petrova" in data["answer"] or "Daniel Foster" in data["answer"]
    assert "Priya Nair" in data["answer"]
    assert "Fatima Ali" in data["answer"] or "Omar Hassan" in data["answer"]
    assert "Sarah Kim" in data["answer"]
    assert len(data["related_blocker_ids"]) > 0

def test_agentic_search_priya_nair_latency():
    res = client.post("/api/v1/query/ask", json={
        "query": "What did Priya Nair say about canary latency thresholds?",
        "scope": "organization"
    })
    assert res.status_code == 200
    data = res.json()
    assert "650 ms" in data["answer"]
    assert "0.5%" in data["answer"]
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
    assert "Daniel Foster" in data["answer"]
    assert "idempotency key" in data["answer"].lower()

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

