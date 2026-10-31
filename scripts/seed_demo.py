import os
import sys
from datetime import datetime, timedelta

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.session import SessionLocal, engine
from backend.app.db.base import Base
from backend.app.models.entities import (
    Organization,
    Department,
    Space,
    User,
    SpaceMember,
    Meeting,
    MeetingSpace,
    TranscriptSegment,
    Decision,
    DecisionEvidence,
    DecisionVersion,
    Task,
    Blocker,
    Evidence,
    EntityRelationship,
    ExtractionCandidate,
    AuditEvent
)
from backend.app.services.meeting_service import MeetingService

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_org = db.query(Organization).filter(Organization.slug == "acme-corp").first()
        if existing_org:
            print("Database already contains seed data.")
            return

        print("Seeding CONFLUENCE demonstration environment...")

        # 1. Organization
        org = Organization(
            name="Acme Cloud Technologies",
            slug="acme-corp"
        )
        db.add(org)
        db.flush()

        # 2. Departments
        eng_dept = Department(
            organization_id=org.id,
            name="Engineering",
            slug="engineering",
            description="Core infrastructure and product engineering teams."
        )
        hr_dept = Department(
            organization_id=org.id,
            name="Human Resources",
            slug="hr",
            description="Talent acquisition, operations, and people partner teams."
        )
        prod_dept = Department(
            organization_id=org.id,
            name="Product",
            slug="product",
            description="Product management, design, and strategic roadmaps."
        )
        db.add_all([eng_dept, hr_dept, prod_dept])
        db.flush()

        # 3. Spaces
        backend_space = Space(
            organization_id=org.id,
            department_id=eng_dept.id,
            name="Backend",
            slug="engineering-backend",
            space_type="project",
            description="Backend architecture, APIs, data storage, and microservices.",
            sensitivity_level="internal"
        )
        recruitment_space = Space(
            organization_id=org.id,
            department_id=hr_dept.id,
            name="Recruitment",
            slug="hr-recruitment",
            space_type="department",
            description="Hiring pipeline, candidate offers, and departmental headcount planning.",
            sensitivity_level="confidential"
        )
        launch_space = Space(
            organization_id=org.id,
            department_id=prod_dept.id,
            name="Platform Launch",
            slug="product-platform-launch",
            space_type="project",
            description="Cross-functional readiness for the next-generation cloud platform rollout.",
            sensitivity_level="internal"
        )
        db.add_all([backend_space, recruitment_space, launch_space])
        db.flush()

        # 4. Users
        alex = User(
            organization_id=org.id,
            email="alex.rivera@acme.internal",
            display_name="Alex Rivera",
            role="lead"
        )
        elena = User(
            organization_id=org.id,
            email="elena.rostova@acme.internal",
            display_name="Elena Rostova",
            role="member"
        )
        david = User(
            organization_id=org.id,
            email="david.chen@acme.internal",
            display_name="David Chen",
            role="lead"
        )
        sophia = User(
            organization_id=org.id,
            email="sophia.martinez@acme.internal",
            display_name="Sophia Martinez",
            role="admin"
        )
        db.add_all([alex, elena, david, sophia])
        db.flush()

        # 5. Memberships
        db.add_all([
            SpaceMember(space_id=backend_space.id, user_id=alex.id, role="admin"),
            SpaceMember(space_id=backend_space.id, user_id=elena.id, role="contributor"),
            SpaceMember(space_id=recruitment_space.id, user_id=david.id, role="admin"),
            SpaceMember(space_id=launch_space.id, user_id=sophia.id, role="admin"),
            SpaceMember(space_id=launch_space.id, user_id=alex.id, role="contributor"),
        ])
        db.flush()

        # ----------------------------------------------------
        # Historical Meeting: Initial Backend Strategy (Month -1)
        # ----------------------------------------------------
        m_old = Meeting(
            organization_id=org.id,
            primary_space_id=backend_space.id,
            title="Backend Kickoff: Single-node Storage Architecture",
            meeting_date=datetime.utcnow() - timedelta(days=35),
            source_type="upload",
            processing_status="completed",
            raw_transcript_text="Alex: We will rely on single-node Postgres with Redis caching for the MVP phase."
        )
        db.add(m_old)
        db.flush()
        db.add(MeetingSpace(meeting_id=m_old.id, space_id=backend_space.id, relationship_type="primary"))

        seg_old = TranscriptSegment(
            meeting_id=m_old.id,
            segment_index=0,
            speaker_name="Alex Rivera",
            speaker_role="Engineering Lead",
            start_ms=0,
            end_ms=18000,
            content="We will rely on single-node Postgres with Redis caching for the MVP phase to keep infrastructure simple."
        )
        db.add(seg_old)
        db.flush()

        # Prior Decision (will be superseded)
        dec_prior = Decision(
            organization_id=org.id,
            space_id=backend_space.id,
            meeting_id=m_old.id,
            statement="Adopt single-node PostgreSQL with Redis cache for the MVP release.",
            rationale="Simplifies initial deployment and minimizes infrastructure overhead.",
            decision_type="architecture",
            status="superseded",
            impact_level="medium",
            confidence=0.98,
            decided_by="Alex Rivera",
            approved_by="Alex Rivera",
            created_at=datetime.utcnow() - timedelta(days=35)
        )
        db.add(dec_prior)
        db.flush()

        ev_old = Evidence(
            organization_id=org.id,
            meeting_id=m_old.id,
            transcript_segment_id=seg_old.id,
            quote="We will rely on single-node Postgres with Redis caching for the MVP phase",
            speaker_name="Alex Rivera"
        )
        db.add(ev_old)
        db.flush()
        db.add(DecisionEvidence(decision_id=dec_prior.id, evidence_id=ev_old.id))

        db.add(DecisionVersion(
            decision_id=dec_prior.id,
            version_number=1,
            statement=dec_prior.statement,
            status="active",
            change_reason="Initial architectural baseline",
            created_by="Alex Rivera",
            created_at=datetime.utcnow() - timedelta(days=35)
        ))
        db.add(DecisionVersion(
            decision_id=dec_prior.id,
            version_number=2,
            statement=dec_prior.statement,
            status="superseded",
            change_reason="Superseded by database schema partitioning decision due to load spikes",
            created_by="Elena Rostova",
            created_at=datetime.utcnow() - timedelta(days=12)
        ))

        # ----------------------------------------------------
        # Meeting 1 (Engineering -> Backend): Architecture Review
        # ----------------------------------------------------
        m1 = Meeting(
            organization_id=org.id,
            primary_space_id=backend_space.id,
            title="Q4 Architecture Review: Database Scaling & Storage Partitioning",
            meeting_date=datetime.utcnow() - timedelta(days=12),
            source_type="paste",
            processing_status="completed"
        )
        db.add(m1)
        db.flush()
        db.add(MeetingSpace(meeting_id=m1.id, space_id=backend_space.id, relationship_type="primary"))

        m1_transcript = """[00:01:05] Alex Rivera (Engineering Lead): Let's review our storage scale. Single-node Redis cache is failing our p99 query latency targets under simulated load.
[00:02:15] Elena Rostova (Staff Backend Architect): Agreed. I benchmarked horizontal sharding versus table partitioning. We decided we will partition the PostgreSQL transactional database schema by organization ID.
[00:04:10] Alex Rivera (Engineering Lead): That explicitly supersedes our kickoff decision of relying solely on single-node caching. It requires 3 weeks of database migration work.
[00:05:40] Elena Rostova (Staff Backend Architect): I will take the lead on preparing Alembic partition scripts and updating repository indexes by next Friday.
[00:07:00] Alex Rivera (Engineering Lead): Excellent. We are also blocked on the database query benchmark until we have staging test credentials from DevOps."""
        m1.raw_transcript_text = m1_transcript

        m1_segs = MeetingService.parse_transcript_text(m1_transcript)
        m1_seg_rows = []
        for s in m1_segs:
            r = TranscriptSegment(
                meeting_id=m1.id,
                segment_index=s["segment_index"],
                speaker_name=s["speaker_name"],
                speaker_role=s["speaker_role"],
                start_ms=s["start_ms"],
                end_ms=s["end_ms"],
                content=s["content"]
            )
            db.add(r)
            m1_seg_rows.append(r)
        db.flush()

        # Decision 1 (Current Active superseding decision)
        dec_current = Decision(
            organization_id=org.id,
            space_id=backend_space.id,
            meeting_id=m1.id,
            statement="Approved PostgreSQL schema partitioning by organization ID, superseding single-node caching.",
            rationale="Single-node caching failed p99 latency SLAs; partitioning guarantees tenant isolation and sub-50ms query response.",
            decision_type="architecture",
            status="active",
            impact_level="high",
            confidence=0.97,
            decided_by="Elena Rostova",
            approved_by="Alex Rivera",
            created_at=datetime.utcnow() - timedelta(days=12)
        )
        db.add(dec_current)
        db.flush()

        ev1 = Evidence(
            organization_id=org.id,
            meeting_id=m1.id,
            transcript_segment_id=m1_seg_rows[1].id,
            quote="We decided we will partition the PostgreSQL transactional database schema by organization ID.",
            speaker_name="Elena Rostova"
        )
        db.add(ev1)
        db.flush()
        db.add(DecisionEvidence(decision_id=dec_current.id, evidence_id=ev1.id))

        db.add(DecisionVersion(
            decision_id=dec_current.id,
            version_number=1,
            statement=dec_current.statement,
            status="active",
            change_reason="Formally approved in Q4 Architecture Review",
            created_by="Alex Rivera",
            created_at=datetime.utcnow() - timedelta(days=12)
        ))

        # SUPERSEDES relationship
        db.add(EntityRelationship(
            organization_id=org.id,
            source_type="decision",
            source_id=dec_current.id,
            target_type="decision",
            target_id=dec_prior.id,
            relationship_type="SUPERSEDES",
            confidence_score=0.98,
            notes="Partitioning replaces the single-node architecture baseline."
        ))

        # Task in Backend
        task1 = Task(
            organization_id=org.id,
            space_id=backend_space.id,
            meeting_id=m1.id,
            title="Prepare Alembic database partition scripts and query indexes",
            description="Implement organization-partitioned schema migrations for Postgres v15.",
            assignee_name="Elena Rostova",
            status="in_progress",
            priority="high",
            due_date=datetime.utcnow() + timedelta(days=5),
            evidence_quote="I will take the lead on preparing Alembic partition scripts and updating repository indexes",
            transcript_segment_id=m1_seg_rows[3].id
        )
        db.add(task1)

        # Blocker in Backend
        blocker1 = Blocker(
            organization_id=org.id,
            space_id=backend_space.id,
            meeting_id=m1.id,
            description="Staging database credentials missing from DevOps team.",
            severity="medium",
            status="resolved",
            reported_by="Alex Rivera",
            evidence_quote="We are also blocked on the database query benchmark until we have staging test credentials",
            transcript_segment_id=m1_seg_rows[4].id,
            resolved_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(blocker1)
        db.flush()

        # ----------------------------------------------------
        # Meeting 2 (HR -> Recruitment): Technical Hiring Sync
        # ----------------------------------------------------
        m2 = Meeting(
            organization_id=org.id,
            primary_space_id=recruitment_space.id,
            title="Weekly Technical Recruitment Sync: Staffing Capacity",
            meeting_date=datetime.utcnow() - timedelta(days=5),
            source_type="paste",
            processing_status="completed"
        )
        db.add(m2)
        db.flush()
        db.add(MeetingSpace(meeting_id=m2.id, space_id=recruitment_space.id, relationship_type="primary"))

        m2_transcript = """[00:00:45] David Chen (Head of Recruitment): Critical update on the backend engineering pipeline. Our lead candidate for the Senior Distributed Systems role reneged yesterday due to a counter-offer.
[00:02:10] David Chen (Head of Recruitment): This is an active blocker. We have zero vetted candidates in the final interview loop, so backend headcount capacity is delayed by at least 4 weeks.
[00:04:30] Sophia Martinez (VP of Product): This directly threatens the Backend team's database migration timeline and the entire Platform Launch."""
        m2.raw_transcript_text = m2_transcript

        m2_segs = MeetingService.parse_transcript_text(m2_transcript)
        m2_seg_rows = []
        for s in m2_segs:
            r = TranscriptSegment(
                meeting_id=m2.id,
                segment_index=s["segment_index"],
                speaker_name=s["speaker_name"],
                speaker_role=s["speaker_role"],
                start_ms=s["start_ms"],
                end_ms=s["end_ms"],
                content=s["content"]
            )
            db.add(r)
            m2_seg_rows.append(r)
        db.flush()

        # Blocker in HR Recruitment
        blocker2 = Blocker(
            organization_id=org.id,
            space_id=recruitment_space.id,
            meeting_id=m2.id,
            description="Senior Backend Engineer candidate reneged; engineering team capacity delayed by 4 weeks.",
            severity="critical",
            status="active",
            reported_by="David Chen",
            evidence_quote="Our lead candidate for the Senior Distributed Systems role reneged yesterday due to a counter-offer",
            transcript_segment_id=m2_seg_rows[0].id
        )
        db.add(blocker2)
        db.flush()

        # Task in HR
        task2 = Task(
            organization_id=org.id,
            space_id=recruitment_space.id,
            meeting_id=m2.id,
            title="Engage external executive recruiting agency for Senior Backend Systems candidate",
            description="Expedite replacement pipeline to unblock backend scaling work.",
            assignee_name="David Chen",
            status="todo",
            priority="urgent",
            due_date=datetime.utcnow() + timedelta(days=3),
            evidence_quote="backend headcount capacity is delayed by at least 4 weeks",
            transcript_segment_id=m2_seg_rows[1].id
        )
        db.add(task2)

        # ----------------------------------------------------
        # Meeting 3 (Product -> Platform Launch): Cross-Team Alignment
        # ----------------------------------------------------
        m3 = Meeting(
            organization_id=org.id,
            primary_space_id=launch_space.id,
            title="Q1 Platform Launch Go/No-Go & Cross-Space Dependency Review",
            meeting_date=datetime.utcnow() - timedelta(days=2),
            source_type="paste",
            processing_status="completed"
        )
        db.add(m3)
        db.flush()
        db.add(MeetingSpace(meeting_id=m3.id, space_id=launch_space.id, relationship_type="primary"))
        db.add(MeetingSpace(meeting_id=m3.id, space_id=backend_space.id, relationship_type="linked"))
        db.add(MeetingSpace(meeting_id=m3.id, space_id=recruitment_space.id, relationship_type="linked"))

        m3_transcript = """[00:01:10] Sophia Martinez (VP of Product): We need to confirm whether the March 15 Platform Launch milestone is holding.
[00:02:40] Alex Rivera (Engineering Lead): Because we superseded the old architecture with database schema partitioning, and HR lost the senior backend hire, we are running at 60% velocity.
[00:04:15] Sophia Martinez (VP of Product): We formally agree we will hold the tentative March 15 launch target, but flag a Critical Cross-Space Launch Risk across Engineering and HR.
[00:06:00] Sophia Martinez (VP of Product): Action item for Alex: Submit revised migration milestones by Wednesday."""
        m3.raw_transcript_text = m3_transcript

        m3_segs = MeetingService.parse_transcript_text(m3_transcript)
        m3_seg_rows = []
        for s in m3_segs:
            r = TranscriptSegment(
                meeting_id=m3.id,
                segment_index=s["segment_index"],
                speaker_name=s["speaker_name"],
                speaker_role=s["speaker_role"],
                start_ms=s["start_ms"],
                end_ms=s["end_ms"],
                content=s["content"]
            )
            db.add(r)
            m3_seg_rows.append(r)
        db.flush()

        dec_launch = Decision(
            organization_id=org.id,
            space_id=launch_space.id,
            meeting_id=m3.id,
            statement="Tentatively maintain March 15 Platform Launch milestone subject to backend capacity confirmation.",
            rationale="Preserves marketing momentum while actively tracking technical and hiring dependencies.",
            decision_type="product",
            status="active",
            impact_level="critical",
            confidence=0.95,
            decided_by="Sophia Martinez",
            approved_by="Sophia Martinez",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(dec_launch)
        db.flush()

        ev3 = Evidence(
            organization_id=org.id,
            meeting_id=m3.id,
            transcript_segment_id=m3_seg_rows[2].id,
            quote="We formally agree we will hold the tentative March 15 launch target, but flag a Critical Cross-Space Launch Risk",
            speaker_name="Sophia Martinez"
        )
        db.add(ev3)
        db.flush()
        db.add(DecisionEvidence(decision_id=dec_launch.id, evidence_id=ev3.id))

        db.add(DecisionVersion(
            decision_id=dec_launch.id,
            version_number=1,
            statement=dec_launch.statement,
            status="active",
            change_reason="Decided in Q1 Launch alignment",
            created_by="Sophia Martinez",
            created_at=datetime.utcnow() - timedelta(days=2)
        ))

        # Cross-space dependency relationships!
        # 1. Blocker (HR candidate reneged) BLOCKS Backend task (partitioning execution)
        db.add(EntityRelationship(
            organization_id=org.id,
            source_type="blocker",
            source_id=blocker2.id,
            target_type="task",
            target_id=task1.id,
            relationship_type="BLOCKS",
            confidence_score=0.94,
            notes="Delayed hiring directly starves backend partitioning delivery velocity."
        ))

        # 2. Backend Decision (Postgres partitioning) AFFECTS Product Launch Decision
        db.add(EntityRelationship(
            organization_id=org.id,
            source_type="decision",
            source_id=dec_current.id,
            target_type="decision",
            target_id=dec_launch.id,
            relationship_type="AFFECTS",
            confidence_score=0.96,
            notes="Database migration timeline directly dictates Platform Launch viability."
        ))

        # Seed an extraction candidate pending review in Backend for interactive demo
        db.add(ExtractionCandidate(
            meeting_id=m1.id,
            candidate_type="task",
            payload_json='{"title": "Schedule staging dry-run for database partition failover", "description": "Execute rehearsal before production traffic switch.", "assignee_name": "Elena Rostova", "priority": "high", "evidence_quote": "preparing Alembic partition scripts", "transcript_segment_id": "' + m1_seg_rows[3].id + '"}',
            confidence_score=0.91,
            status="pending"
        ))

        db.commit()
        print("Demo environment successfully seeded!")
        print(f"Organization: {org.name} ({org.id})")
        print(f"Spaces: Backend, Recruitment, Platform Launch")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
