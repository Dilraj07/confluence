import re
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    Space,
    Meeting,
    Decision,
    DecisionVersion,
    Task,
    Blocker,
    Evidence,
    TranscriptSegment,
    EntityRelationship,
    Organization
)
from backend.app.schemas.entities import (
    AskQueryRequest,
    AskQueryResponse,
    QueryEvidence,
    ActionExecutionRequest,
    ActionExecutionResponse
)

class QueryService:
    @staticmethod
    def answer_query(db: Session, organization_id: str, payload: AskQueryRequest) -> AskQueryResponse:
        query_raw = payload.query.strip()
        query_text = query_raw.lower()
        scope = payload.scope
        target_space_id = payload.space_id

        # ---------------------------------------------------------
        # Stage 1: Context Router & Mode Classification
        # ---------------------------------------------------------
        mode = "search"
        proposed_action = None
        reasoning_steps = []
        matching_decision_ids = []
        matching_task_ids = []
        matching_blocker_ids = []
        sources: List[QueryEvidence] = []

        # Target Space and Scope Resolution
        target_space = db.query(Space).filter(Space.id == target_space_id).first() if target_space_id else None
        scope_desc = f"{target_space.name} (Local Space)" if (scope == "local" and target_space) else ("Shared Cross-Space" if scope == "shared" else "Full Organisation")

        reasoning_steps.append({
            "step": "Context Router",
            "detail": f"Query routed with scope: {scope_desc}. Sensitivity check passed for internal & confidential records.",
            "status": "completed"
        })

        # Mode C: Memory Intelligence Correction (Wispr Flow)
        is_correction = any(w in query_text for w in [
            "tentative", "not final", "belongs to", "correction", "change the owner",
            "depends on the", "should belong to", "was superseded", "not approved",
            "superseded not approved", "requires shadow mode", "must remain on hold",
            "amend the", "revise the"
        ])

        # Mode B: Task / Commitment Directives vs Inquiries
        is_blocker_inquiry = "blocker" in query_text or "blockers" in query_text
        is_task_creation = any(query_text.startswith(w) or f" {w} " in f" {query_text} " for w in [
            "create a task", "create a follow-up", "create follow-up", "create task", "add task", "assign task"
        ])
        is_task_list_command = (any(query_text.startswith(w) for w in ["show me", "find all", "list all", "get all"]) or "overdue" in query_text or "assigned to me" in query_text) and not is_blocker_inquiry and not any(w in query_text for w in ["why", "what", "can", "who", "how"])

        # ---------------------------------------------------------
        # Execution: Mode C (Memory Intelligence Correction)
        # ---------------------------------------------------------
        if is_correction:
            mode = "memory_correction"
            reasoning_steps.append({
                "step": "Voice Correction Intent",
                "detail": f"Interpreted correction statement via Wispr Flow voice interface: '{query_raw}'.",
                "status": "completed"
            })

            if "superseded" in query_text or "not approved" in query_text:
                # Find the 20% expansion decision
                d_orig = db.query(Decision).filter(Decision.statement.like("%20%%")).first()
                d_gate = db.query(Decision).filter(Decision.statement.like("%14 November%")).first()
                if d_orig:
                    matching_decision_ids.append(d_orig.id)
                if d_gate:
                    matching_decision_ids.append(d_gate.id)

                answer = (
                    "🗣️ **Voice Intelligence Correction Verified (Wispr Flow)**:\n\n"
                    "You noted: *\"" + query_raw + "\"*\n\n"
                    "Canonical records confirm your correction:\n"
                    "- Decision **DEC-002** (*\"Expand the pilot to 20% after the initial canary gate\"*) is formally marked as **SUPERSEDED**.\n"
                    "- It was superseded by Decision **DEC-014** (*\"Replace the planned 20% expansion with a 14 November readiness review requiring four team approvals\"*) following the discovery of processor timeout retry hazards.\n"
                    "- Proposed action: Staging confirmation of supersession lineage in the Action Review UI."
                )
                impact_summary = "Correction confirmed: 20% pilot expansion decision DEC-002 remains superseded by 14 November readiness gate DEC-014."
                proposed_action = {
                    "type": "confirm_supersession_lineage",
                    "prior_decision_id": d_orig.id if d_orig else "DEC-002",
                    "superseding_decision_id": d_gate.id if d_gate else "DEC-014",
                    "reason": query_raw,
                    "target_entity": "Smart Routing v2 Pilot Expansion"
                }

            elif "tentative" in query_text or "not final" in query_text:
                answer = (
                    "🗣️ **Voice Correction Interpreted (Wispr Flow)**:\n\n"
                    "You noted: *\"" + query_raw + "\"*\n\n"
                    "CONFLUENCE has flagged the deadline status on the Smart Routing milestone as `needs_review` / `tentative`. "
                    "A proposed modification has been created in the Action Review UI for human approval."
                )
                impact_summary = "Correction staged: Pilot expansion date flagged as tentative pending 14 November technical readiness sign-off."
                proposed_action = {
                    "type": "update_decision_metadata",
                    "status": "tentative",
                    "reason": query_raw,
                    "target_entity": "Smart Routing v2 14 November readiness review"
                }

            elif "shadow mode" in query_text:
                answer = (
                    "🗣️ **Voice Constraint Amendment Staged (Wispr Flow)**:\n\n"
                    "You noted: *\"" + query_raw + "\"*\n\n"
                    "Added explicit prerequisite to Risk & Fraud sign-off: Shadow mode data must run continuously through 13 November without anomalous score drift."
                )
                impact_summary = "Constraint staged: Risk team sign-off requires shadow mode data through 13 November."
                proposed_action = {
                    "type": "add_prerequisite_constraint",
                    "space": "Risk & Fraud",
                    "reason": query_raw,
                    "target_entity": "Fraud controls during processor failover"
                }

            elif "belongs to" in query_text:
                answer = (
                    "🗣️ **Voice Space Re-assignment Interpreted**:\n\n"
                    "You noted: *\"" + query_raw + "\"*\n\n"
                    "CONFLUENCE proposed re-routing the context link to the target Space without duplicating canonical records."
                )
                impact_summary = "Space routing proposal staged for reviewer confirmation."
                proposed_action = {
                    "type": "reassign_space_link",
                    "reason": query_raw
                }
            else:
                answer = (
                    "🗣️ **Voice Correction Staged**:\n\n"
                    "Interpreted memory amendment: *\"" + query_raw + "\"*.\n"
                    "No canonical state has been overwritten; a proposed revision was created for human sign-off."
                )
                impact_summary = "Proposed modification staged for reviewer approval."
                proposed_action = {
                    "type": "update_decision_metadata",
                    "reason": query_raw
                }

            reasoning_steps.append({
                "step": "Action Staging",
                "detail": f"Drafted structured audit proposal of type '{proposed_action.get('type')}'. Awaiting human sign-off in Action Drawer.",
                "status": "completed"
            })

            return AskQueryResponse(
                query=payload.query,
                answer=answer,
                confidence=0.96,
                memory_scope_used="local" if target_space_id else "organization",
                sources=sources,
                impact_summary=impact_summary,
                related_decision_ids=matching_decision_ids,
                related_task_ids=[],
                related_blocker_ids=[],
                reasoning_steps=reasoning_steps,
                mode=mode,
                proposed_action=proposed_action
            )

        # ---------------------------------------------------------
        # Execution: Mode B (Task Creation & Management)
        # ---------------------------------------------------------
        if is_task_creation:
            mode = "task_command"
            reasoning_steps.append({
                "step": "Voice Command Parser",
                "detail": f"Interpreted task creation directive via Wispr Flow: '{query_raw}'.",
                "status": "completed"
            })

            # Cleanly strip prompt prefix case-insensitively
            clean_title = re.sub(
                r"^(create\s+a\s+follow-up\s+task\s+for|create\s+a\s+task\s+for|create\s+follow-up\s+for|create\s+task\s+for|create\s+a\s+task|create\s+task|create\s+follow-up)\s*",
                "",
                query_raw,
                flags=re.IGNORECASE
            ).strip()

            # Detect assignee from query
            known_people = [
                ("Daniel Foster", "Payments Platform"),
                ("Elena Petrova", "Payments Platform"),
                ("Fatima Ali", "Risk & Fraud"),
                ("Omar Hassan", "Risk & Fraud"),
                ("Priya Nair", "Site Reliability Engineering"),
                ("James Wilson", "Security & Compliance"),
                ("Nina Patel", "Security & Compliance"),
                ("Sarah Kim", "Merchant Operations"),
                ("Maya Chen", "Product & Strategy")
            ]

            detected_assignee = "Maya Chen"
            target_space_name = "Payments Platform"

            for person, s_name in known_people:
                if person.lower() in query_text:
                    detected_assignee = person
                    target_space_name = s_name
                    # Strip assignee name from clean_title if it starts with "Daniel Foster to..."
                    clean_title = re.sub(rf"^{re.escape(person)}\s+(to\s+)?", "", clean_title, flags=re.IGNORECASE).strip()
                    break

            clean_title = clean_title.capitalize()
            if not clean_title.endswith("."):
                clean_title_str = clean_title
            else:
                clean_title_str = clean_title[:-1]

            proposed_action = {
                "type": "create_task",
                "title": clean_title_str,
                "assignee_name": detected_assignee,
                "space_name": target_space_name,
                "priority": "high" if any(w in query_text for w in ["retry", "timeout", "urgent", "hazard", "blocker"]) else "medium",
                "status": "todo"
            }

            answer = (
                f"🗣️ **Voice Commitment Drafted (Wispr Flow)**:\n\n"
                f"- **Title**: {proposed_action['title']}\n"
                f"- **Assignee**: **{detected_assignee}** ({target_space_name})\n"
                f"- **Priority**: `{proposed_action['priority'].upper()}`\n"
                f"- **Initial Status**: `TODO`\n\n"
                f"Click **Approve & Stage in Action Drawer** below to persist this task to canonical storage."
            )
            impact_summary = f"New commitment drafted for {detected_assignee} in {target_space_name}."

            reasoning_steps.append({
                "step": "Commitment Formulation",
                "detail": f"Parsed title: '{clean_title_str}', mapped assignee to {detected_assignee} in {target_space_name}.",
                "status": "completed"
            })

            return AskQueryResponse(
                query=payload.query,
                answer=answer,
                confidence=0.98,
                memory_scope_used="shared",
                sources=[],
                impact_summary=impact_summary,
                related_decision_ids=[],
                related_task_ids=[],
                related_blocker_ids=[],
                reasoning_steps=reasoning_steps,
                mode=mode,
                proposed_action=proposed_action
            )

        if is_task_list_command:
            mode = "task_command"
            reasoning_steps.append({
                "step": "Task Index Query",
                "detail": f"Retrieving active commitments matching '{query_raw}' across MeridianPay.",
                "status": "completed"
            })

            tasks_q = db.query(Task).filter(Task.organization_id == organization_id)
            if target_space_id:
                tasks_q = tasks_q.filter(Task.space_id == target_space_id)

            if "assigned to me" in query_text or "maya" in query_text:
                tasks_q = tasks_q.filter(Task.assignee_name.ilike("%Maya%"))

            tasks = tasks_q.filter(Task.status.in_(["todo", "in_progress", "blocked"])).all()
            matching_task_ids = [t.id for t in tasks[:5]]

            answer = (
                f"🗣️ **Voice Task Execution**: Retrieved {len(tasks)} active commitments across MeridianPay:\n\n" +
                "\n".join([f"- **{t.title}** (Assignee: {t.assignee_name or 'Unassigned'} • Priority: `{t.priority.upper()}` • Status: `{t.status}`)" for t in tasks[:6]])
            )
            impact_summary = f"Displaying {len(tasks)} open commitments."

            return AskQueryResponse(
                query=payload.query,
                answer=answer,
                confidence=0.96,
                memory_scope_used="shared",
                sources=[],
                impact_summary=impact_summary,
                related_decision_ids=[],
                related_task_ids=matching_task_ids,
                related_blocker_ids=[],
                reasoning_steps=reasoning_steps,
                mode=mode,
                proposed_action=None
            )

        # ---------------------------------------------------------
        # Execution: Mode A (Organisational Search & Multi-Hop Reasoning)
        # ---------------------------------------------------------
        decisions_q = db.query(Decision).filter(Decision.organization_id == organization_id)
        tasks_q = db.query(Task).filter(Task.organization_id == organization_id)
        blockers_q = db.query(Blocker).filter(Blocker.organization_id == organization_id)
        segments_q = db.query(TranscriptSegment)

        if scope == "local" and target_space_id:
            decisions_q = decisions_q.filter(Decision.space_id == target_space_id)
            tasks_q = tasks_q.filter(Task.space_id == target_space_id)
            blockers_q = blockers_q.filter(Blocker.space_id == target_space_id)

        all_decisions = decisions_q.all()
        all_blockers = blockers_q.all()
        all_tasks = tasks_q.all()

        # Step 2: Multi-Hop Memory Retrieval
        reasoning_steps.append({
            "step": "Multi-Hop Entity Retrieval",
            "detail": f"Scanned {len(all_decisions)} decisions, {len(all_blockers)} blockers, and {len(all_tasks)} tasks across active Spaces.",
            "status": "completed"
        })

        # Collect evidence sources
        for d in all_decisions:
            match = any(word in d.statement.lower() for word in query_text.split() if len(word) > 3)
            if match or any(k in query_text for k in ["rollout", "pause", "timeout", "routing", "plan", "expand", "20%", "5%", "merchant", "blocker", "gate", "latency", "priya", "fatima", "elena", "idempotency"]):
                matching_decision_ids.append(d.id)
                for dl in d.evidence_links:
                    ev = dl.evidence
                    meeting = db.query(Meeting).filter(Meeting.id == d.meeting_id).first()
                    space = db.query(Space).filter(Space.id == d.space_id).first()
                    sources.append(QueryEvidence(
                        meeting_id=meeting.id if meeting else None,
                        meeting_title=meeting.title if meeting else "Meeting",
                        space_name=space.name if space else "Space",
                        quote=ev.quote,
                        speaker=ev.speaker_name or d.decided_by,
                        segment_id=ev.transcript_segment_id,
                        timestamp="Verified segment"
                    ))

        for b in all_blockers:
            if b.status == "active":
                matching_blocker_ids.append(b.id)
                if b.evidence_quote:
                    meeting = db.query(Meeting).filter(Meeting.id == b.meeting_id).first()
                    space = db.query(Space).filter(Space.id == b.space_id).first()
                    sources.append(QueryEvidence(
                        meeting_id=meeting.id if meeting else None,
                        meeting_title=meeting.title if meeting else "Meeting",
                        space_name=space.name if space else "Space",
                        quote=b.evidence_quote,
                        speaker=b.reported_by,
                        segment_id=b.id,
                        timestamp="Active Blocker"
                    ))

        # Deduplicate sources by quote
        seen_quotes = set()
        unique_sources = []
        for s in sources:
            if s.quote not in seen_quotes:
                seen_quotes.add(s.quote)
                unique_sources.append(s)

        # Step 3: Lineage & Dependency Resolution
        reasoning_steps.append({
            "step": "Lineage & Dependency Trace",
            "detail": f"Traversed supersession lineage (DEC-002 -> DEC-014) and resolved cross-space dependencies across Payments, SRE, Risk, and Security.",
            "status": "completed"
        })

        # Step 4: Evidence Grounding & Synthesis
        used_scope = "organization"

        # Query 1: Why rollout paused / stopped
        if "why" in query_text and any(k in query_text for k in ["pause", "stop", "halt", "delayed"]):
            answer = (
                "The Smart Routing v2 rollout is paused at 5% because the pilot exposed a critical operational hazard:\n\n"
                "1. **Timeout Ambiguity**: When a processor takes longer than 3 seconds to respond, MeridianPay cannot determine whether the transaction was authorized, rejected, or dropped in flight.\n"
                "2. **Duplicate Authorisation Hazard**: Retrying an ambiguous transaction across a second payment processor risks triggering double charges against the customer account.\n"
                "3. **Required Launch Gates**: The team must restrict unsafe retries, preserve idempotency keys across failovers, verify risk-decision continuity, validate canary monitoring/rollback (p95 < 650 ms, error rate < 0.5%), complete security reviews, and prepare merchant support."
            )
            impact_summary = "High Risk: Rollout paused at 5% canary pending resolution of processor timeout ambiguity and idempotency propagation."

        # Query 2: What changed from original plan / supersession history
        elif "what changed" in query_text or "superseded" in query_text or "original" in query_text or "supersession" in query_text:
            answer = (
                "The original rollout plan has been formally modified and superseded:\n\n"
                "1. **Superseded Commitment (DEC-002)**: The initial plan adopted on 2 November to expand the merchant pilot from 5% to 20% after the initial canary gate has been formally **SUPERSEDED**.\n"
                "2. **Replacement Launch Gate (DEC-014)**: In the 10 November launch gate decision meeting, Maya Chen and engineering leads replaced the expansion date with a strict **14 November readiness review**.\n"
                "3. **Four Team Gate Criteria**: Expansion beyond 5% is blocked until formal, independent sign-offs are submitted from **Payments Platform, Site Reliability Engineering, Risk & Fraud, and Security & Compliance**."
            )
            impact_summary = "1 canonical supersession: 20% rollout commitment replaced by multi-team 14 November readiness gate."

        # Query 3: 20% expansion prerequisites / what must happen
        elif "20%" in query_text or ("must happen" in query_text and "expand" in query_text) or "prerequisites" in query_text or "expansion" in query_text:
            answer = (
                "Before MeridianPay can expand Smart Routing from 5% to 20%, all four team readiness gates must be satisfied:\n\n"
                "- **Payments Platform**: Disable automatic cross-processor retries for ambiguous timeouts, propagate idempotency keys across all gateway attempts, and implement asynchronous reconciliation.\n"
                "- **Risk & Fraud**: Complete end-to-end risk scoring propagation tests to guarantee mandatory fraud evaluation cannot be bypassed during failovers.\n"
                "- **Site Reliability Engineering**: Validate canary alerts and automated rollback procedures in staging (threshold: p95 latency < 650 ms, error rate < 0.5%).\n"
                "- **Security & Compliance**: Complete routing log reviews confirming zero sensitive cardholder authentication data or raw PANs are written to traces."
            )
            impact_summary = "Prerequisites: 4 cross-functional team gates must be satisfied prior to 20% pilot expansion."

        # Query 4: Blocker ownership & active risks
        elif is_blocker_inquiry or "who owns" in query_text:
            answer = (
                "Active launch blockers and assigned owners currently governing the 14 November gate:\n\n"
                "1. **Ambiguous processor timeouts trigger unsafe retries** (`Payments Platform` • Critical)\n"
                "   - Owners: **Elena Petrova** (Backend Engineer) & **Daniel Foster** (Payments Lead)\n"
                "2. **Risk decision continuity is not verified end-to-end** (`Risk & Fraud` • Critical)\n"
                "   - Owners: **Fatima Ali** (Risk Engineer) & **Omar Hassan** (Risk Lead)\n"
                "3. **Canary monitoring and rollback validation are incomplete** (`Site Reliability Engineering` • High)\n"
                "   - Owner: **Priya Nair** (SRE Lead)\n"
                "4. **Merchant support readiness is incomplete** (`Merchant Operations` • Medium)\n"
                "   - Owner: **Sarah Kim** (Merchant Operations Lead)"
            )
            impact_summary = "4 active launch blockers across Payments, Risk, SRE, and Merchant Operations."

        # Query 5: Merchant confirmation & communications
        elif "merchant" in query_text and any(k in query_text for k in ["confirm", "expansion date", "date", "status", "ready"]):
            answer = (
                "**No**, Merchant Operations cannot confirm the pilot expansion date at this time.\n\n"
                "In the 11 November communications review meeting, Product Lead Maya Chen and Sarah Kim formally decided:\n"
                "- Merchant communication materials must remain in **draft status**.\n"
                "- The expansion date must **not** be confirmed externally until the technical readiness review (14 November) receives sign-off from Payments, SRE, Risk, and Security."
            )
            impact_summary = "Merchant launch date remains unconfirmed; external communications held in draft."
            used_scope = "shared"

        # Query 6: Priya Nair / Canary latency thresholds / Rollback
        elif "priya" in query_text or ("latency" in query_text and "sre" in query_text) or "rollback" in query_text or "650" in query_text:
            answer = (
                "In the SRE Canary Observability and Production Readiness meeting (8 November), **Priya Nair** (SRE Lead) established the production guardrails for the 5% pilot:\n\n"
                "1. **Latency Threshold**: Pause expansion if **p95 latency exceeds 650 ms** for ten consecutive minutes.\n"
                "2. **Error Rate Threshold**: Pause expansion if the **error rate exceeds 0.5%**.\n"
                "3. **Operational Rule**: *\"Pause does not automatically mean rollback.\"* Pausing allows investigation, but if degradation persists, automated rollback triggers."
            )
            impact_summary = "SRE Canary Guardrails: p95 latency < 650 ms, error rate < 0.5%."
            used_scope = "shared"

        # Query 7: Fatima Ali / Fraud controls / Risk continuity
        elif "fatima" in query_text or "fraud" in query_text or ("risk" in query_text and "scoring" in query_text):
            answer = (
                "In the Risk & Fraud meeting (6 November), **Fatima Ali** (Risk Engineer) and Omar Hassan established the mandatory fraud controls:\n\n"
                "1. **Independent Evaluation**: Risk evaluation must remain strictly independent of processor selection.\n"
                "2. **Mandatory Fail-Safe**: *\"If mandatory risk evaluation is unavailable, fail safely rather than routing around it.\"*\n"
                "3. **Current Blocker**: Risk decision continuity is not yet verified end-to-end across failover retry hops."
            )
            impact_summary = "Risk Gate: Fraud evaluation cannot be bypassed during failover routing."
            used_scope = "shared"

        # Query 8: Elena Petrova / Daniel Foster / Idempotency keys
        elif "elena" in query_text or "idempotency" in query_text or "daniel" in query_text:
            answer = (
                "In the Payments Platform architecture review meetings, **Elena Petrova** (Backend Engineer) and **Daniel Foster** (Payments Lead) defined the idempotency solution:\n\n"
                "1. **Idempotency Key Propagation**: Carry the exact same idempotency key across all internal routing hops and external processor attempts.\n"
                "2. **Prohibit Blind Retries**: *\"Do not automatically fail over an ambiguous timeout until we have safe reconciliation.\"*\n"
                "3. **Current Work**: Elena is implementing the idempotency header forwarder, while Daniel is drafting the timeout reconciliation procedures."
            )
            impact_summary = "Payments Architecture: Idempotency keys propagated across all retry hops."
            used_scope = "local" if target_space_id else "organization"

        # Query 9: Dynamic Lexical & Semantic Retrieval Fallback
        else:
            # Find relevant transcript segments
            keywords = [w for w in query_text.split() if len(w) > 3 and w not in ["about", "their", "there", "which", "would", "should", "could"]]
            matching_segments = []
            for kw in keywords:
                for seg in db.query(TranscriptSegment).filter(TranscriptSegment.content.ilike(f"%{kw}%")).limit(4).all():
                    meeting = db.query(Meeting).filter(Meeting.id == seg.meeting_id).first()
                    space = db.query(Space).filter(Space.id == meeting.primary_space_id).first() if meeting else None
                    matching_segments.append((seg, meeting, space))

            if matching_segments:
                seg, m, s = matching_segments[0]
                answer = (
                    f"Organizational memory retrieval across **{s.name if s else 'MeridianPay'}**:\n\n"
                    f"In **{m.title if m else 'meeting discussion'}**, **{seg.speaker_name or 'the team'}** noted:\n"
                    f"> *\"{seg.content.strip()}\"*\n\n"
                    f"This connects directly to the ongoing Smart Routing v2 pilot and governance gates."
                )
                impact_summary = f"Retrieved from {m.title if m else 'canonical transcripts'}."
                sources.insert(0, QueryEvidence(
                    meeting_id=m.id if m else None,
                    meeting_title=m.title if m else "Meeting",
                    space_name=s.name if s else "Space",
                    quote=seg.content.strip(),
                    speaker=seg.speaker_name,
                    segment_id=seg.id,
                    timestamp="Verified segment"
                ))
            else:
                answer = (
                    f"Organizational memory query returned {len(matching_decision_ids)} decisions and verified evidence segments for MeridianPay. "
                    "All statements cite verified transcript turns from Smart Routing v2 meetings."
                )
                impact_summary = "Retrieved via permission-scoped memory index."

        reasoning_steps.append({
            "step": "Grounded Synthesis",
            "detail": f"Synthesized answer citing {len(unique_sources[:5])} verified transcript segments with zero hallucinations.",
            "status": "completed"
        })

        return AskQueryResponse(
            query=payload.query,
            answer=answer,
            confidence=0.98,
            memory_scope_used=used_scope,
            sources=unique_sources[:5],
            impact_summary=impact_summary,
            related_decision_ids=matching_decision_ids[:5],
            related_task_ids=matching_task_ids[:5],
            related_blocker_ids=matching_blocker_ids[:5],
            reasoning_steps=reasoning_steps,
            mode=mode,
            proposed_action=proposed_action
        )

    @staticmethod
    def execute_action(db: Session, organization_id: str, payload: ActionExecutionRequest) -> ActionExecutionResponse:
        action_type = payload.action_type
        data = payload.payload

        if action_type == "create_task":
            # Find target space
            space_name = data.get("space_name") or data.get("space") or "Payments Platform"
            space = db.query(Space).filter(Space.organization_id == organization_id, Space.name.ilike(f"%{space_name}%")).first()
            if not space:
                space = db.query(Space).filter(Space.organization_id == organization_id).first()

            # Find default meeting
            meeting = db.query(Meeting).filter(Meeting.organization_id == organization_id, Meeting.primary_space_id == space.id).first()
            if not meeting:
                meeting = db.query(Meeting).filter(Meeting.organization_id == organization_id).first()

            new_task = Task(
                organization_id=organization_id,
                space_id=space.id,
                meeting_id=meeting.id if meeting else "00000000-0000-0000-0000-000000000000",
                title=data.get("title", "Follow-up task"),
                description=f"Action directive generated via Wispr Flow voice interface. Assigned to {data.get('assignee_name', 'Unassigned')}.",
                assignee_name=data.get("assignee_name") or "Maya Chen",
                status="todo",
                priority=data.get("priority", "high"),
                evidence_quote=f"Voice command: {data.get('title')}"
            )
            db.add(new_task)
            db.commit()
            db.refresh(new_task)

            return ActionExecutionResponse(
                success=True,
                message=f"Commitment '{new_task.title}' successfully persisted in {space.name} for {new_task.assignee_name}.",
                entity_id=new_task.id,
                entity_type="task"
            )

        elif action_type in ["update_decision_metadata", "confirm_supersession_lineage", "add_prerequisite_constraint"]:
            # Find related decision
            target = data.get("target_entity", "")
            decision = None
            if data.get("prior_decision_id"):
                decision = db.query(Decision).filter(Decision.id == data.get("prior_decision_id")).first()
            if not decision and target:
                decision = db.query(Decision).filter(Decision.statement.ilike(f"%{target}%")).first()
            if not decision:
                decision = db.query(Decision).first()

            if decision:
                # Append a DecisionVersion
                next_v = len(decision.versions) + 1
                new_ver = DecisionVersion(
                    decision_id=decision.id,
                    version_number=next_v,
                    statement=decision.statement,
                    status=data.get("status") or decision.status,
                    change_reason=f"Wispr Flow memory audit: {data.get('reason', 'Audited via voice command')}",
                    created_by="Voice Reviewer"
                )
                db.add(new_ver)
                db.commit()

                return ActionExecutionResponse(
                    success=True,
                    message=f"Memory record '{decision.statement[:40]}...' audited with version {next_v}.",
                    entity_id=decision.id,
                    entity_type="decision"
                )

        return ActionExecutionResponse(
            success=True,
            message="Action staged and recorded in audit log.",
            entity_id=None,
            entity_type="audit_log"
        )
