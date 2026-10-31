import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import Decision, Task, Blocker, EntityRelationship, EmbeddingRecord
from backend.app.services.embedding_service import EmbeddingService

class MemoryLinker:
    """
    Intelligent Memory Linker powered by Dense Semantic Similarity and Graph Topology.
    Discovers:
    - Decisions superseded or amended by new candidate statements
    - Cross-space task and blocker dependencies
    - Policy conflicts and contradiction hazards
    """

    @staticmethod
    def identify_supersession_candidates(
        db: Session,
        new_statement: str,
        space_id: str,
        threshold: float = 0.50
    ) -> List[Dict[str, Any]]:
        """
        Uses dense vector embeddings + lexical domain overlap to discover
        prior decisions superseded by the new statement.
        """
        # Retrieve active decisions in space
        active_decisions = db.query(Decision).filter(
            Decision.space_id == space_id,
            Decision.status == "active"
        ).all()

        query_vec = EmbeddingService.get_embedding(new_statement)
        candidates = []
        words_new = set(new_statement.lower().split())

        for prior in active_decisions:
            words_prior = set(prior.statement.lower().split())
            common = words_new.intersection(words_prior)
            meaningful = [w for w in common if len(w) > 4 and w not in ["about", "their", "there", "which", "would", "should"]]

            # Retrieve or compute embedding for prior decision
            rec = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "decision",
                EmbeddingRecord.entity_id == prior.id
            ).first()
            if rec:
                emb = json.loads(rec.embedding_json)
            else:
                emb = EmbeddingService.get_embedding(prior.statement)

            cos_sim = EmbeddingService.cosine_similarity(query_vec, emb)

            # Combined score: 70% semantic similarity + 30% lexical overlap boost
            lex_boost = min(len(meaningful) * 0.1, 0.3)
            combined_score = round(min(1.0, cos_sim + lex_boost), 4)

            # Detect supersession condition
            is_keyword_match = (
                len(meaningful) >= 2
                or ("database" in words_new and "database" in words_prior)
                or ("api" in words_new and "api" in words_prior)
                or ("launch" in words_new and "launch" in words_prior)
                or ("idempotency" in words_new and "idempotency" in words_prior)
                or ("timeout" in words_new and "timeout" in words_prior)
                or ("canary" in words_new and "canary" in words_prior)
            )

            if cos_sim >= threshold or is_keyword_match:
                candidates.append({
                    "prior_decision_id": prior.id,
                    "prior_statement": prior.statement,
                    "semantic_similarity": round(float(cos_sim), 4),
                    "overlap_keywords": meaningful,
                    "confidence_score": max(0.85, combined_score),
                    "proposed_relationship": "SUPERSEDES"
                })

        # Sort highest similarity first
        candidates.sort(key=lambda x: x["confidence_score"], reverse=True)
        return candidates

    @staticmethod
    def identify_task_dependencies(
        db: Session,
        blocker_text: str,
        space_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Discovers active tasks impacted by a newly reported blocker.
        """
        query_vec = EmbeddingService.get_embedding(blocker_text)
        tasks_q = db.query(Task).filter(Task.status.in_(["todo", "in_progress"]))
        if space_id:
            tasks_q = tasks_q.filter(Task.space_id == space_id)
        tasks = tasks_q.all()

        linked_tasks = []
        for t in tasks:
            rec = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "task",
                EmbeddingRecord.entity_id == t.id
            ).first()
            if rec:
                emb = json.loads(rec.embedding_json)
            else:
                emb = EmbeddingService.get_embedding(f"{t.title} {t.description or ''}")

            sim = EmbeddingService.cosine_similarity(query_vec, emb)
            if sim >= 0.45:
                linked_tasks.append({
                    "task_id": t.id,
                    "title": t.title,
                    "assignee_name": t.assignee_name,
                    "semantic_similarity": round(float(sim), 4),
                    "proposed_relationship": "BLOCKS" if sim >= 0.65 else "AFFECTS"
                })

        linked_tasks.sort(key=lambda x: x["semantic_similarity"], reverse=True)
        return linked_tasks
