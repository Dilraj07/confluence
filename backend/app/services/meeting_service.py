import re
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import Meeting, MeetingSpace, TranscriptSegment, Space
from backend.app.schemas.meetings import MeetingCreate

class MeetingService:
    @staticmethod
    def parse_transcript_text(raw_text: str) -> List[dict]:
        """
        Parses transcript into individual speech turns or paragraphs.
        Supports:
        - [00:01:30] Jane Doe (Product Lead): Hello everyone...
        - Jane Doe: Hello everyone...
        - Plain paragraphs
        """
        lines = [line.strip() for line in raw_text.strip().split("\n") if line.strip()]
        segments = []
        current_segment = None
        seg_idx = 0

        # Pattern: [HH:MM:SS] Speaker (Role): Text or [MM:SS] Speaker: Text
        timestamp_pattern = re.compile(r"^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*([A-Za-z0-9\s\.\-_]+?)(?:\s*\((.*?)\))?:\s*(.*)$")
        simple_speaker_pattern = re.compile(r"^([A-Za-z0-9\s\.\-_]+?)(?:\s*\((.*?)\))?:\s*(.*)$")

        for line in lines:
            ts_match = timestamp_pattern.match(line)
            if ts_match:
                ts_str, speaker, role, content = ts_match.groups()
                start_ms = MeetingService._parse_time_to_ms(ts_str)
                segments.append({
                    "segment_index": seg_idx,
                    "speaker_name": speaker.strip(),
                    "speaker_role": role.strip() if role else None,
                    "start_ms": start_ms,
                    "end_ms": start_ms + 15000,  # default estimated span
                    "content": content.strip()
                })
                seg_idx += 1
                continue

            spk_match = simple_speaker_pattern.match(line)
            if spk_match and not line.lower().startswith("http"):
                speaker, role, content = spk_match.groups()
                start_ms = seg_idx * 20000  # 20s apart default
                segments.append({
                    "segment_index": seg_idx,
                    "speaker_name": speaker.strip(),
                    "speaker_role": role.strip() if role else None,
                    "start_ms": start_ms,
                    "end_ms": start_ms + 15000,
                    "content": content.strip()
                })
                seg_idx += 1
                continue

            # Fallback paragraph
            start_ms = seg_idx * 20000
            segments.append({
                "segment_index": seg_idx,
                "speaker_name": "Speaker",
                "speaker_role": None,
                "start_ms": start_ms,
                "end_ms": start_ms + 15000,
                "content": line
            })
            seg_idx += 1

        return segments

    @staticmethod
    def _parse_time_to_ms(time_str: str) -> int:
        parts = time_str.split(":")
        try:
            if len(parts) == 2:
                m, s = map(int, parts)
                return (m * 60 + s) * 1000
            elif len(parts) == 3:
                h, m, s = map(int, parts)
                return (h * 3600 + m * 60 + s) * 1000
        except Exception:
            return 0
        return 0

    @staticmethod
    def create_meeting(db: Session, organization_id: str, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(
            organization_id=organization_id,
            primary_space_id=payload.primary_space_id,
            project_id=payload.project_id,
            title=payload.title,
            meeting_date=payload.meeting_date or datetime.utcnow(),
            source_type=payload.source_type,
            raw_transcript_text=payload.transcript_text,
            processing_status="queued"
        )
        db.add(meeting)
        db.flush()

        # Add primary space
        primary_link = MeetingSpace(
            meeting_id=meeting.id,
            space_id=payload.primary_space_id,
            relationship_type="primary"
        )
        db.add(primary_link)

        # Add secondary linked spaces
        for linked_id in payload.linked_space_ids:
            if linked_id != payload.primary_space_id:
                link = MeetingSpace(
                    meeting_id=meeting.id,
                    space_id=linked_id,
                    relationship_type="linked"
                )
                db.add(link)

        # Parse & insert segments
        parsed_segments = MeetingService.parse_transcript_text(payload.transcript_text)
        for seg in parsed_segments:
            segment_row = TranscriptSegment(
                meeting_id=meeting.id,
                segment_index=seg["segment_index"],
                speaker_name=seg["speaker_name"],
                speaker_role=seg["speaker_role"],
                start_ms=seg["start_ms"],
                end_ms=seg["end_ms"],
                content=seg["content"]
            )
            db.add(segment_row)

        db.commit()
        db.refresh(meeting)
        return meeting

    @staticmethod
    def get_meeting(db: Session, meeting_id: str) -> Optional[Meeting]:
        return db.query(Meeting).filter(Meeting.id == meeting_id).first()

    @staticmethod
    def list_meetings(db: Session, organization_id: str, space_id: Optional[str] = None) -> List[Meeting]:
        query = db.query(Meeting).filter(Meeting.organization_id == organization_id)
        if space_id:
            query = query.join(MeetingSpace).filter(MeetingSpace.space_id == space_id)
        return query.order_by(Meeting.meeting_date.desc()).all()
