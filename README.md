# CONFLUENCE — Contextual Organisational Memory Network

> **An intelligent organisational memory network that turns meetings into connected decisions, commitments, risks, and execution.**

CONFLUENCE is an evidence-backed organizational memory system built around scoped **Spaces** (Payments Platform, Site Reliability Engineering, Risk & Fraud, Security & Compliance, Merchant Operations, Product & Strategy). It tracks canonical decisions, preserves append-only decision lineage via `SUPERSEDES` relationships, flags cross-team blockers (`BLOCKS`, `AFFECTS`), and enables natural-language organizational memory querying with cited transcript segment quotes.

The interface is crafted in accordance with the **Oura Design Language** (`DESIGN-oura.md`): warm-paper canvas (`#f7f1e8`), surface white, stone/olive/gold accents, decisive action blue (`#2a72de`), pill buttons, and Editorial serif display typography.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │    Next.js + React 18 + Tailwind UI      │
                      │   (Oura Design System & Graph Visuals)   │
                      └────────────────────┬─────────────────────┘
                                           │ REST API (/api/v1)
                      ┌────────────────────▼─────────────────────┐
                      │             FastAPI Backend              │
                      │  - Context Router & Permissions Scoping  │
                      │  - Meeting Analyst (Structured Extract)  │
                      │  - Memory Linker & Integrity Engine      │
                      └────────────────────┬─────────────────────┘
                                           │
                      ┌────────────────────▼─────────────────────┐
                      │    PostgreSQL / SQLite Database          │
                      │  (Canonical Records, Segments, Evidence, │
                      │   Relationships, Version Audit Trails)   │
                      └──────────────────────────────────────────┘
```

### Key Modules

- **Spaces & Permissions Scoping**: Every meeting belongs to exactly one primary Space, with optional cross-space links. Permissions are enforced before LLM context entry.
- **Traceable Evidence Verification**: Every extracted decision, task, or blocker cites verified quote text and stable segment IDs. Offsets and speakers are never fabricated.
- **Append-Only Decision Lineage**: When an architectural or product decision changes, the prior decision is marked `superseded` and connected via an explicit `SUPERSEDES` graph edge. Historical versions and change reasons are preserved permanently.
- **Cross-Space Dependency Engine**: Connects upstream blockers (e.g. processor timeout ambiguity causing duplicate customer charges) to dependent engineering tasks, SRE circuit-breaker testing, and Merchant Operations pilot notifications (`BLOCKS`, `AFFECTS`).
- **Human-in-the-Loop Review**: Extracted candidates remain proposals until reviewed and approved via the Review Drawer.

---

## Quickstart Guide

### Option 1: One-Click PowerShell Start (Windows)

```powershell
.\start.ps1
```

This script automatically sets up the Python virtual environment, seeds the MeridianPay Smart Routing v2 dataset, and launches both the backend (`http://127.0.0.1:8000`) and frontend (`http://localhost:3000`).

---

## MeridianPay Evaluation Scenarios & Demo Script

Follow this script to demonstrate the core capabilities:

1. **Executive Home & Attention Hierarchy**:
   - Greeted by Maya Chen (Product Manager) with clear narrative: *Smart Routing v2 20% rollout paused due to duplicate transaction hazard*.
   - View cross-space blockers across Payments, Risk, SRE, and Merchant Operations.
2. **Decision Lineage & Supersession History**:
   - Inspect the **Knowledge / Decision Network** timeline.
   - Observe how the 20% pilot expansion decision was formally superseded by the 14 November readiness review requiring 4 team approvals.
3. **Cross-Space Impact Simulation**:
   - Toggle the **Impact Analysis Simulator** in Knowledge: test what happens if the 14 Nov Launch Gate slips, or if Timeout Ambiguity remains unresolved.
4. **Ask CONFLUENCE (Voice-Ready Organizational Query)**:
   - Click the prompt chips or dictate with Wispr Flow:
     - *"Why was the Smart Routing rollout paused?"*
     - *"What changed from the original rollout plan?"*
     - *"What must happen before we can expand to 20%?"*
     - *"Which teams still have launch blockers, and who owns each action?"*
     - *"Can Merchant Operations confirm the pilot expansion date?"*
   - See how CONFLUENCE synthesizes exact evidence from verified transcript segments across all 6 Spaces.
5. **My Work & Commitments**:
   - Review Maya Chen's tasks or toggle to all 10 tracked commitments filtered by team lead (Daniel Foster, Priya Nair, Omar Hassan, Sarah Kim).
   - Click the **Ask CONFLUENCE** button or the risk banner action.
   - Ask: *"What is putting the Platform Launch at risk?"*
   - See how CONFLUENCE queries across permitted Spaces (Engineering, HR, Product) to synthesize a coherent explanation, citing exact verbatim segments with speaker names.
6. **Meeting Ingestion & Human Review**:
   - Click **Ingest Meeting** &rarr; click **Pre-fill Sample Script** &rarr; click **Ingest & Extract Records**.
   - Review the extracted candidate decisions, tasks, and quote spans in the review drawer.
   - Click **Approve & Persist** to commit the record to the canonical database.

---

## Running Automated Tests

```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\python -m pytest backend/tests/test_api.py -v
```

