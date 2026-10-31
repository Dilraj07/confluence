import json
import os
from typing import List, Dict, Any, Optional
import httpx
from backend.app.core.config import settings

class MeetingAnalyst:
    """
    Extracts decisions, tasks, blockers, and exact quote evidence spans
    from meeting transcript segments.
    """

    @staticmethod
    def extract_candidates(
        transcript_text: str,
        segments: List[Dict[str, Any]],
        space_name: str = "Backend"
    ) -> List[Dict[str, Any]]:
        # If live API key is available, call LLM; otherwise use robust deterministic parsing
        if settings.GEMINI_API_KEY and settings.DEFAULT_LLM_PROVIDER == "gemini":
            try:
                return MeetingAnalyst._extract_with_gemini(transcript_text, segments, space_name)
            except Exception as e:
                print(f"[MeetingAnalyst] Gemini extraction failed ({e}), using deterministic extractor")

        return MeetingAnalyst._extract_deterministic(transcript_text, segments, space_name)

    @staticmethod
    def _extract_deterministic(
        transcript_text: str,
        segments: List[Dict[str, Any]],
        space_name: str
    ) -> List[Dict[str, Any]]:
        candidates = []
        text_lower = transcript_text.lower()

        # Helper to find matching segment for a substring
        def find_segment(target_phrase: str):
            for s in segments:
                if target_phrase.lower() in s["content"].lower():
                    return s
            return segments[0] if segments else None

        # Look for decisions
        if "decide" in text_lower or "agreed" in text_lower or "we will" in text_lower or "approved" in text_lower or "partition" in text_lower or "api" in text_lower:
            for s in segments:
                content = s["content"]
                c_lower = content.lower()
                if any(k in c_lower for k in ["decided", "agree", "we will use", "we will partition", "we must shift", "supersede", "moving forward"]):
                    candidates.append({
                        "candidate_type": "decision",
                        "confidence_score": 0.95,
                        "payload": {
                            "statement": content.strip(),
                            "rationale": "Formally agreed during meeting discussion",
                            "decision_type": "architecture" if "architecture" in text_lower or "database" in text_lower or "api" in text_lower else "process",
                            "impact_level": "high" if "partition" in c_lower or "launch" in c_lower or "database" in c_lower else "medium",
                            "decided_by": s.get("speaker_name") or "Team",
                            "evidence_quote": content.strip()[:180],
                            "transcript_segment_id": s.get("id")
                        }
                    })

        # Look for tasks
        for s in segments:
            content = s["content"]
            c_lower = content.lower()
            if any(k in c_lower for k in ["i will", "action item", "todo", "take the lead", "responsible for", "create a pr", "follow up"]):
                candidates.append({
                    "candidate_type": "task",
                    "confidence_score": 0.90,
                    "payload": {
                        "title": content[:90].strip(),
                        "description": content.strip(),
                        "assignee_name": s.get("speaker_name") or "Assignee",
                        "priority": "high" if "urgent" in c_lower or "asap" in c_lower else "medium",
                        "evidence_quote": content.strip()[:180],
                        "transcript_segment_id": s.get("id")
                    }
                })

        # Look for blockers
        for s in segments:
            content = s["content"]
            c_lower = content.lower()
            if any(k in c_lower for k in ["blocked", "blocker", "risk", "delay", "reneged", "cannot proceed", "waiting on"]):
                candidates.append({
                    "candidate_type": "blocker",
                    "confidence_score": 0.92,
                    "payload": {
                        "description": content.strip(),
                        "severity": "critical" if "reneged" in c_lower or "delay" in c_lower or "stop" in c_lower else "high",
                        "reported_by": s.get("speaker_name") or "Team Member",
                        "evidence_quote": content.strip()[:180],
                        "transcript_segment_id": s.get("id")
                    }
                })

        # Fallback if no specific triggers matched, ensure at least 1 candidate per segment category
        if not candidates and segments:
            s = segments[0]
            candidates.append({
                "candidate_type": "decision",
                "confidence_score": 0.85,
                "payload": {
                    "statement": s["content"],
                    "rationale": "Key meeting outcome",
                    "decision_type": "general",
                    "impact_level": "medium",
                    "decided_by": s.get("speaker_name") or "Speaker",
                    "evidence_quote": s["content"][:180],
                    "transcript_segment_id": s.get("id")
                }
            })

        return candidates

    @staticmethod
    def _extract_with_gemini(
        transcript_text: str,
        segments: List[Dict[str, Any]],
        space_name: str
    ) -> List[Dict[str, Any]]:
        prompt = f"""
You are the CONFLUENCE Meeting Analyst.
Analyze the following transcript for Space: '{space_name}'.
Extract canonical decisions, tasks, and blockers.
Every item MUST cite an exact verbatim quote from the transcript text.

Transcript segments:
{json.dumps([{"id": s["id"], "speaker": s.get("speaker_name"), "content": s["content"]} for s in segments], indent=2)}

Return ONLY valid JSON array of objects with structure:
[
  {{
    "candidate_type": "decision" | "task" | "blocker",
    "confidence_score": float (0.0 to 1.0),
    "payload": {{
      "statement": str (if decision),
      "title": str (if task),
      "description": str (if blocker or task detail),
      "rationale": str,
      "impact_level": "low" | "medium" | "high" | "critical",
      "priority": "low" | "medium" | "high" | "urgent",
      "severity": "low" | "medium" | "high" | "critical",
      "decided_by" | "assignee_name" | "reported_by": str,
      "evidence_quote": "exact quote from segment",
      "transcript_segment_id": "matching segment id"
    }}
  }}
]
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        resp = httpx.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=20.0
        )
        if resp.status_code == 200:
            res_data = resp.json()
            raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean markdown codeblocks
            clean = raw_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)
        else:
            raise RuntimeError(f"Gemini API returned status {resp.status_code}")

