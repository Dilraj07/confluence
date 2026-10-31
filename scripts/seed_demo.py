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
    Project,
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
    AuditEvent,
    OpenQuestion,
    Finding,
    FindingRecord,
    ApprovalRequest
)

def run_seed():
    print("Re-creating database schema for MeridianPay Smart Routing v2...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding MeridianPay Smart Routing v2 organizational memory dataset...")

        # ----------------------------------------------------
        # 1. Organisation
        # ----------------------------------------------------
        org_id = "c12d3609-5d89-5d41-99f9-20b2a8f15321"
        org = Organization(
            id=org_id,
            name="MeridianPay",
            slug="meridianpay",
            created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
        )
        db.add(org)
        db.flush()

        # ----------------------------------------------------
        # 2. Departments
        # ----------------------------------------------------
        depts_data = [
            ("976b8ecd-d75d-5031-8a02-08ca4636cff0", "Payments Engineering", "payments-engineering", "Fictional demo department: Payments Engineering."),
            ("012620e5-2abf-53f0-a50c-b8573a42c7bc", "Site Reliability Engineering", "sre", "Fictional demo department: Site Reliability Engineering."),
            ("710a8b25-1e0a-5c8d-b8de-d07bd3253766", "Risk & Fraud", "risk-and-fraud", "Fictional demo department: Risk & Fraud."),
            ("6422f4e2-7447-5c91-b7e8-e7c738e6bc47", "Security & Compliance", "security-and-compliance", "Fictional demo department: Security & Compliance."),
            ("5ce10ec8-5d51-5f9e-9d03-e797de089157", "Merchant Operations", "merchant-operations", "Fictional demo department: Merchant Operations."),
            ("c73a2568-0179-5a4c-aad7-a00e89355113", "Product & Strategy", "product-and-strategy", "Fictional demo department: Product & Strategy.")
        ]
        for d_id, name, slug, desc in depts_data:
            db.add(Department(
                id=d_id,
                organization_id=org_id,
                name=name,
                slug=slug,
                description=desc,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 3. Users
        # ----------------------------------------------------
        users_data = [
            ("3fc01550-c7e4-55ad-bbf4-3c6599fb57ce", "maya.chen@meridianpay.example", "Maya Chen", "lead"),
            ("3d5d0b48-d0eb-5544-a845-b7687a88e24a", "daniel.foster@meridianpay.example", "Daniel Foster", "lead"),
            ("57f3cd3a-204c-5d7e-96b4-5d382d76300f", "elena.petrova@meridianpay.example", "Elena Petrova", "member"),
            ("756c8a27-bcff-5894-b1e9-d1b899ffa95a", "priya.nair@meridianpay.example", "Priya Nair", "lead"),
            ("f1ed3ec8-1ec5-5bc8-a615-823becb0e3d8", "omar.hassan@meridianpay.example", "Omar Hassan", "lead"),
            ("1389f28b-f89d-55ff-865d-dc595fc1a589", "fatima.ali@meridianpay.example", "Fatima Ali", "member"),
            ("dbc70974-93b3-5b69-9d3b-7b3fe752165c", "james.wilson@meridianpay.example", "James Wilson", "lead"),
            ("673e2dfb-cfbe-52f6-9a20-075b8fd542e0", "sarah.kim@meridianpay.example", "Sarah Kim", "lead"),
            ("20038ccd-f008-59d7-b909-a9a429bf7f47", "lucas.reed@meridianpay.example", "Lucas Reed", "member"),
            ("5cbe07bd-160a-5978-9dbb-e12281f68dfe", "nina.patel@meridianpay.example", "Nina Patel", "member"),
            ("c3539273-52bb-5d02-9705-338f3126281e", "alex.morgan@meridianpay.example", "Alex Morgan", "member"),
            ("8aec65cd-e1dd-52bd-8d79-9d0de3ab6f9a", "grace.lee@meridianpay.example", "Grace Lee", "member"),
        ]
        user_name_map = {}
        for u_id, email, display_name, role in users_data:
            user_name_map[u_id] = display_name
            db.add(User(
                id=u_id,
                organization_id=org_id,
                email=email,
                display_name=display_name,
                role=role,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 4. Spaces
        # ----------------------------------------------------
        spaces_data = [
            ("c51d1349-7c9e-5b7c-ae96-6469d80b9790", "976b8ecd-d75d-5031-8a02-08ca4636cff0", "Payments Platform", "payments-platform", "team", "Routing engine, payment APIs, idempotency, processor integrations.", "internal"),
            ("79354d43-971e-542f-ad55-b1fce3290ec6", "012620e5-2abf-53f0-a50c-b8573a42c7bc", "Site Reliability Engineering", "site-reliability-engineering", "team", "Availability, latency, monitoring, deployment, rollback.", "internal"),
            ("6e5acdd2-d7c0-58f4-abc3-bfdb9620379c", "710a8b25-1e0a-5c8d-b8de-d07bd3253766", "Risk & Fraud", "risk-and-fraud", "team", "Fraud scoring, transaction risk decisions, control validation.", "confidential"),
            ("8f06b32b-668a-51ca-a0b7-0853b197e9ae", "6422f4e2-7447-5c91-b7e8-e7c738e6bc47", "Security & Compliance", "security-and-compliance", "team", "Payment data security, access controls, audit evidence.", "restricted"),
            ("f1339331-f5cc-5fad-aa79-d35acef48713", "5ce10ec8-5d51-5f9e-9d03-e797de089157", "Merchant Operations", "merchant-operations", "team", "Merchant pilot coordination, support readiness, communications.", "internal"),
            ("aec6e03e-fddc-5b51-bbbd-ec71e566b329", "c73a2568-0179-5a4c-aad7-a00e89355113", "Product & Strategy", "product-and-strategy", "team", "Product requirements, launch criteria, business outcomes.", "internal"),
        ]
        for s_id, dept_id, name, slug, s_type, desc, sens in spaces_data:
            db.add(Space(
                id=s_id,
                organization_id=org_id,
                department_id=dept_id,
                parent_space_id=None,
                name=name,
                slug=slug,
                space_type=s_type,
                description=desc,
                sensitivity_level=sens,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # Space Memberships
        memberships_data = [
            ('aec6e03e-fddc-5b51-bbbd-ec71e566b329','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','member'),
            ('c51d1349-7c9e-5b7c-ae96-6469d80b9790','3d5d0b48-d0eb-5544-a845-b7687a88e24a','member'),
            ('c51d1349-7c9e-5b7c-ae96-6469d80b9790','57f3cd3a-204c-5d7e-96b4-5d382d76300f','member'),
            ('79354d43-971e-542f-ad55-b1fce3290ec6','756c8a27-bcff-5894-b1e9-d1b899ffa95a','member'),
            ('6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','f1ed3ec8-1ec5-5bc8-a615-823becb0e3d8','member'),
            ('6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','1389f28b-f89d-55ff-865d-dc595fc1a589','member'),
            ('8f06b32b-668a-51ca-a0b7-0853b197e9ae','dbc70974-93b3-5b69-9d3b-7b3fe752165c','member'),
            ('f1339331-f5cc-5fad-aa79-d35acef48713','673e2dfb-cfbe-52f6-9a20-075b8fd542e0','member'),
            ('c51d1349-7c9e-5b7c-ae96-6469d80b9790','20038ccd-f008-59d7-b909-a9a429bf7f47','member'),
            ('8f06b32b-668a-51ca-a0b7-0853b197e9ae','5cbe07bd-160a-5978-9dbb-e12281f68dfe','member'),
            ('79354d43-971e-542f-ad55-b1fce3290ec6','c3539273-52bb-5d02-9705-338f3126281e','member'),
            ('aec6e03e-fddc-5b51-bbbd-ec71e566b329','8aec65cd-e1dd-52bd-8d79-9d0de3ab6f9a','member')
        ]
        for s_id, u_id, role in memberships_data:
            db.add(SpaceMember(
                space_id=s_id,
                user_id=u_id,
                role=role,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 5. Project
        # ----------------------------------------------------
        proj_id = "fadde36c-96f9-5509-aa29-1a038a4b2b7c"
        db.add(Project(
            id=proj_id,
            organization_id=org_id,
            name="Smart Routing v2",
            description="Adaptive payment processor selection with safe failover, idempotency, risk continuity, and controlled merchant rollout.",
            status="at_risk",
            created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
        ))
        db.flush()

        # ----------------------------------------------------
        # 6. Meetings
        # ----------------------------------------------------
        # Past meetings are in October leading to today (31 Oct 2026), with the upcoming gate in November (14 Nov 2026)
        meetings_data = [
            ("2033cb92-95e6-5580-a51a-b199bbb8b69f", "aec6e03e-fddc-5b51-bbbd-ec71e566b329", "Smart Routing v2 kickoff", "2026-10-19T09:00:00+05:30", "3fc01550-c7e4-55ad-bbf4-3c6599fb57ce"),
            ("ea655bba-f14e-521d-8ec8-458fa2398acb", "c51d1349-7c9e-5b7c-ae96-6469d80b9790", "Routing architecture and idempotency review", "2026-10-21T10:00:00+05:30", "3d5d0b48-d0eb-5544-a845-b7687a88e24a"),
            ("2e061b40-a4e5-5f67-9b70-01ed58328916", "6e5acdd2-d7c0-58f4-abc3-bfdb9620379c", "Fraud controls during processor failover", "2026-10-22T11:00:00+05:30", "f1ed3ec8-1ec5-5bc8-a615-823becb0e3d8"),
            ("35623284-e53b-538f-a88f-719ceb2ad5b2", "8f06b32b-668a-51ca-a0b7-0853b197e9ae", "Payment data security and logging review", "2026-10-23T14:00:00+05:30", "dbc70974-93b3-5b69-9d3b-7b3fe752165c"),
            ("880f34a1-35bd-5796-8ab1-ad4d662edcec", "79354d43-971e-542f-ad55-b1fce3290ec6", "Canary observability and production readiness", "2026-10-26T10:30:00+05:30", "756c8a27-bcff-5894-b1e9-d1b899ffa95a"),
            ("a125dfc8-e498-5898-8dfa-e4acf91fb697", "c51d1349-7c9e-5b7c-ae96-6469d80b9790", "Pilot performance review: timeout ambiguity", "2026-10-28T15:00:00+05:30", "3d5d0b48-d0eb-5544-a845-b7687a88e24a"),
            ("69e18c75-f04d-528e-8087-1aa642142c06", "aec6e03e-fddc-5b51-bbbd-ec71e566b329", "Smart Routing launch gate decision", "2026-10-29T09:30:00+05:30", "3fc01550-c7e4-55ad-bbf4-3c6599fb57ce"),
            ("75294199-1a00-5b40-928f-75d96eaa8dda", "f1339331-f5cc-5fad-aa79-d35acef48713", "Merchant pilot communications and support readiness", "2026-10-30T13:00:00+05:30", "673e2dfb-cfbe-52f6-9a20-075b8fd542e0"),
            ("d4640004-5671-4416-a8f4-31d39553a8e8", "c51d1349-7c9e-5b7c-ae96-6469d80b9790", "Idempotency and Reconciliation Architecture Extension", "2026-10-31T15:50:00+05:30", "57f3cd3a-204c-5d7e-96b4-5d382d76300f"),
            ("f417b114-1414-5200-a001-14nov2026gate", "aec6e03e-fddc-5b51-bbbd-ec71e566b329", "Smart Routing v2: 14 November Technical Readiness Review Gate", "2026-11-14T10:00:00+05:30", "3fc01550-c7e4-55ad-bbf4-3c6599fb57ce"),
        ]
        meeting_name_map = {}
        for m_id, s_id, title, m_date, created_by in meetings_data:
            meeting_name_map[m_id] = title
            db.add(Meeting(
                id=m_id,
                organization_id=org_id,
                primary_space_id=s_id,
                project_id=proj_id,
                title=title,
                meeting_date=datetime.fromisoformat(m_date),
                source_type="paste" if "14nov" not in m_id else "scheduled",
                processing_status="completed",
                created_by_user_id=created_by,
                created_at=datetime.fromisoformat(m_date)
            ))
        db.flush()

        # Meeting Spaces mapping
        meeting_spaces_data = [
            ('2033cb92-95e6-5580-a51a-b199bbb8b69f','aec6e03e-fddc-5b51-bbbd-ec71e566b329','primary'),
            ('2033cb92-95e6-5580-a51a-b199bbb8b69f','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('2033cb92-95e6-5580-a51a-b199bbb8b69f','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('2033cb92-95e6-5580-a51a-b199bbb8b69f','6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','linked'),
            ('ea655bba-f14e-521d-8ec8-458fa2398acb','c51d1349-7c9e-5b7c-ae96-6469d80b9790','primary'),
            ('ea655bba-f14e-521d-8ec8-458fa2398acb','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('2e061b40-a4e5-5f67-9b70-01ed58328916','6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','primary'),
            ('2e061b40-a4e5-5f67-9b70-01ed58328916','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('35623284-e53b-538f-a88f-719ceb2ad5b2','8f06b32b-668a-51ca-a0b7-0853b197e9ae','primary'),
            ('35623284-e53b-538f-a88f-719ceb2ad5b2','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('880f34a1-35bd-5796-8ab1-ad4d662edcec','79354d43-971e-542f-ad55-b1fce3290ec6','primary'),
            ('880f34a1-35bd-5796-8ab1-ad4d662edcec','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('880f34a1-35bd-5796-8ab1-ad4d662edcec','8f06b32b-668a-51ca-a0b7-0853b197e9ae','linked'),
            ('a125dfc8-e498-5898-8dfa-e4acf91fb697','c51d1349-7c9e-5b7c-ae96-6469d80b9790','primary'),
            ('a125dfc8-e498-5898-8dfa-e4acf91fb697','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('a125dfc8-e498-5898-8dfa-e4acf91fb697','6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','linked'),
            ('69e18c75-f04d-528e-8087-1aa642142c06','aec6e03e-fddc-5b51-bbbd-ec71e566b329','primary'),
            ('69e18c75-f04d-528e-8087-1aa642142c06','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('69e18c75-f04d-528e-8087-1aa642142c06','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('69e18c75-f04d-528e-8087-1aa642142c06','6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','linked'),
            ('69e18c75-f04d-528e-8087-1aa642142c06','8f06b32b-668a-51ca-a0b7-0853b197e9ae','linked'),
            ('75294199-1a00-5b40-928f-75d96eaa8dda','f1339331-f5cc-5fad-aa79-d35acef48713','primary'),
            ('75294199-1a00-5b40-928f-75d96eaa8dda','aec6e03e-fddc-5b51-bbbd-ec71e566b329','linked'),
            ('75294199-1a00-5b40-928f-75d96eaa8dda','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('d4640004-5671-4416-a8f4-31d39553a8e8','c51d1349-7c9e-5b7c-ae96-6469d80b9790','primary'),
            ('f417b114-1414-5200-a001-14nov2026gate','aec6e03e-fddc-5b51-bbbd-ec71e566b329','primary'),
            ('f417b114-1414-5200-a001-14nov2026gate','c51d1349-7c9e-5b7c-ae96-6469d80b9790','linked'),
            ('f417b114-1414-5200-a001-14nov2026gate','79354d43-971e-542f-ad55-b1fce3290ec6','linked'),
            ('f417b114-1414-5200-a001-14nov2026gate','6e5acdd2-d7c0-58f4-abc3-bfdb9620379c','linked'),
            ('f417b114-1414-5200-a001-14nov2026gate','8f06b32b-668a-51ca-a0b7-0853b197e9ae','linked')
        ]
        for m_id, s_id, rel in meeting_spaces_data:
            db.add(MeetingSpace(
                meeting_id=m_id,
                space_id=s_id,
                relationship_type=rel,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 7. Transcript Segments
        # ----------------------------------------------------
        segments_data = [
            ('a59eba31-6811-5c94-ba30-e98cbe714e8a','2033cb92-95e6-5580-a51a-b199bbb8b69f', 0, 'Maya Chen', 0, 30000, "We want to start Smart Routing with ten merchants. The goal is to improve authorisation performance without changing the merchant integration."),
            ('a20bb55a-1cff-5f7b-8595-046027f9d8c4','2033cb92-95e6-5580-a51a-b199bbb8b69f', 1, 'Maya Chen', 30000, 60000, "Let's begin with a 5% canary. Expansion requires reliability and risk checks to pass."),
            ('26f7cf55-f7dd-500e-b66a-ff2e0d6ae338','ea655bba-f14e-521d-8ec8-458fa2398acb', 0, 'Daniel Foster', 0, 30000, "A processor timeout does not prove that the processor never received or authorised the payment."),
            ('b9db6072-0a38-519b-997e-ced2205960a6','ea655bba-f14e-521d-8ec8-458fa2398acb', 1, 'Elena Petrova', 30000, 60000, "Carry the same idempotency key across routing and processor attempts. Do not automatically fail over an ambiguous timeout until we have safe reconciliation."),
            ('0c746951-71fe-5254-944b-77bd554c1119','2e061b40-a4e5-5f67-9b70-01ed58328916', 0, 'Omar Hassan', 0, 30000, "Routing to a secondary processor must not bypass the risk decision for the original transaction."),
            ('a083c899-d1ed-5d42-8764-ceb0676c6fa8','2e061b40-a4e5-5f67-9b70-01ed58328916', 1, 'Fatima Ali', 30000, 60000, "Risk evaluation must be independent of processor selection. If mandatory risk evaluation is unavailable, fail safely rather than routing around it."),
            ('2d03a083-b362-519f-bc00-c9bd82c0bcb8','35623284-e53b-538f-a88f-719ceb2ad5b2', 0, 'James Wilson', 0, 30000, "The routing service must never write raw card numbers or sensitive authentication data into application logs."),
            ('adca6eeb-576c-5489-bfb9-ec35e82f2ea3','35623284-e53b-538f-a88f-719ceb2ad5b2', 1, 'Nina Patel', 30000, 60000, "Review error traces, retry metadata, tokenised references, access controls, and the updated PCI data-flow documentation."),
            ('eafbd7e0-04c2-52b3-a153-c21db4afc51b','880f34a1-35bd-5796-8ab1-ad4d662edcec', 0, 'Priya Nair', 0, 30000, "The canary dashboard needs p95 latency, processor timeout rate, error rate, and traffic distribution."),
            ('b3ff4c2a-573e-536d-a9d0-71a7234e89d1','880f34a1-35bd-5796-8ab1-ad4d662edcec', 1, 'Priya Nair', 30000, 60000, "For this pilot, pause expansion if p95 latency exceeds 650 ms for ten minutes or the error rate exceeds 0.5%. Pause does not automatically mean rollback."),
            ('28e03116-b81d-5488-83b2-bbc2825892ff','a125dfc8-e498-5898-8dfa-e4acf91fb697', 0, 'Priya Nair', 0, 30000, "The pilot showed elevated processor timeouts and rising p95 latency. We should not expand traffic."),
            ('07068749-1e7f-5e76-8179-5981e72299cc','a125dfc8-e498-5898-8dfa-e4acf91fb697', 1, 'Elena Petrova', 30000, 60000, "Some requests are retried even though we cannot tell whether the original processor completed authorisation. Disable automatic cross-processor retries for ambiguous outcomes."),
            ('45b73067-a55d-5922-8507-fe9cd9c710f8','69e18c75-f04d-528e-8087-1aa642142c06', 0, 'Priya Nair', 0, 30000, "Timeout behaviour is not ready. Risk verification and monitoring validation are also incomplete."),
            ('d6739a44-b1d0-5930-a4f6-70bbce1723bb','69e18c75-f04d-528e-8087-1aa642142c06', 1, 'Maya Chen', 30000, 60000, "Replace the planned 20% expansion date with a 14 November readiness review. Payments, SRE, Risk, and Security must approve before expansion."),
            ('6b6ef3bc-feec-593d-8080-f5b96c52639d','75294199-1a00-5b40-928f-75d96eaa8dda', 0, 'Sarah Kim', 0, 30000, "Merchants need a clear explanation and a support runbook for payment failures during the pilot."),
            ('c7ffd5af-d1a9-50ba-a5a3-a5bcfe6d2aee','75294199-1a00-5b40-928f-75d96eaa8dda', 1, 'Maya Chen', 30000, 60000, "Keep merchant communication in draft. Do not confirm the expansion date until the technical readiness review is approved.")
        ]
        segment_quote_map = {}
        for seg_id, m_id, idx, speaker, s_ms, e_ms, content in segments_data:
            segment_quote_map[seg_id] = content
            db.add(TranscriptSegment(
                id=seg_id,
                meeting_id=m_id,
                segment_index=idx,
                speaker_name=speaker,
                start_ms=s_ms,
                end_ms=e_ms,
                content=content,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 8. Evidence
        # ----------------------------------------------------
        evidence_data = [
            ('2c3825f0-290f-55f3-9e1f-12e8a7a2a13e','2033cb92-95e6-5580-a51a-b199bbb8b69f','a59eba31-6811-5c94-ba30-e98cbe714e8a',0,142,"We want to start Smart Routing with ten merchants. The goal is to improve authorisation performance without changing the merchant integration.",'Maya Chen',0,30000),
            ('664e7b8e-c346-5342-96d8-a12df6055286','2033cb92-95e6-5580-a51a-b199bbb8b69f','a20bb55a-1cff-5f7b-8595-046027f9d8c4',0,85,"Let's begin with a 5% canary. Expansion requires reliability and risk checks to pass.",'Maya Chen',30000,60000),
            ('d936e366-758c-5a1e-bddd-9a16cef8d8c7','ea655bba-f14e-521d-8ec8-458fa2398acb','26f7cf55-f7dd-500e-b66a-ff2e0d6ae338',0,95,"A processor timeout does not prove that the processor never received or authorised the payment.",'Daniel Foster',0,30000),
            ('b4c842f9-a72a-58f9-8aab-71916c6bed36','ea655bba-f14e-521d-8ec8-458fa2398acb','b9db6072-0a38-519b-997e-ced2205960a6',0,156,"Carry the same idempotency key across routing and processor attempts. Do not automatically fail over an ambiguous timeout until we have safe reconciliation.",'Elena Petrova',30000,60000),
            ('0637ca22-195d-529a-b9e1-293ed50e61e0','2e061b40-a4e5-5f67-9b70-01ed58328916','0c746951-71fe-5254-944b-77bd554c1119',0,96,"Routing to a secondary processor must not bypass the risk decision for the original transaction.",'Omar Hassan',0,30000),
            ('246e8b18-85c4-582d-a08c-16a72456e55c','2e061b40-a4e5-5f67-9b70-01ed58328916','a083c899-d1ed-5d42-8764-ceb0676c6fa8',0,147,"Risk evaluation must be independent of processor selection. If mandatory risk evaluation is unavailable, fail safely rather than routing around it.",'Fatima Ali',30000,60000),
            ('2b9aa0e1-dc42-5e62-a9a1-6748c791e937','35623284-e53b-538f-a88f-719ceb2ad5b2','2d03a083-b362-519f-bc00-c9bd82c0bcb8',0,109,"The routing service must never write raw card numbers or sensitive authentication data into application logs.",'James Wilson',0,30000),
            ('227bd71b-b9bb-55f7-97c3-227117acb647','35623284-e53b-538f-a88f-719ceb2ad5b2','adca6eeb-576c-5489-bfb9-ec35e82f2ea3',0,120,"Review error traces, retry metadata, tokenised references, access controls, and the updated PCI data-flow documentation.",'Nina Patel',30000,60000),
            ('c448f4ab-c8a8-56ba-8392-6070a259b6d7','880f34a1-35bd-5796-8ab1-ad4d662edcec','eafbd7e0-04c2-52b3-a153-c21db4afc51b',0,101,"The canary dashboard needs p95 latency, processor timeout rate, error rate, and traffic distribution.",'Priya Nair',0,30000),
            ('9a983b63-3633-545d-ae12-4764d3abde6a','880f34a1-35bd-5796-8ab1-ad4d662edcec','b3ff4c2a-573e-536d-a9d0-71a7234e89d1',0,153,"For this pilot, pause expansion if p95 latency exceeds 650 ms for ten minutes or the error rate exceeds 0.5%. Pause does not automatically mean rollback.",'Priya Nair',30000,60000),
            ('ae6a58f9-4fd9-59c6-8993-3d00282d09f3','a125dfc8-e498-5898-8dfa-e4acf91fb697','28e03116-b81d-5488-83b2-bbc2825892ff',0,98,"The pilot showed elevated processor timeouts and rising p95 latency. We should not expand traffic.",'Priya Nair',0,30000),
            ('0f5c1976-c943-5125-976f-99250b02ea5d','a125dfc8-e498-5898-8dfa-e4acf91fb697','07068749-1e7f-5e76-8179-5981e72299cc',0,174,"Some requests are retried even though we cannot tell whether the original processor completed authorisation. Disable automatic cross-processor retries for ambiguous outcomes.",'Elena Petrova',30000,60000),
            ('b24abf70-3628-5587-9838-090e0dec1b0c','69e18c75-f04d-528e-8087-1aa642142c06','45b73067-a55d-5922-8507-fe9cd9c710f8',0,96,"Timeout behaviour is not ready. Risk verification and monitoring validation are also incomplete.",'Priya Nair',0,30000),
            ('a6f6412a-013f-5589-9cbf-e5c94d4884ae','69e18c75-f04d-528e-8087-1aa642142c06','d6739a44-b1d0-5930-a4f6-70bbce1723bb',0,140,"Replace the planned 20% expansion date with a 14 November readiness review. Payments, SRE, Risk, and Security must approve before expansion.",'Maya Chen',30000,60000),
            ('b2c23255-e663-5e56-955c-0feed9947a9b','75294199-1a00-5b40-928f-75d96eaa8dda','6b6ef3bc-feec-593d-8080-f5b96c52639d',0,95,"Merchants need a clear explanation and a support runbook for payment failures during the pilot.",'Sarah Kim',0,30000),
            ('faf03243-d9f8-541e-9f90-6f3eb33e61d2','75294199-1a00-5b40-928f-75d96eaa8dda','c7ffd5af-d1a9-50ba-a5a3-a5bcfe6d2aee',0,121,"Keep merchant communication in draft. Do not confirm the expansion date until the technical readiness review is approved.",'Maya Chen',30000,60000)
        ]
        evidence_quote_map = {}
        for ev_id, m_id, seg_id, s_off, e_off, quote, speaker, s_ms, e_ms in evidence_data:
            evidence_quote_map[ev_id] = quote
            db.add(Evidence(
                id=ev_id,
                organization_id=org_id,
                meeting_id=m_id,
                transcript_segment_id=seg_id,
                start_offset=s_off,
                end_offset=e_off,
                quote=quote,
                speaker_name=speaker,
                confidence_score=0.98,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 9. Decisions
        # ----------------------------------------------------
        # Mapping decisions to spaces:
        decisions_space_map = {
            '9ca57a3b-b6cb-535e-a811-458976bc1e5f': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329', # Product & Strategy
            '95f6e618-9773-52e1-8f1f-a3a9b0018114': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790', # Payments Platform
            '7b7efdd3-1075-57a5-962a-850cab37f3e1': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790', # Payments Platform
            '1fc05fe9-53a8-5b29-8fb1-4f44af19735b': '6e5acdd2-d7c0-58f4-abc3-bfdb9620379c', # Risk & Fraud
            '75e6bcb1-f305-579f-993b-13b052faa145': '79354d43-971e-542f-ad55-b1fce3290ec6', # SRE
            'a9d24a57-d0d0-5b8a-98cc-5ad6bfa251ee': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790', # Payments Platform
            '57635a88-8391-573a-b635-5a851de81b75': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329', # Product & Strategy
            '924abc59-7153-5200-ad3e-01992957df02': 'f1339331-f5cc-5fad-aa79-d35acef48713', # Merchant Operations
            'e4c9dfff-50b6-5410-8e80-26b8e0462383': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329', # Product & Strategy (Superseded)
        }

        decisions_data = [
            ('9ca57a3b-b6cb-535e-a811-458976bc1e5f', '2033cb92-95e6-5580-a51a-b199bbb8b69f', "Begin with a 5% canary for the initial merchant pilot.", "rollout", "active", "medium", 0.98, "Maya Chen", "Maya Chen", "Gradual exposure to evaluate authorization performance without broad impact."),
            ('95f6e618-9773-52e1-8f1f-a3a9b0018114', 'ea655bba-f14e-521d-8ec8-458fa2398acb', "Propagate the same idempotency key across routing and processor attempts.", "technical", "active", "critical", 0.99, "Elena Petrova", "Maya Chen", "Prevents duplicate charges when re-routing or attempting failovers."),
            ('7b7efdd3-1075-57a5-962a-850cab37f3e1', 'ea655bba-f14e-521d-8ec8-458fa2398acb', "Do not automatically fail over an ambiguous processor timeout without safe reconciliation.", "technical", "active", "critical", 0.99, "Elena Petrova", "Daniel Foster", "A timeout does not prove the original processor failed to authorize."),
            ('1fc05fe9-53a8-5b29-8fb1-4f44af19735b', '2e061b40-a4e5-5f67-9b70-01ed58328916', "Mandatory risk evaluation must not be bypassed during processor failover; fail safely if unavailable.", "risk_control", "active", "critical", 0.98, "Fatima Ali", "Omar Hassan", "Maintains transaction fraud controls regardless of processor selection."),
            ('75e6bcb1-f305-579f-993b-13b052faa145', '880f34a1-35bd-5796-8ab1-ad4d662edcec', "Use canary monitoring and pause expansion at the agreed pilot latency or error thresholds.", "operational", "active", "high", 0.97, "Priya Nair", "Maya Chen", "Pause expansion if p95 latency exceeds 650 ms for 10 min or error rate > 0.5%."),
            ('a9d24a57-d0d0-5b8a-98cc-5ad6bfa251ee', 'a125dfc8-e498-5898-8dfa-e4acf91fb697', "Pause expansion beyond 5% and disable automatic cross-processor retries for ambiguous timeouts.", "rollout", "active", "critical", 0.99, "Elena Petrova", "Daniel Foster", "Unsafe retries observed causing duplicate authorization hazard during pilot."),
            ('57635a88-8391-573a-b635-5a851de81b75', '69e18c75-f04d-528e-8087-1aa642142c06', "Replace the planned 20% expansion with a 14 November readiness review requiring four team approvals.", "rollout", "active", "critical", 0.99, "Maya Chen", "Executive Committee", "Payments, SRE, Risk, and Security must approve before any expansion."),
            ('924abc59-7153-5200-ad3e-01992957df02', '75294199-1a00-5b40-928f-75d96eaa8dda', "Keep merchant launch confirmation in draft until technical readiness is approved.", "communications", "active", "medium", 0.98, "Maya Chen", "Sarah Kim", "Avoid premature merchant promises while timeout remediation is active."),
            ('e4c9dfff-50b6-5410-8e80-26b8e0462383', '2033cb92-95e6-5580-a51a-b199bbb8b69f', "Expand the pilot to 20% after the initial canary gate.", "rollout", "superseded", "high", 0.88, "Maya Chen", "Maya Chen", "Superseded by 14 November readiness review following timeout hazard discovery.")
        ]
        for d_id, m_id, statement, d_type, status, impact, conf, dec_by, app_by, rat in decisions_data:
            s_id = decisions_space_map[d_id]
            db.add(Decision(
                id=d_id,
                organization_id=org_id,
                space_id=s_id,
                meeting_id=m_id,
                statement=statement,
                rationale=rat,
                decision_type=d_type,
                status=status,
                impact_level=impact,
                confidence=conf,
                decided_by=dec_by,
                approved_by=app_by,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30"),
                updated_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # Decision Evidence links
        decision_evidence_data = [
            ('9ca57a3b-b6cb-535e-a811-458976bc1e5f','664e7b8e-c346-5342-96d8-a12df6055286'),
            ('95f6e618-9773-52e1-8f1f-a3a9b0018114','b4c842f9-a72a-58f9-8aab-71916c6bed36'),
            ('7b7efdd3-1075-57a5-962a-850cab37f3e1','b4c842f9-a72a-58f9-8aab-71916c6bed36'),
            ('1fc05fe9-53a8-5b29-8fb1-4f44af19735b','246e8b18-85c4-582d-a08c-16a72456e55c'),
            ('75e6bcb1-f305-579f-993b-13b052faa145','9a983b63-3633-545d-ae12-4764d3abde6a'),
            ('a9d24a57-d0d0-5b8a-98cc-5ad6bfa251ee','0f5c1976-c943-5125-976f-99250b02ea5d'),
            ('57635a88-8391-573a-b635-5a851de81b75','a6f6412a-013f-5589-9cbf-e5c94d4884ae'),
            ('924abc59-7153-5200-ad3e-01992957df02','faf03243-d9f8-541e-9f90-6f3eb33e61d2'),
            ('e4c9dfff-50b6-5410-8e80-26b8e0462383','664e7b8e-c346-5342-96d8-a12df6055286')
        ]
        for d_id, ev_id in decision_evidence_data:
            db.add(DecisionEvidence(decision_id=d_id, evidence_id=ev_id))
        db.flush()

        # Decision Versions
        db.add(DecisionVersion(
            decision_id='e4c9dfff-50b6-5410-8e80-26b8e0462383',
            version_number=1,
            statement="Expand the pilot to 20% after the initial canary gate.",
            status="superseded",
            change_reason="Superseded by 14 November readiness review requiring Payments, SRE, Risk, and Security approvals.",
            created_by="Maya Chen",
            created_at=datetime.fromisoformat("2026-10-19T09:00:00+05:30")
        ))
        db.add(DecisionVersion(
            decision_id='57635a88-8391-573a-b635-5a851de81b75',
            version_number=1,
            statement="Replace the planned 20% expansion with a 14 November readiness review requiring four team approvals.",
            status="active",
            change_reason="Adopted in Smart Routing launch gate decision meeting.",
            created_by="Maya Chen",
            created_at=datetime.fromisoformat("2026-10-29T09:30:00+05:30")
        ))
        db.flush()

        # ----------------------------------------------------
        # 10. Tasks
        # ----------------------------------------------------
        tasks_space_map = {
            '6eb3c600-aeab-5463-b98a-82d91473342b': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            'c8fec457-706c-5536-8bac-87b82ffdde81': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            'de800614-b03c-5a13-b81c-9d490b314fd8': '6e5acdd2-d7c0-58f4-abc3-bfdb9620379c',
            '99249a62-5b49-5ec1-852f-923d41572b34': '8f06b32b-668a-51ca-a0b7-0853b197e9ae',
            '8b16df68-a293-5fc7-9968-e3d75045e0d7': '79354d43-971e-542f-ad55-b1fce3290ec6',
            '91db515d-c983-57f7-b9f1-cc67a75ec2fb': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            '9197ccf0-6432-5f6a-b614-8d181a304886': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            '32ec4b3b-79fe-524a-b8fc-c6bc0840eef3': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329',
            '79b16636-777a-59d4-9a4c-0fa869348fa2': 'f1339331-f5cc-5fad-aa79-d35acef48713',
            '68ceb2d0-9215-5a41-bc9f-954c68f8857b': '8f06b32b-668a-51ca-a0b7-0853b197e9ae',
            'task-maya-001': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329',
            'task-maya-002': 'f1339331-f5cc-5fad-aa79-d35acef48713',
            'task-maya-003': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            'task-maya-004': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            'task-maya-005': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329',
        }

        tasks_data = [
            ('task-maya-001','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Coordinate 4-Team Launch Gate Readiness Review (DEC-002)","Collect and synthesize formal sign-offs from Payments (idempotency), SRE (canary observability), Risk (failover continuity), and Security (log review) before expanding beyond 5%.",'in_progress','critical','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','2026-11-14T10:00:00+05:30','69e18c75-f04d-528e-8087-1aa642142c06','a6f6412a-013f-5589-9cbf-e5c94d4884ae'),
            ('task-maya-002','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Finalize merchant pilot communication & support runbook for canary hold","Align with Sarah Kim on draft merchant explanations and pilot support runbook. Keep expansion date in draft until technical readiness review is approved.",'in_progress','high','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','2026-11-11T17:00:00+05:30','75294199-1a00-5b40-928f-75d96eaa8dda','faf03243-d9f8-541e-9f90-6f3eb33e61d2'),
            ('task-maya-003','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Audit 5% canary authorization uplift across 10 pilot merchants","Review initial authorization rate uplift (+1.8%) across the 10 pilot merchants and confirm baseline timeout frequency before the launch gate.",'in_progress','high','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','2026-11-09T17:00:00+05:30','2033cb92-95e6-5580-a51a-b199bbb8b69f','2c3825f0-290f-55f3-9e1f-12e8a7a2a13e'),
            ('task-maya-004','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Review idempotency key 72h retention and safe retry policy (DEC-014)","Review Elena Petrova and Daniel Foster's proposal to extend idempotency key retention to 72 hours (DEC-014) and verify business impact of delayed webhooks.",'todo','critical','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','2026-11-06T17:00:00+05:30','ea655bba-f14e-521d-8ec8-458fa2398acb','b4c842f9-a72a-58f9-8aab-71916c6bed36'),
            ('task-maya-005','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Enforce 5% canary pilot hold pending SRE rollback validation","Ensure traffic remains frozen at exactly 5% canary while SRE and Payments investigate processor timeout behavior.",'done','critical','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce','2026-10-31T17:00:00+05:30','2033cb92-95e6-5580-a51a-b199bbb8b69f','664e7b8e-c346-5342-96d8-a12df6055286'),
            ('6eb3c600-aeab-5463-b98a-82d91473342b','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Implement idempotency propagation across processor adapters","Carry stable idempotency keys through routing and processor adapters.",'in_progress','critical','57f3cd3a-204c-5d7e-96b4-5d382d76300f','2026-11-12T17:00:00+05:30','ea655bba-f14e-521d-8ec8-458fa2398acb','b4c842f9-a72a-58f9-8aab-71916c6bed36'),
            ('c8fec457-706c-5536-8bac-87b82ffdde81','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Document timeout classification and safe retry policy","Distinguish connection failure, explicit decline, ambiguous timeout, and reconciliation-required states.",'todo','high','3d5d0b48-d0eb-5544-a845-b7687a88e24a','2026-11-06T17:00:00+05:30','ea655bba-f14e-521d-8ec8-458fa2398acb','b4c842f9-a72a-58f9-8aab-71916c6bed36'),
            ('de800614-b03c-5a13-b81c-9d490b314fd8','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Verify risk decision propagation across processor adapters","Test risk continuity for safe retries and fail-safe behaviour when risk evaluation is unavailable.",'todo','critical','1389f28b-f89d-55ff-865d-dc595fc1a589','2026-11-12T17:00:00+05:30','2e061b40-a4e5-5f67-9b70-01ed58328916','246e8b18-85c4-582d-a08c-16a72456e55c'),
            ('99249a62-5b49-5ec1-852f-923d41572b34','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Review routing logs and traces for sensitive payment data","Inspect logs, traces, retry metadata, and debugging output for prohibited payment data.",'in_progress','critical','dbc70974-93b3-5b69-9d3b-7b3fe752165c','2026-11-10T17:00:00+05:30','35623284-e53b-538f-a88f-719ceb2ad5b2','2b9aa0e1-dc42-5e62-a9a1-6748c791e937'),
            ('8b16df68-a293-5fc7-9968-e3d75045e0d7','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Build canary monitoring dashboard and alerts","Expose p95 latency, timeout rate, error rate, traffic split, and processor outcomes.",'in_progress','high','756c8a27-bcff-5894-b1e9-d1b899ffa95a','2026-11-09T17:00:00+05:30','880f34a1-35bd-5796-8ab1-ad4d662edcec','c448f4ab-c8a8-56ba-8392-6070a259b6d7'),
            ('91db515d-c983-57f7-b9f1-cc67a75ec2fb','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Implement safe timeout classification and retry restrictions","Disable automatic cross-processor retries for ambiguous outcomes and add reconciliation handling.",'blocked','critical','57f3cd3a-204c-5d7e-96b4-5d382d76300f','2026-11-12T17:00:00+05:30','a125dfc8-e498-5898-8dfa-e4acf91fb697','0f5c1976-c943-5125-976f-99250b02ea5d'),
            ('9197ccf0-6432-5f6a-b614-8d181a304886','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Run end-to-end risk propagation tests","Validate risk decision continuity for eligible retries.",'todo','critical','1389f28b-f89d-55ff-865d-dc595fc1a589','2026-11-12T17:00:00+05:30','a125dfc8-e498-5898-8dfa-e4acf91fb697','ae6a58f9-4fd9-59c6-8993-3d00282d09f3'),
            ('32ec4b3b-79fe-524a-b8fc-c6bc0840eef3','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Validate canary metrics and rollback procedure","Exercise alert thresholds, pause behaviour, and rollback runbook in staging.",'todo','high','756c8a27-bcff-5894-b1e9-d1b899ffa95a','2026-11-13T17:00:00+05:30','69e18c75-f04d-528e-8087-1aa642142c06','b24abf70-3628-5587-9838-090e0dec1b0c'),
            ('79b16636-777a-59d4-9a4c-0fa869348fa2','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Prepare merchant pilot communication and support runbook","Draft merchant explanation, support escalation path, and incident communication template.",'in_progress','medium','673e2dfb-cfbe-52f6-9a20-075b8fd542e0','2026-11-13T17:00:00+05:30','75294199-1a00-5b40-928f-75d96eaa8dda','b2c23255-e663-5e56-955c-0feed9947a9b'),
            ('68ceb2d0-9215-5a41-bc9f-954c68f8857b','fadde36c-96f9-5509-aa29-1a038a4b2b7c',"Complete security review evidence for the routing service","Document data flows, tokenised references, access controls, and log review.",'todo','critical','5cbe07bd-160a-5978-9dbb-e12281f68dfe','2026-11-13T17:00:00+05:30','35623284-e53b-538f-a88f-719ceb2ad5b2','227bd71b-b9bb-55f7-97c3-227117acb647')
        ]
        for t_id, p_id, title, desc, status, prio, owner_id, due_at, m_id, ev_id in tasks_data:
            s_id = tasks_space_map[t_id]
            db.add(Task(
                id=t_id,
                organization_id=org_id,
                space_id=s_id,
                meeting_id=m_id,
                title=title,
                description=desc,
                assignee_name=user_name_map.get(owner_id, "Elena Petrova"),
                status=status,
                priority=prio,
                due_date=datetime.fromisoformat(due_at),
                evidence_quote=evidence_quote_map.get(ev_id),
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30"),
                updated_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 11. Blockers
        # ----------------------------------------------------
        blockers_space_map = {
            'd77ecd74-4324-591e-ab80-d96bc1581f10': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            '1473863e-e969-539d-a7e1-3742d13c6b3d': 'c51d1349-7c9e-5b7c-ae96-6469d80b9790',
            '1f424f62-5e37-5a3f-94c9-98ee1e2b70e2': 'aec6e03e-fddc-5b51-bbbd-ec71e566b329',
            '4187b711-1dd1-5971-a177-6cd23644a701': 'f1339331-f5cc-5fad-aa79-d35acef48713'
        }

        blockers_data = [
            ('d77ecd74-4324-591e-ab80-d96bc1581f10','a125dfc8-e498-5898-8dfa-e4acf91fb697',"Ambiguous processor timeouts can trigger unsafe retries","A timeout does not establish whether the original processor completed authorisation. Unsafe retries may create duplicate authorisation attempts.",'active','critical',"Daniel Foster","Some requests are retried even though we cannot tell whether the original processor completed authorisation. Disable automatic cross-processor retries for ambiguous outcomes."),
            ('1473863e-e969-539d-a7e1-3742d13c6b3d','a125dfc8-e498-5898-8dfa-e4acf91fb697',"Risk decision continuity is not verified end to end","Risk controls must remain effective across eligible retry paths; integration evidence is pending.",'active','critical',"Omar Hassan","Routing to a secondary processor must not bypass the risk decision for the original transaction."),
            ('1f424f62-5e37-5a3f-94c9-98ee1e2b70e2','69e18c75-f04d-528e-8087-1aa642142c06',"Canary monitoring and rollback validation are incomplete","Expansion remains paused until metrics and rollback behaviour are validated.",'active','high',"Priya Nair","Timeout behaviour is not ready. Risk verification and monitoring validation are also incomplete."),
            ('4187b711-1dd1-5971-a177-6cd23644a701','75294199-1a00-5b40-928f-75d96eaa8dda',"Merchant support readiness is incomplete","Merchant communication and escalation procedures must be ready before expansion.",'active','medium',"Sarah Kim","Merchants need a clear explanation and a support runbook for payment failures during the pilot.")
        ]
        for b_id, m_id, title, desc, status, sev, rep_by, ev_quote in blockers_data:
            s_id = blockers_space_map[b_id]
            db.add(Blocker(
                id=b_id,
                organization_id=org_id,
                space_id=s_id,
                meeting_id=m_id,
                description=f"{title}: {desc}",
                severity=sev,
                status=status,
                reported_by=rep_by,
                evidence_quote=ev_quote,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 12. Entity Relationships (Explicit Graph Edges)
        # ----------------------------------------------------
        edges_data = [
            # Supersedes edge
            ('e4c9dfff-50b6-5410-8e80-26b8e0462383', '57635a88-8391-573a-b635-5a851de81b75', 'SUPERSEDES', 'decision', 'decision', 0.98, 'Replaced by 14 Nov readiness gate'),
            # Blocker triggers decision
            ('d77ecd74-4324-591e-ab80-d96bc1581f10', 'a9d24a57-d0d0-5b8a-98cc-5ad6bfa251ee', 'TRIGGERS', 'blocker', 'decision', 0.98, 'Timeout ambiguity triggered pause'),
            # Blocker mitigated by tasks
            ('d77ecd74-4324-591e-ab80-d96bc1581f10', '91db515d-c983-57f7-b9f1-cc67a75ec2fb', 'MITIGATED_BY', 'blocker', 'task', 0.96, 'Safe timeout restrictions'),
            ('1473863e-e969-539d-a7e1-3742d13c6b3d', '9197ccf0-6432-5f6a-b614-8d181a304886', 'MITIGATED_BY', 'blocker', 'task', 0.96, 'Risk propagation tests'),
            ('1f424f62-5e37-5a3f-94c9-98ee1e2b70e2', '32ec4b3b-79fe-524a-b8fc-c6bc0840eef3', 'MITIGATED_BY', 'blocker', 'task', 0.96, 'Canary rollback validation'),
            ('4187b711-1dd1-5971-a177-6cd23644a701', '79b16636-777a-59d4-9a4c-0fa869348fa2', 'MITIGATED_BY', 'blocker', 'task', 0.96, 'Merchant runbook prep'),
            # Cross-space AFFECTS & BLOCKS
            ('d77ecd74-4324-591e-ab80-d96bc1581f10', 'aec6e03e-fddc-5b51-bbbd-ec71e566b329', 'BLOCKS', 'blocker', 'space', 0.99, 'Blocks Product 20% rollout'),
            ('57635a88-8391-573a-b635-5a851de81b75', 'c51d1349-7c9e-5b7c-ae96-6469d80b9790', 'AFFECTS', 'decision', 'space', 0.98, 'Requires Payments review'),
            ('57635a88-8391-573a-b635-5a851de81b75', '79354d43-971e-542f-ad55-b1fce3290ec6', 'AFFECTS', 'decision', 'space', 0.98, 'Requires SRE review'),
            ('57635a88-8391-573a-b635-5a851de81b75', '6e5acdd2-d7c0-58f4-abc3-bfdb9620379c', 'AFFECTS', 'decision', 'space', 0.98, 'Requires Risk review'),
            ('57635a88-8391-573a-b635-5a851de81b75', '8f06b32b-668a-51ca-a0b7-0853b197e9ae', 'AFFECTS', 'decision', 'space', 0.98, 'Requires Security review')
        ]
        for src, tgt, rel, s_type, t_type, conf, notes in edges_data:
            db.add(EntityRelationship(
                organization_id=org_id,
                source_type=s_type,
                source_id=src,
                target_type=t_type,
                target_id=tgt,
                relationship_type=rel,
                confidence_score=conf,
                status="confirmed",
                notes=notes,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 13. Open Questions
        # ----------------------------------------------------
        questions_data = [
            ('772b68b8-0dec-51f5-92d4-4fcb155d9df5',"How will the routing service reconcile an ambiguous timeout before retry?",'ea655bba-f14e-521d-8ec8-458fa2398acb','3d5d0b48-d0eb-5544-a845-b7687a88e24a'),
            ('d19bbf49-9ee8-58c8-a2fa-ac97e0a1d38d',"What evidence is required to approve the 14 November readiness gate?",'69e18c75-f04d-528e-8087-1aa642142c06','3fc01550-c7e4-55ad-bbf4-3c6599fb57ce'),
            ('2bdd92d8-8672-5be9-a793-802e405ee49b',"Which merchant-facing failure scenarios require proactive communication?",'75294199-1a00-5b40-928f-75d96eaa8dda','673e2dfb-cfbe-52f6-9a20-075b8fd542e0')
        ]
        for q_id, q_text, m_id, u_id in questions_data:
            db.add(OpenQuestion(
                id=q_id,
                organization_id=org_id,
                question=q_text,
                status="open",
                source_meeting_id=m_id,
                owner_user_id=u_id,
                created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
            ))
        db.flush()

        # ----------------------------------------------------
        # 14. Finding & Finding Records
        # ----------------------------------------------------
        finding_id = "e5882da4-f92b-5268-94b0-2782be2a0967"
        db.add(Finding(
            id=finding_id,
            organization_id=org_id,
            finding_type="cross_team_dependency_risk",
            severity="critical",
            title="Smart Routing expansion is blocked by unresolved retry and readiness gates",
            explanation="The pilot exposed ambiguous processor timeout handling that can cause duplicate authorisation attempts. Expansion also depends on risk propagation tests, canary monitoring validation, security review, and merchant support readiness.",
            confidence=0.98,
            status="confirmed",
            source_meeting_id="69e18c75-f04d-528e-8087-1aa642142c06",
            created_at=datetime.fromisoformat("2026-10-31T09:00:00+05:30")
        ))
        db.flush()

        finding_records_data = [
            ('blocker','d77ecd74-4324-591e-ab80-d96bc1581f10','launch_gate'),
            ('blocker','1473863e-e969-539d-a7e1-3742d13c6b3d','launch_gate'),
            ('blocker','1f424f62-5e37-5a3f-94c9-98ee1e2b70e2','launch_gate'),
            ('blocker','4187b711-1dd1-5971-a177-6cd23644a701','launch_gate'),
            ('decision','57635a88-8391-573a-b635-5a851de81b75','current_launch_decision'),
            ('task','91db515d-c983-57f7-b9f1-cc67a75ec2fb','required_action'),
            ('task','9197ccf0-6432-5f6a-b614-8d181a304886','required_action'),
            ('task','32ec4b3b-79fe-524a-b8fc-c6bc0840eef3','required_action'),
            ('task','68ceb2d0-9215-5a41-bc9f-954c68f8857b','required_action')
        ]
        for r_type, r_id, rel in finding_records_data:
            db.add(FindingRecord(
                finding_id=finding_id,
                record_type=r_type,
                record_id=r_id,
                relationship=rel
            ))
        db.flush()

        # ----------------------------------------------------
        # 15. Pending Approval Request
        # ----------------------------------------------------
        db.add(ApprovalRequest(
            id='63cbc033-23af-5c1b-826e-fa3950dc57bc',
            organization_id=org_id,
            requested_by='3fc01550-c7e4-55ad-bbf4-3c6599fb57ce',
            reviewed_by=None,
            target_type='decision',
            target_id='57635a88-8391-573a-b635-5a851de81b75',
            proposed_action="Approve expansion beyond the 5% canary only after Payments, SRE, Risk, and Security readiness evidence is reviewed.",
            status="pending",
            created_at=datetime.fromisoformat("2026-10-29T11:00:00+05:30")
        ))

        # ----------------------------------------------------
        # 16. Audit Events
        # ----------------------------------------------------
        db.add_all([
            AuditEvent(
                organization_id=org_id,
                user_id='3fc01550-c7e4-55ad-bbf4-3c6599fb57ce',
                user_name='Maya Chen',
                action='supersede_decision',
                entity_type='decision',
                entity_id='e4c9dfff-50b6-5410-8e80-26b8e0462383',
                details_json='{"reason": "Superseded 20% rollout commitment with 14 November readiness review."}',
                created_at=datetime.fromisoformat("2026-10-29T09:30:00+05:30")
            ),
            AuditEvent(
                organization_id=org_id,
                user_id='3d5d0b48-d0eb-5544-a845-b7687a88e24a',
                user_name='Daniel Foster',
                action='declare_blocker',
                entity_type='blocker',
                entity_id='d77ecd74-4324-591e-ab80-d96bc1581f10',
                details_json='{"severity": "critical", "reason": "Ambiguous processor timeouts trigger duplicate authorization hazard."}',
                created_at=datetime.fromisoformat("2026-10-28T15:00:00+05:30")
            )
        ])

        db.commit()
        print("MeridianPay dataset successfully seeded into CONFLUENCE database!")

        # ----------------------------------------------------
        # 17. Synchronize Semantic Embeddings
        # ----------------------------------------------------
        print("Indexing dense semantic embeddings for memory network...")
        from backend.app.services.embedding_service import EmbeddingService
        synced = EmbeddingService.sync_all_embeddings(db)
        print(f"Dense vector embeddings generated: {synced}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
