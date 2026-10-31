from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import Decision, Task, Blocker, EntityRelationship

class MemoryLinker:
    """
    Identifies relationships between new candidate extractions and historical records:
    - Superseding older decisions
    - Blocking open tasks
    - Cross-space dependencies
    """

    @staticmethod
    def identify_supersession_candidates(
        db: Session,
        new_statement: str,
        space_id: str
    ) -> List[Dict[str, Any]]:
        # Find active decisions in the same space
        active_decisions = db.query(Decision).filter(
            Decision.space_id == space_id,
            Decision.status == "active"
        ).all()

        candidates = []
        words_new = set(new_statement.lower().split())

        for prior in active_decisions:
            words_prior = set(prior.statement.lower().split())
            common = words_new.intersection(words_prior)
            # Check overlap on meaningful keywords
            meaningful = [w for w in common if len(w) > 4 and w not in ["about", "their", "there", "which", "would", "should"]]
            if len(meaningful) >= 2 or ("database" in words_new and "database" in words_prior) or ("api" in words_new and "api" in words_prior) or ("launch" in words_new and "launch" in words_prior):
                candidates.append({
                    "prior_decision_id": prior.id,
                    "prior_statement": prior.statement,
                    "overlap_keywords": meaningful,
                    "confidence_score": 0.88,
                    "proposed_relationship": "SUPERSEDES"
                })

        return candidates

