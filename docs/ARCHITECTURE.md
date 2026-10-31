# System Architecture

## 1. Architecture overview

Use a **modular monolith** for the hackathon: Next.js frontend, FastAPI
backend, PostgreSQL with pgvector, and a LangGraph workflow. Keep agent
logic modular, but do not deploy every agent as a separate service.

``` text
┌───────────────────────────────────────────────────────────┐
│                    Next.js Web Application                │
│ Command Centre | Spaces | Meetings | Decision Network     │
│ Execution Centre | Executive Intelligence | Ask           │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / JSON
┌─────────────────────────────▼─────────────────────────────┐
│                         FastAPI                            │
│ Auth / Workspace / Space / Meeting / Review / Query APIs   │
│ Validation | Permissions | Audit | Background jobs         │
└───────────────┬─────────────────────────────┬─────────────┘
                │                             │
┌───────────────▼───────────────┐  ┌──────────▼─────────────┐
│      LangGraph Workflow      │  │  Deterministic Domain  │
│ Context Router               │  │  Services              │
│ Meeting Intelligence         │  │ IDs / deduplication    │
│   ├─ Meeting Analyst         │  │ state transitions      │
│   ├─ Memory Linker           │  │ permission checks      │
│   ├─ Decision Auditor        │  │ graph writes           │
│   └─ Action Planner          │  │ approval / audit       │
└───────────────┬───────────────┘  └──────────┬─────────────┘
                └──────────────┬──────────────┘
                               │
┌──────────────────────────────▼────────────────────────────┐
│                         PostgreSQL                         │
│ Organisations / Spaces / Meetings / Transcript Segments   │
│ Decisions / Tasks / Findings / Evidence / Graph Edges      │
│ pgvector embeddings | Versions | Approvals | Audit Events  │
└───────────────────────────────────────────────────────────┘
```

## 2. Recommended stack

  -----------------------------------------------------------------------
  Layer                   Choice                  Reason
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + React +       Fast product UI and
                          TypeScript              typed contracts

  Styling                 Tailwind CSS +          Consistent, fast
                          shadcn/ui               component system

  Graph                   `@xyflow/react`         Interactive node-edge
                                                  visualisation

  Charts                  Recharts                Simple KPI and trend
                                                  charts

  Backend                 Python + FastAPI        Typed APIs and strong
                                                  AI ecosystem

  Validation              Pydantic                Strict model and API
                                                  schemas

  Agent workflow          LangGraph               Explicit state,
                                                  branching, retries

  LLM                     Gemini or available     Extraction and
                          structured-output model reasoning

  Database                PostgreSQL              Canonical transactional
                                                  records

  Vector search           pgvector                Semantic retrieval
                                                  without a second
                                                  database

  ORM/migrations          SQLAlchemy + Alembic    Schema management

  Background work         FastAPI background task Keep deployment simple
                          for MVP; Redis/Celery   
                          only if needed          

  Testing                 pytest + API tests;     Verify correctness
                          Playwright for critical 
                          UI flows                
  -----------------------------------------------------------------------

Pin dependency versions in the lockfile. Do not assume a particular
model or API feature until tested with the selected provider.

## 3. Core architectural rule

**The LLM is a reasoning component, not the system of record.**

The model may: - Extract candidate decisions, tasks, blockers, and
questions. - Classify likely relationships. - Summarise evidence. -
Explain retrieved history. - Recommend next actions.

Deterministic application services must: - Create canonical IDs. -
Enforce permissions. - Validate referenced records and evidence spans. -
Deduplicate with explicit rules and review where uncertain. - Apply
state transitions. - Persist graph edges. - Record approvals and audit
events. - Perform external side effects only after approval.

## 4. Agent workflow

### 4.1 Ingestion workflow

``` text
Transcript upload
      │
      ▼
Parse + normalise
      │
      ▼
Create meeting + transcript segments
      │
      ▼
Context Router
  ├─ resolve organisation
  ├─ resolve primary Space
  ├─ load permissions
  └─ retrieve scoped context
      │
      ▼
Meeting Analyst
  ├─ decisions / proposals
  ├─ tasks / commitments
  ├─ blockers / questions
  ├─ people / dates
  └─ evidence spans
      │
      ▼
Schema + evidence validation
      │
      ▼
Memory Linker
  ├─ exact IDs / entity matches
  ├─ keyword retrieval
  ├─ vector candidates
  └─ relationship classification
      │
      ▼
Decision Auditor
  ├─ contradiction candidates
  ├─ supersession candidates
  ├─ duplicate task candidates
  └─ dependency / impact findings
      │
      ▼
Review queue
      │
      ▼
Human approval
      │
      ▼
Deterministic persistence + audit
```

### 4.2 Query workflow

``` text
User question
     │
     ▼
Authenticate user
     │
     ▼
Context Router
  ├─ selected Space, if supplied
  ├─ query intent and entities
  ├─ accessible Space scope
  └─ permission-filtered retrieval plan
     │
     ▼
Retrieve canonical records + evidence
     │
     ▼
Rank / deduplicate / assemble context
     │
     ▼
Answer Generator
     │
     ▼
Citation and permission validation
     │
     ▼
Answer + evidence links + uncertainty
```

### 4.3 Context Router

The Context Router is a routing and retrieval-policy component, not an
authorisation authority.

Inputs: - Authenticated user and organisation - Query or meeting
metadata - Explicitly selected Space, if any - Accessible Space IDs and
record permissions

Routing order: 1. Explicit user-selected Space. 2. Meeting's configured
primary Space. 3. Project/topic metadata and known entities. 4. Search
over Spaces the user is allowed to access. 5. Cross-Space expansion
through permitted relationships. 6. Organisation-level scope only when
the query requires it and the user is authorised.

The router may use an LLM to classify intent, but permissions must be
calculated by deterministic backend code. Apply access filters in SQL
before content is passed to the model.

### 4.4 Specialist agents

  -----------------------------------------------------------------------
  Agent                   Responsibility          Must return
  ----------------------- ----------------------- -----------------------
  Meeting Analyst         Extract structured      Typed candidates +
                          records from one        evidence
                          meeting                 

  Memory Linker           Find prior records and  Candidate links +
                          propose relationships   rationale + confidence

  Decision Auditor        Detect conflicts,       Findings + affected
                          supersession, and       record IDs
                          impact                  

  Action Planner          Recommend next steps    Proposed actions, never
                          and owners where        unapproved writes
                          explicitly supported    
  -----------------------------------------------------------------------

One orchestrator coordinates these modules. Do not create separate
agents for simple deterministic operations.

## 5. Retrieval strategy

Use hybrid retrieval: 1. Permission-filtered SQL queries for exact
Space, project, IDs, and dates. 2. Full-text / keyword search for exact
names and phrases. 3. pgvector similarity for semantically related
records. 4. Relationship traversal for dependencies and decision
lineage. 5. Ranking using relevance, recency, record status, and
evidence quality.

Important: - Vector similarity proposes candidates; it does not
establish identity or contradiction. - Deduplicate by canonical record
IDs and explicit matching rules. - Keep local Space context ahead of
cross-Space context unless the query asks for broader scope. -
Cross-Space expansion must be permission-filtered. - Return source
meeting and transcript evidence with each factual claim.

## 6. Evidence model

Every extracted record should reference one or more evidence spans.

An evidence span contains: - Meeting ID - Transcript segment ID -
Start/end character offsets or timestamp range - Exact quote or source
excerpt - Speaker, when known - Extraction method and confidence

Do not fabricate timestamps or speakers. If the transcript has no
timestamps, use segment/character offsets and mark timestamps
unavailable.

## 7. Decision lifecycle

``` text
PROPOSED ──review/approve──> ACTIVE
   │                           │
   ├──reject──> REJECTED       ├──new decision supersedes──> SUPERSEDED
   │                           ├──challenge──> DISPUTED
   │                           └──complete──> COMPLETED
   └──withdraw──> CANCELLED
```

Preserve all versions. A new decision should create a new record or
version and a `SUPERSEDES` relationship. Never erase the previous
rationale.

## 8. Graph model

Use relational tables for nodes and edges in PostgreSQL.

Node types: - `MEETING`, `DECISION`, `TASK`, `BLOCKER`, `QUESTION`,
`PERSON`, `PROJECT`, `SPACE`, `DOCUMENT`, `EVIDENCE`.

Edge types: - `DECIDED_IN` - `EVIDENCED_BY` - `OWNED_BY` -
`DEPENDS_ON` - `BLOCKS` - `RESOLVES` - `SUPERSEDES` - `CONTRADICTS` -
`REVISITS` - `AFFECTS` - `RELATED_TO`

Each edge should include: - Source and target node - Relationship type -
Originating meeting or process - Evidence reference, where applicable -
Confidence and review status - Created timestamp and creator

A graph edge is not an access grant.

## 9. Permissions and privacy

Minimum hackathon implementation: - Every record belongs to an
organisation. - Every meeting has a primary Space. - User
membership/role is checked on all reads and writes. - Sensitive record
categories can have an additional access policy. - Cross-Space links do
not bypass source or target permissions. - Executive dashboards
aggregate only data the viewer is authorised to see. - Model prompts
contain only records the user may access. - Log approvals and
consequential state changes.

Never send confidential HR performance or compensation details into an
executive answer merely because the user has an executive role. Access
must be explicitly granted by policy.

## 10. API and service boundaries

Keep domain services separate in code: - `spaces_service` -
`meetings_service` - `transcript_service` - `extraction_service` -
`context_router` - `retrieval_service` - `decision_service` -
`task_service` - `graph_service` - `integrity_service` -
`approval_service` - `audit_service`

See `API_CONTRACTS.md` for suggested endpoints.

## 11. Deployment shape

Hackathon deployment: - One Next.js app - One FastAPI app - One
PostgreSQL database with pgvector - One configured LLM provider - Local
or object-storage transcript uploads - Seed script for demo organisation
and Spaces

Use environment variables for secrets. Never commit API keys. Provide
`.env.example` with placeholder names only.

## 12. Observability

For every workflow run, log: - Run ID, organisation, meeting/query ID -
Agent/node name and status - Model/provider and model version -
Prompt/template version - Input/output token counts if available -
Latency and retry count - Validation errors - Approval outcome -
Persisted record IDs

Do not log unrestricted transcript text or secrets by default. Use
redacted or access-controlled debugging logs.
