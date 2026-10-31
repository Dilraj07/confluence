import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from scripts.seed_demo import run_seed

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_seed():
    run_seed()

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_list_spaces():
    res = client.get("/api/v1/spaces")
    assert res.status_code == 200
    spaces = res.json()
    assert len(spaces) >= 6
    names = [s["name"] for s in spaces]
    assert "Payments Platform" in names
    assert "Site Reliability Engineering" in names
    assert "Risk & Fraud" in names
    assert "Product & Strategy" in names

def test_metrics_summary():
    res = client.get("/api/v1/graph/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["active_decisions"] >= 5
    assert data["superseded_decisions"] >= 1
    assert data["cross_space_risks"] >= 1

def test_decision_network_graph():
    res = client.get("/api/v1/graph")
    assert res.status_code == 200
    graph = res.json()
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

    edge_types = [e["type"] for e in graph["edges"]]
    assert "SUPERSEDES" in edge_types
    assert "BLOCKS" in edge_types

def test_ask_cross_space_launch_risk():
    res = client.post("/api/v1/query/ask", json={
        "query": "Why was the Smart Routing rollout paused?",
        "scope": "organization"
    })
    assert res.status_code == 200
    ans = res.json()
    assert "paused" in ans["answer"].lower() or "timeout" in ans["answer"].lower()
    assert len(ans["sources"]) > 0
    assert ans["memory_scope_used"] == "organization"

def test_meeting_ingest_and_candidate_extraction():
    # Fetch Payments Platform space
    spaces = client.get("/api/v1/spaces").json()
    payments_space = next(s for s in spaces if s["name"] == "Payments Platform")

    # Ingest a new test meeting
    transcript = (
        "[00:01:00] Maya Chen (Lead): We decided we will enforce idempotency keys on all retry routes.\n"
        "[00:02:00] Elena Petrova: I will prepare the reconciliation script by Monday."
    )
    res = client.post("/api/v1/meetings", json={
        "title": "Idempotency and Reconciliation Architecture Extension",
        "primary_space_id": payments_space["id"],
        "source_type": "paste",
        "transcript_text": transcript
    })
    assert res.status_code == 200
    meeting = res.json()
    assert meeting["processing_status"] == "completed"

    # Check candidates extracted
    candidates_res = client.get(f"/api/v1/meetings/{meeting['id']}/candidates")
    assert candidates_res.status_code == 200
    candidates = candidates_res.json()
    assert len(candidates) >= 1

    # Approve first candidate
    first_cand = candidates[0]
    rev_res = client.post(
        f"/api/v1/meetings/{meeting['id']}/candidates/{first_cand['id']}/review",
        json={"action": "approve"}
    )
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "approved"

