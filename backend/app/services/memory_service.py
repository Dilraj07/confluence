import json
from datetime import datetime
from typing import List, Dict, Any, Optional, Set
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
    EmbeddingRecord
)
from backend.app.services.embedding_service import EmbeddingService

class MemoryService:
    """
    Contextual Organisational Memory Network Engine.
    Manages Episodic (transcripts), Semantic (canonical decisions & policies),
    Lineage (version trees & supersession chains), Relational (cross-space dependency graph),
    and Working / Conversational session memory.
    """

    # In-memory session working memory store
    _WORKING_MEMORIES: Dict[str, Dict[str, Any]] = {}

    # -------------------------------------------------------------
    # 1. Episodic Memory (Verbatim dialogue & meeting episodes)
    # -------------------------------------------------------------
    @staticmethod
    def recall_episodic_memory(
        db: Session,
        query: str,
        space_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Recalls exact transcript dialogue segments matching query concept
        using dense vector similarity and meeting space scope.
        """
        matches = EmbeddingService.search_similar_records(
            db,
            query=query,
            entity_types=["transcript_segment"],
            top_k=top_k * 2
        )

        results = []
        for m in matches:
            seg = db.query(TranscriptSegment).filter(TranscriptSegment.id == m["entity_id"]).first()
            if not seg:
                continue
            meeting = db.query(Meeting).filter(Meeting.id == seg.meeting_id).first()
            space = db.query(Space).filter(Space.id == meeting.primary_space_id).first() if meeting else None

            # Filter by space_ids if specified
            if space_ids and space and space.id not in space_ids:
                continue

            results.append({
                "memory_type": "episodic",
                "segment_id": seg.id,
                "meeting_id": meeting.id if meeting else None,
                "meeting_title": meeting.title if meeting else "Meeting",
                "meeting_date": meeting.meeting_date.isoformat() if (meeting and meeting.meeting_date) else None,
                "space_id": space.id if space else None,
                "space_name": space.name if space else "Unknown Space",
                "speaker_name": seg.speaker_name or "Speaker",
                "speaker_role": seg.speaker_role,
                "quote": seg.content.strip(),
                "similarity_score": m["similarity"]
            })
            if len(results) >= top_k:
                break

        return results

    # -------------------------------------------------------------
    # 2. Semantic Memory (Canonical decisions, policies, constraints)
    # -------------------------------------------------------------
    @staticmethod
    def recall_semantic_memory(
        db: Session,
        query: str,
        space_ids: Optional[List[str]] = None,
        include_superseded: bool = False,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Recalls active canonical decisions and policy constraints matching semantic concept.
        """
        matches = EmbeddingService.search_similar_records(
            db,
            query=query,
            entity_types=["decision"],
            top_k=top_k * 2
        )

        results = []
        for m in matches:
            dec = db.query(Decision).filter(Decision.id == m["entity_id"]).first()
            if not dec:
                continue
            if not include_superseded and dec.status == "superseded":
                continue

            space = db.query(Space).filter(Space.id == dec.space_id).first()
            if space_ids and space and space.id not in space_ids:
                continue

            meeting = db.query(Meeting).filter(Meeting.id == dec.meeting_id).first()

            results.append({
                "memory_type": "semantic",
                "decision_id": dec.id,
                "statement": dec.statement,
                "rationale": dec.rationale,
                "status": dec.status,
                "impact_level": dec.impact_level,
                "decided_by": dec.decided_by,
                "approved_by": dec.approved_by,
                "space_id": space.id if space else None,
                "space_name": space.name if space else "Unknown Space",
                "meeting_title": meeting.title if meeting else None,
                "similarity_score": m["similarity"]
            })
            if len(results) >= top_k:
                break

        return results

    # -------------------------------------------------------------
    # 3. Lineage Memory (Supersession DAG & Version Audits)
    # -------------------------------------------------------------
    @staticmethod
    def recall_decision_lineage(db: Session, decision_id: str) -> Dict[str, Any]:
        """
        Traces the full evolutionary tree for a decision:
        prior decisions it supersedes, newer decisions that supersede it,
        and its immutable append-only version history.
        """
        target = db.query(Decision).filter(Decision.id == decision_id).first()
        if not target:
            return {"error": f"Decision {decision_id} not found"}

        # Superseded decisions (prior nodes)
        prior_rels = db.query(EntityRelationship).filter(
            EntityRelationship.source_type == "decision",
            EntityRelationship.relationship_type == "SUPERSEDES",
            EntityRelationship.source_id == decision_id
        ).all()
        prior_decisions = []
        for r in prior_rels:
            p = db.query(Decision).filter(Decision.id == r.target_id).first()
            if p:
                prior_decisions.append({
                    "id": p.id,
                    "statement": p.statement,
                    "status": p.status,
                    "decided_by": p.decided_by
                })

        # Superseding decisions (newer nodes)
        newer_rels = db.query(EntityRelationship).filter(
            EntityRelationship.target_type == "decision",
            EntityRelationship.relationship_type == "SUPERSEDES",
            EntityRelationship.target_id == decision_id
        ).all()
        superseded_by = []
        for r in newer_rels:
            n = db.query(Decision).filter(Decision.id == r.source_id).first()
            if n:
                superseded_by.append({
                    "id": n.id,
                    "statement": n.statement,
                    "status": n.status,
                    "decided_by": n.decided_by
                })

        versions = []
        for v in target.versions:
            versions.append({
                "version_number": v.version_number,
                "statement": v.statement,
                "status": v.status,
                "change_reason": v.change_reason,
                "created_by": v.created_by,
                "created_at": v.created_at.isoformat() if v.created_at else None
            })

        return {
            "decision_id": target.id,
            "statement": target.statement,
            "status": target.status,
            "priors_superseded": prior_decisions,
            "superseded_by": superseded_by,
            "versions": versions,
            "is_superseded": target.status == "superseded" or len(superseded_by) > 0
        }

    # -------------------------------------------------------------
    # 4. Relational & Blocker Dependency Memory
    # -------------------------------------------------------------
    @staticmethod
    def recall_blocker_impact_graph(db: Session, blocker_id: str) -> Dict[str, Any]:
        """
        Traces downstream blast radius of a blocker:
        which decisions are halted, which tasks mitigate it, and which spaces are affected.
        """
        blocker = db.query(Blocker).filter(Blocker.id == blocker_id).first()
        if not blocker:
            return {"error": f"Blocker {blocker_id} not found"}

        rels = db.query(EntityRelationship).filter(
            (EntityRelationship.source_id == blocker_id) | (EntityRelationship.target_id == blocker_id)
        ).all()

        blocked_items = []
        mitigating_tasks = []
        affected_spaces = set()

        if blocker.space_id:
            s = db.query(Space).filter(Space.id == blocker.space_id).first()
            if s:
                affected_spaces.add(s.name)

        for r in rels:
            if r.relationship_type in ["BLOCKS", "AFFECTS", "TRIGGERS"] and r.source_id == blocker_id:
                if r.target_type == "decision":
                    d = db.query(Decision).filter(Decision.id == r.target_id).first()
                    if d:
                        blocked_items.append({"type": "decision", "id": d.id, "title": d.statement})
                elif r.target_type == "task":
                    t = db.query(Task).filter(Task.id == r.target_id).first()
                    if t:
                        blocked_items.append({"type": "task", "id": t.id, "title": t.title})
                elif r.target_type == "space":
                    sp = db.query(Space).filter(Space.id == r.target_id).first()
                    if sp:
                        affected_spaces.add(sp.name)
            elif r.relationship_type == "MITIGATED_BY" and r.source_id == blocker_id:
                t = db.query(Task).filter(Task.id == r.target_id).first()
                if t:
                    mitigating_tasks.append({
                        "task_id": t.id,
                        "title": t.title,
                        "assignee": t.assignee_name,
                        "status": t.status,
                        "priority": t.priority
                    })

        return {
            "blocker_id": blocker.id,
            "description": blocker.description,
            "severity": blocker.severity,
            "status": blocker.status,
            "reported_by": blocker.reported_by,
            "blocked_items": blocked_items,
            "mitigating_tasks": mitigating_tasks,
            "affected_spaces": list(affected_spaces)
        }

    # -------------------------------------------------------------
    # 5. Semantic Contradiction & Supersession Detection
    # -------------------------------------------------------------
    @staticmethod
    def detect_semantic_contradictions_and_supersessions(
        db: Session,
        new_statement: str,
        space_id: Optional[str] = None,
        threshold: float = 0.55
    ) -> List[Dict[str, Any]]:
        """
        Uses dense vector embeddings to calculate semantic similarity
        between a new proposed statement and existing active decisions,
        detecting potential conflicts or candidate supersessions.
        """
        query_vec = EmbeddingService.get_embedding(new_statement)
        q = db.query(Decision).filter(Decision.status == "active")
        if space_id:
            q = q.filter(Decision.space_id == space_id)
        active_decisions = q.all()

        candidates = []
        for d in active_decisions:
            # Check embedding
            rec = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "decision",
                EmbeddingRecord.entity_id == d.id
            ).first()
            if rec:
                emb = json.loads(rec.embedding_json)
            else:
                emb = EmbeddingService.get_embedding(d.statement)

            sim = EmbeddingService.cosine_similarity(query_vec, emb)
            if sim >= threshold:
                candidates.append({
                    "prior_decision_id": d.id,
                    "prior_statement": d.statement,
                    "decided_by": d.decided_by,
                    "semantic_similarity": round(float(sim), 4),
                    "proposed_relationship": "SUPERSEDES" if sim >= 0.65 else "RELATES_TO",
                    "conflict_risk": "high" if sim >= 0.75 else "medium"
                })

        candidates.sort(key=lambda x: x["semantic_similarity"], reverse=True)
        return candidates

    # -------------------------------------------------------------
    # 6. Working / Session Conversational Memory
    # -------------------------------------------------------------
    @staticmethod
    def get_session_working_memory(session_id: str) -> Dict[str, Any]:
        """Retrieve conversational state and entities in working memory for session."""
        if session_id not in MemoryService._WORKING_MEMORIES:
            MemoryService._WORKING_MEMORIES[session_id] = {
                "turns": [],
                "active_space_id": None,
                "focused_entities": {
                    "decisions": [],
                    "tasks": [],
                    "blockers": []
                },
                "staged_actions": []
            }
        return MemoryService._WORKING_MEMORIES[session_id]

    @staticmethod
    def update_session_working_memory(
        session_id: str,
        user_message: str,
        assistant_message: str,
        space_id: Optional[str] = None,
        entity_ids: Optional[Dict[str, List[str]]] = None,
        staged_action: Optional[Dict[str, Any]] = None
    ) -> None:
        """Update multi-turn conversation memory and focus context."""
        state = MemoryService.get_session_working_memory(session_id)
        state["turns"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "user": user_message,
            "assistant": assistant_message
        })
        # Keep last 10 turns
        if len(state["turns"]) > 10:
            state["turns"] = state["turns"][-10:]

        if space_id:
            state["active_space_id"] = space_id

        if entity_ids:
            for k, ids in entity_ids.items():
                if k in state["focused_entities"]:
                    existing = set(state["focused_entities"][k])
                    for item_id in ids:
                        existing.add(item_id)
                    state["focused_entities"][k] = list(existing)[-8:]

        if staged_action:
            state["staged_actions"].append(staged_action)

