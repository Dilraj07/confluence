from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class SegmentBase(BaseModel):
    segment_index: int
    speaker_name: Optional[str] = "Speaker"
    speaker_role: Optional[str] = None
    start_ms: Optional[int] = None
    end_ms: Optional[int] = None
    content: str

class SegmentOut(SegmentBase):
    id: str
    meeting_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingCreate(BaseModel):
    title: str
    primary_space_id: str
    linked_space_ids: List[str] = []
    project_id: Optional[str] = None
    source_type: str = "paste"  # paste, upload
    transcript_text: str
    meeting_date: Optional[datetime] = None

class MeetingSpaceOut(BaseModel):
    space_id: str
    space_name: str
    relationship_type: str

class ConnectedMeetingOut(BaseModel):
    meeting_id: str
    title: str
    space_name: str
    meeting_date: datetime
    connection_type: str  # "supersedes", "superseded_by", "blocked_by", "blocks", "affects", "affected_by", "linked_space"
    reason: str

class MeetingOut(BaseModel):
    id: str
    organization_id: str
    primary_space_id: str
    primary_space_name: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    meeting_date: datetime
    source_type: str
    processing_status: str
    created_at: datetime
    segment_count: int = 0
    decision_count: int = 0
    task_count: int = 0
    blocker_count: int = 0
    spaces: List[MeetingSpaceOut] = []

    model_config = ConfigDict(from_attributes=True)

class MeetingDetailOut(MeetingOut):
    segments: List[SegmentOut] = []
    raw_transcript_text: Optional[str] = None
    decisions: List[Any] = []
    tasks: List[Any] = []
    blockers: List[Any] = []
    connected_meetings: List[ConnectedMeetingOut] = []
