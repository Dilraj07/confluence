from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class EvidenceOut(BaseModel):
    id: str
    meeting_id: str
    transcript_segment_id: str
    quote: str
    speaker_name: Optional[str] = None
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None
    confidence_score: float = 1.0

    class Config:
        from_attributes = True

class DecisionVersionOut(BaseModel):
    id: str
    version_number: int
    statement: str
    status: str
    change_reason: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DecisionOut(BaseModel):
    id: str
    organization_id: str
    space_id: str
    space_name: Optional[str] = None
    meeting_id: str
    meeting_title: Optional[str] = None
    statement: str
    rationale: Optional[str] = None
    decision_type: str
    status: str  # proposed, active, superseded, disputed, completed, cancelled, rejected
    impact_level: str  # low, medium, high, critical
    confidence: float
    decided_by: Optional[str] = None
    approved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    evidence_items: List[EvidenceOut] = []
    versions: List[DecisionVersionOut] = []
    superseded_by_id: Optional[str] = None
    supersedes_id: Optional[str] = None

    class Config:
        from_attributes = True

class DecisionCreate(BaseModel):
    space_id: str
    meeting_id: str
    statement: str
    rationale: Optional[str] = None
    decision_type: str = "architecture"
    impact_level: str = "medium"
    decided_by: Optional[str] = None
    evidence_quote: Optional[str] = None
    transcript_segment_id: Optional[str] = None

class TaskOut(BaseModel):
    id: str
    organization_id: str
    space_id: str
    space_name: Optional[str] = None
    meeting_id: str
    meeting_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    assignee_name: Optional[str] = None
    status: str  # todo, in_progress, blocked, done, cancelled
    priority: str  # low, medium, high, urgent
    due_date: Optional[datetime] = None
    evidence_quote: Optional[str] = None
    transcript_segment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    space_id: str
    meeting_id: str
    title: str
    description: Optional[str] = None
    assignee_name: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    evidence_quote: Optional[str] = None
    transcript_segment_id: Optional[str] = None

class BlockerOut(BaseModel):
    id: str
    organization_id: str
    space_id: str
    space_name: Optional[str] = None
    meeting_id: str
    meeting_title: Optional[str] = None
    description: str
    severity: str  # low, medium, high, critical
    status: str  # active, acknowledged, resolved
    reported_by: Optional[str] = None
    evidence_quote: Optional[str] = None
    transcript_segment_id: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExtractionCandidateOut(BaseModel):
    id: str
    meeting_id: str
    candidate_type: str  # decision, task, blocker
    payload: Dict[str, Any]
    confidence_score: float
    status: str  # pending, approved, rejected
    reviewer_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateReviewAction(BaseModel):
    action: str  # approve, reject, edit
    edited_payload: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

# Graph schemas
class GraphNode(BaseModel):
    id: str
    type: str  # space, meeting, decision, task, blocker
    label: str
    subtext: Optional[str] = None
    status: Optional[str] = None
    space_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # SUPERSEDES, DEPENDS_ON, BLOCKS, AFFECTS, CONTAINS, DECIDED_IN
    label: Optional[str] = None
    confidence: Optional[float] = None

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Query Schemas
class AskQueryRequest(BaseModel):
    query: str
    space_id: Optional[str] = None
    scope: str = "local"  # local, shared, organization

class QueryEvidence(BaseModel):
    meeting_title: str
    space_name: str
    quote: str
    speaker: Optional[str] = None
    segment_id: str
    timestamp: Optional[str] = None

class AskQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    memory_scope_used: str
    sources: List[QueryEvidence]
    impact_summary: Optional[str] = None
    related_decision_ids: List[str] = []
