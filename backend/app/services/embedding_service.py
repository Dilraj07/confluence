import json
import math
import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.entities import (
    EmbeddingRecord,
    TranscriptSegment,
    Decision,
    Task,
    Blocker,
    Meeting
)

# Global model instance cache
_FAST_EMBED_MODEL = None

def get_fastembed_model():
    global _FAST_EMBED_MODEL
    if _FAST_EMBED_MODEL is None:
        try:
            from fastembed import TextEmbedding
            _FAST_EMBED_MODEL = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        except Exception as e:
            print(f"[EmbeddingService] Warning: Could not initialize fastembed ({e}). Using deterministic fallback.")
            _FAST_EMBED_MODEL = None
    return _FAST_EMBED_MODEL


class EmbeddingService:
    """
    State-of-the-art embedding and semantic similarity service.
    Supports ONNX FastEmbed (bge-small-en-v1.5), Gemini text-embedding-004,
    and a robust deterministic fallback vectorizer.
    """

    @staticmethod
    def get_embedding(text: str) -> List[float]:
        """Compute 384-dimensional normalized dense embedding for a text."""
        cleaned = text.strip()
        if not cleaned:
            return [0.0] * 384

        # 1. Fast, local, ONNX embedding (zero network latency, zero rate limit)
        model = get_fastembed_model()
        if model is not None:
            try:
                embeddings = list(model.embed([cleaned]))
                if len(embeddings) > 0:
                    vec = embeddings[0].tolist()
                    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
                    return [x / norm for x in vec]
            except Exception as e:
                print(f"[EmbeddingService] FastEmbed inference error ({e}), falling back to Gemini")

        # 2. Try Gemini embedding if configured
        if settings.GEMINI_API_KEY and settings.DEFAULT_LLM_PROVIDER == "gemini":
            try:
                import httpx
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={settings.GEMINI_API_KEY}"
                resp = httpx.post(
                    url,
                    json={"model": "models/gemini-embedding-001", "content": {"parts": [{"text": cleaned}]}},
                    timeout=10.0
                )
                if resp.status_code == 200:
                    vec = resp.json()["embedding"]["values"]
                    # If dimensions differ, truncate or project to 384
                    if len(vec) >= 384:
                        v384 = vec[:384]
                    else:
                        v384 = vec + [0.0] * (384 - len(vec))
                    norm = math.sqrt(sum(x * x for x in v384)) or 1.0
                    return [x / norm for x in v384]
            except Exception as e:
                print(f"[EmbeddingService] Gemini embedding call failed: {e}")

        # 3. Deterministic normalized semantic projection fallback
        return EmbeddingService._deterministic_vector(cleaned)

        # 3. Deterministic normalized semantic projection fallback
        return EmbeddingService._deterministic_vector(cleaned)

    @staticmethod
    def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
        """Batch embedding generation for high throughput."""
        if not texts:
            return []

        model = get_fastembed_model()
        if model is not None:
            try:
                results = list(model.embed(texts))
                out = []
                for emb in results:
                    vec = emb.tolist()
                    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
                    out.append([x / norm for x in vec])
                return out
            except Exception as e:
                print(f"[EmbeddingService] Batch FastEmbed failed ({e}), using individual calls")

        return [EmbeddingService.get_embedding(t) for t in texts]

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calculate cosine similarity between two normalized vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return max(-1.0, min(1.0, float(dot)))

    @staticmethod
    def _deterministic_vector(text: str, dim: int = 384) -> List[float]:
        """
        Deterministic pseudo-semantic vector representation based on subword hashing
        and token character n-grams. Always normalized.
        """
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        if not words:
            return vec

        for word in words:
            w_hash = hash(word)
            idx = abs(w_hash) % dim
            sign = 1.0 if (w_hash > 0) else -1.0
            vec[idx] += sign * 1.5

            # 3-gram subwords
            for i in range(len(word) - 2):
                ngram = word[i:i+3]
                ng_hash = hash(ngram)
                ng_idx = abs(ng_hash) % dim
                vec[ng_idx] += (1.0 if ng_hash > 0 else -1.0) * 0.7

        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    @staticmethod
    def sync_all_embeddings(db: Session, force: bool = False) -> Dict[str, int]:
        """
        Scan all transcript segments, decisions, tasks, and blockers,
        and generate/persist embeddings into the EmbeddingRecord table.
        """
        synced_counts = {"segments": 0, "decisions": 0, "tasks": 0, "blockers": 0}

        # 1. Transcript segments
        segments = db.query(TranscriptSegment).all()
        for seg in segments:
            existing = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "transcript_segment",
                EmbeddingRecord.entity_id == seg.id
            ).first()

            if not existing or force:
                meeting = db.query(Meeting).filter(Meeting.id == seg.meeting_id).first()
                space_id = meeting.primary_space_id if meeting else None
                text = f"Speaker: {seg.speaker_name or 'Unknown'}. Content: {seg.content}"
                emb = EmbeddingService.get_embedding(text)

                if existing:
                    existing.text_content = text
                    existing.embedding_json = json.dumps(emb)
                    existing.space_id = space_id
                else:
                    rec = EmbeddingRecord(
                        entity_type="transcript_segment",
                        entity_id=seg.id,
                        space_id=space_id,
                        text_content=text,
                        embedding_json=json.dumps(emb),
                        dimensions=len(emb),
                        model_name="bge-small-en-v1.5"
                    )
                    db.add(rec)
                synced_counts["segments"] += 1

        # 2. Decisions
        decisions = db.query(Decision).all()
        for dec in decisions:
            existing = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "decision",
                EmbeddingRecord.entity_id == dec.id
            ).first()

            if not existing or force:
                text = f"Decision: {dec.statement}. Rationale: {dec.rationale or ''}. Decided by: {dec.decided_by or ''}. Status: {dec.status}"
                emb = EmbeddingService.get_embedding(text)

                if existing:
                    existing.text_content = text
                    existing.embedding_json = json.dumps(emb)
                    existing.space_id = dec.space_id
                else:
                    rec = EmbeddingRecord(
                        entity_type="decision",
                        entity_id=dec.id,
                        space_id=dec.space_id,
                        text_content=text,
                        embedding_json=json.dumps(emb),
                        dimensions=len(emb),
                        model_name="bge-small-en-v1.5"
                    )
                    db.add(rec)
                synced_counts["decisions"] += 1

        # 3. Tasks
        tasks = db.query(Task).all()
        for t in tasks:
            existing = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "task",
                EmbeddingRecord.entity_id == t.id
            ).first()

            if not existing or force:
                text = f"Task: {t.title}. Assignee: {t.assignee_name or ''}. Priority: {t.priority}. Status: {t.status}. Description: {t.description or ''}"
                emb = EmbeddingService.get_embedding(text)

                if existing:
                    existing.text_content = text
                    existing.embedding_json = json.dumps(emb)
                    existing.space_id = t.space_id
                else:
                    rec = EmbeddingRecord(
                        entity_type="task",
                        entity_id=t.id,
                        space_id=t.space_id,
                        text_content=text,
                        embedding_json=json.dumps(emb),
                        dimensions=len(emb),
                        model_name="bge-small-en-v1.5"
                    )
                    db.add(rec)
                synced_counts["tasks"] += 1

        # 4. Blockers
        blockers = db.query(Blocker).all()
        for b in blockers:
            existing = db.query(EmbeddingRecord).filter(
                EmbeddingRecord.entity_type == "blocker",
                EmbeddingRecord.entity_id == b.id
            ).first()

            if not existing or force:
                text = f"Blocker: {b.description}. Reported by: {b.reported_by or ''}. Severity: {b.severity}. Status: {b.status}"
                emb = EmbeddingService.get_embedding(text)

                if existing:
                    existing.text_content = text
                    existing.embedding_json = json.dumps(emb)
                    existing.space_id = b.space_id
                else:
                    rec = EmbeddingRecord(
                        entity_type="blocker",
                        entity_id=b.id,
                        space_id=b.space_id,
                        text_content=text,
                        embedding_json=json.dumps(emb),
                        dimensions=len(emb),
                        model_name="bge-small-en-v1.5"
                    )
                    db.add(rec)
                synced_counts["blockers"] += 1

        db.commit()
        return synced_counts

    @staticmethod
    def search_similar_records(
        db: Session,
        query: str,
        entity_types: Optional[List[str]] = None,
        space_id: Optional[str] = None,
        top_k: int = 5,
        min_score: float = 0.20
    ) -> List[Dict[str, Any]]:
        """
        Embed the query and perform cosine similarity search across persisted embeddings.
        Returns ranked list of matches with similarity score and entity object.
        """
        query_vec = EmbeddingService.get_embedding(query)

        # Ensure embeddings are populated if table is empty
        count = db.query(EmbeddingRecord).count()
        if count == 0:
            EmbeddingService.sync_all_embeddings(db)

        q = db.query(EmbeddingRecord)
        if entity_types:
            q = q.filter(EmbeddingRecord.entity_type.in_(entity_types))
        if space_id:
            q = q.filter(EmbeddingRecord.space_id == space_id)

        records = q.all()
        scored_matches = []

        for rec in records:
            try:
                emb = json.loads(rec.embedding_json)
                sim = EmbeddingService.cosine_similarity(query_vec, emb)
                if sim >= min_score:
                    scored_matches.append({
                        "id": rec.id,
                        "entity_type": rec.entity_type,
                        "entity_id": rec.entity_id,
                        "space_id": rec.space_id,
                        "text": rec.text_content,
                        "similarity": round(float(sim), 4)
                    })
            except Exception:
                continue

        # Sort descending by similarity
        scored_matches.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_matches[:top_k]

