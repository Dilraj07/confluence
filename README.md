# CONFLUENCE — Contextual Organisational Memory Network

> **An intelligent organisational memory network that turns meetings into connected decisions, commitments, risks, and execution.**

CONFLUENCE is an evidence-backed organizational memory system built around scoped **Spaces** (Engineering &rarr; Backend, HR &rarr; Recruitment, Product &rarr; Platform Launch). It tracks canonical decisions, preserves append-only decision lineage via `SUPERSEDES` relationships, flags cross-team blockers (`BLOCKS`, `AFFECTS`), and enables natural-language organizational memory querying with cited transcript segment quotes.

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
- **Cross-Space Dependency Engine**: Connects upstream blockers (e.g. HR recruitment delay) to dependent engineering tasks and platform launch milestones (`BLOCKS`, `AFFECTS`).
- **Human-in-the-Loop Review**: Extracted candidates remain proposals until reviewed and approved via the Review Drawer.

---

## Quickstart Guide

### Option 1: One-Click PowerShell Start (Windows)

```powershell
.\start.ps1
```

This script automatically sets up the Python virtual environment, seeds the hackathon demo dataset, and launches both the backend (`http://127.0.0.1:8000`) and frontend (`http://localhost:3000`).

---

### Option 2: Manual Start

#### 1. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Seed the realistic multi-space demo scenario
python scripts/seed_demo.py

# Run FastAPI backend
uvicorn backend.app.main:app --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5-Minute Hackathon Demo Script

Follow this script to demonstrate the core capabilities:

1. **Executive Command Centre**:
   - Notice the top metric cards (Active Decisions, Superseded History, Open Tasks, Cross-Space Risks).
   - Review the banner: **Critical Cross-Space Launch Risk Detected** affecting the Platform Launch.
2. **Decision Lineage**:
   - Inspect the decision feed: see the active `PostgreSQL schema partitioning` decision.
   - Click it to open the **Decision Audit Trail**: observe that it formally supersedes the kickoff `Single-node Redis caching` decision, showing both versions and cited quotes.
3. **Cross-Space Risk & Active Blockers**:
   - Observe the critical blocker in **HR &rarr; Recruitment**: the Senior Backend candidate reneged, causing a 4-week delay that directly starves backend partitioning delivery.
4. **Decision Network Graph**:
   - Switch to the **Decision Network** tab.
   - Explore the visual nodes for Spaces, Meetings, Decisions, Tasks, and Blockers connected by `SUPERSEDES`, `BLOCKS`, and `AFFECTS` edges.
   - Click on any node to view its verified metadata and connected relationships in the inspector drawer.
5. **Ask CONFLUENCE (Organizational Query)**:
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

