import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    Integer,
    BigInteger,
    Numeric,
    Boolean,
    Table,
    Index
)
from sqlalchemy.orm import relationship
from backend.app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.utcnow()

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    spaces = relationship("Space", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    display_name = Column(String(255), nullable=False)
    role = Column(String(50), default="member", nullable=False)  # admin, lead, member, guest
    created_at = Column(DateTime, default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="users")
    memberships = relationship("SpaceMember", back_populates="user", cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="departments")
    spaces = relationship("Space", back_populates="department", cascade="all, delete-orphan")

class Space(Base):
    __tablename__ = "spaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    parent_space_id = Column(String(36), ForeignKey("spaces.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=True)
    space_type = Column(String(50), nullable=False, default="project")  # department, project, topic
    description = Column(Text, nullable=True)
    sensitivity_level = Column(String(50), default="internal", nullable=False)  # public, internal, confidential, restricted
    created_at = Column(DateTime, default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="spaces")
    department = relationship("Department", back_populates="spaces")
    parent_space = relationship("Space", remote_side=[id], backref="child_spaces")
    members = relationship("SpaceMember", back_populates="space", cascade="all, delete-orphan")
    meeting_links = relationship("MeetingSpace", back_populates="space", cascade="all, delete-orphan")

class SpaceMember(Base):
    __tablename__ = "space_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False, default="contributor")  # admin, contributor, viewer
    created_at = Column(DateTime, default=utc_now, nullable=False)

    space = relationship("Space", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    primary_space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    meeting_date = Column(DateTime, default=utc_now, nullable=False)
    source_type = Column(String(50), nullable=False, default="paste")  # upload, paste, calendar_sync
    source_filename = Column(String(255), nullable=True)
    created_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processing_status = Column(String(50), default="queued", nullable=False)  # queued, processing, completed, failed
    raw_transcript_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    primary_space = relationship("Space", foreign_keys=[primary_space_id])
    spaces = relationship("MeetingSpace", back_populates="meeting", cascade="all, delete-orphan")
    segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.segment_index")
    decisions = relationship("Decision", back_populates="meeting")
    tasks = relationship("Task", back_populates="meeting")
    blockers = relationship("Blocker", back_populates="meeting")

class MeetingSpace(Base):
    __tablename__ = "meeting_spaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False, default="primary")  # primary, linked
    created_at = Column(DateTime, default=utc_now, nullable=False)

    meeting = relationship("Meeting", back_populates="spaces")
    space = relationship("Space", back_populates="meeting_links")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    segment_index = Column(Integer, nullable=False)
    speaker_name = Column(String(255), nullable=True)
    speaker_role = Column(String(255), nullable=True)
    start_ms = Column(BigInteger, nullable=True)
    end_ms = Column(BigInteger, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    meeting = relationship("Meeting", back_populates="segments")
    evidence_items = relationship("Evidence", back_populates="segment")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    transcript_segment_id = Column(String(36), ForeignKey("transcript_segments.id", ondelete="CASCADE"), nullable=False)
    start_offset = Column(Integer, nullable=True)
    end_offset = Column(Integer, nullable=True)
    quote = Column(Text, nullable=False)
    speaker_name = Column(String(255), nullable=True)
    confidence_score = Column(Numeric(4, 2), default=1.0)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    segment = relationship("TranscriptSegment", back_populates="evidence_items")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    statement = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    decision_type = Column(String(50), default="architecture", nullable=True)  # architecture, product, organizational, process
    status = Column(String(50), default="proposed", nullable=False)  # proposed, active, superseded, disputed, completed, cancelled, rejected
    impact_level = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    confidence = Column(Numeric(4, 2), default=0.9)
    decided_by = Column(String(255), nullable=True)
    approved_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    meeting = relationship("Meeting", back_populates="decisions")
    space = relationship("Space")
    evidence_links = relationship("DecisionEvidence", back_populates="decision", cascade="all, delete-orphan")
    versions = relationship("DecisionVersion", back_populates="decision", cascade="all, delete-orphan", order_by="DecisionVersion.version_number")

class DecisionEvidence(Base):
    __tablename__ = "decision_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    decision_id = Column(String(36), ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)

    decision = relationship("Decision", back_populates="evidence_links")
    evidence = relationship("Evidence")

class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    decision_id = Column(String(36), ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    statement = Column(Text, nullable=False)
    status = Column(String(50), nullable=False)
    change_reason = Column(Text, nullable=True)
    source_meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    decision = relationship("Decision", back_populates="versions")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assignee_name = Column(String(255), nullable=True)
    status = Column(String(50), default="todo", nullable=False)  # todo, in_progress, blocked, done, cancelled
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, urgent
    due_date = Column(DateTime, nullable=True)
    evidence_quote = Column(Text, nullable=True)
    transcript_segment_id = Column(String(36), ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    meeting = relationship("Meeting", back_populates="tasks")
    space = relationship("Space")
    segment = relationship("TranscriptSegment")

class Blocker(Base):
    __tablename__ = "blockers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    status = Column(String(50), default="active", nullable=False)  # active, acknowledged, resolved
    reported_by = Column(String(255), nullable=True)
    evidence_quote = Column(Text, nullable=True)
    transcript_segment_id = Column(String(36), ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="blockers")
    space = relationship("Space")

class EntityRelationship(Base):
    __tablename__ = "entity_relationships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # decision, task, blocker, meeting
    source_id = Column(String(36), nullable=False)
    target_type = Column(String(50), nullable=False)  # decision, task, blocker, space
    target_id = Column(String(36), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # SUPERSEDES, DEPENDS_ON, BLOCKS, AFFECTS, RELATES_TO
    confidence_score = Column(Numeric(4, 2), default=0.85)
    status = Column(String(50), default="confirmed", nullable=False)  # proposed, confirmed, rejected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class ExtractionCandidate(Base):
    __tablename__ = "extraction_candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    candidate_type = Column(String(50), nullable=False)  # decision, task, blocker
    payload_json = Column(Text, nullable=False)  # Serialized JSON of candidate details
    confidence_score = Column(Numeric(4, 2), default=0.9)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), nullable=True)
    user_name = Column(String(255), default="System", nullable=False)
    action = Column(String(100), nullable=False)  # approve_decision, supersede_decision, create_meeting, etc.
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class OpenQuestion(Base):
    __tablename__ = "open_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    status = Column(String(50), default="open", nullable=False)
    source_meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="SET NULL"), nullable=True)
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    finding_type = Column(String(50), nullable=False)
    severity = Column(String(50), default="medium", nullable=False)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    confidence = Column(Numeric(4, 2), default=0.9)
    status = Column(String(50), default="confirmed", nullable=False)
    source_meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class FindingRecord(Base):
    __tablename__ = "finding_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False)
    record_type = Column(String(50), nullable=False)
    record_id = Column(String(36), nullable=False)
    relationship = Column(String(50), nullable=False)

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    requested_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(36), nullable=False)
    proposed_action = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    created_at = Column(DateTime, default=utc_now, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)

class EmbeddingRecord(Base):
    __tablename__ = "embedding_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False)  # transcript_segment, decision, task, blocker
    entity_id = Column(String(36), nullable=False, index=True)
    space_id = Column(String(36), nullable=True)
    text_content = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=False)  # JSON-serialized vector of floats
    dimensions = Column(Integer, nullable=False, default=384)
    model_name = Column(String(100), nullable=False, default="bge-small-en-v1.5")
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)



