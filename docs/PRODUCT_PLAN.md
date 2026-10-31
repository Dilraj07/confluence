# Product Plan

## 1. Vision

**CONFLUENCE gives teams an organisational memory that understands
context, preserves decision history, and makes cross-team consequences
visible.**

Organisations generate decisions across many meetings. Those decisions
become fragmented across transcripts, chat threads, documents, and
people's memory. Traditional meeting tools capture what was said, but
often fail to preserve how decisions connect over time or how one team's
decision affects another.

CONFLUENCE converts conversations into structured, traceable knowledge
and makes that knowledge useful during execution.

## 2. The problem

-   Meeting summaries are isolated and quickly become stale.
-   The same topic is discussed repeatedly because previous decisions
    are hard to find.
-   Action items lose ownership, deadlines, or their original rationale.
-   Teams maintain separate context, so dependencies between departments
    are missed.
-   A changed decision can invalidate downstream plans without notifying
    affected teams.
-   Leaders lack a trustworthy view of cross-team risks and decision
    changes.

## 3. Product principles

1.  **Context before retrieval:** retrieve from the relevant Space, not
    from every conversation indiscriminately.
2.  **One canonical record:** a decision or task has one identity even
    when linked to multiple Spaces.
3.  **Evidence before assertion:** important extracted facts must point
    to source transcript segments.
4.  **History is append-only:** preserve old decisions and mark them
    superseded; do not silently overwrite.
5.  **Connections are not permissions:** a graph edge never grants
    access to its target.
6.  **AI proposes, deterministic services enforce:** the model may
    recommend; application code validates and commits.
7.  **Human approval for consequential actions:** no silent task
    reassignment, decision approval, or external side effect.
8.  **Uncertainty is visible:** distinguish confirmed facts, inferred
    relationships, and unresolved suggestions.

## 4. Core concept: Spaces

A **Space** is a scoped context area for a department, project, or
topic. It contains or references relevant meetings, decisions, tasks,
blockers, documents, and people.

Example hierarchy:

``` text
Organisation
├── Engineering
│   ├── Backend
│   └── Infrastructure
├── HR
│   ├── Recruitment
│   └── Employee Experience
├── Product
│   └── Platform Launch
└── Leadership
```

Rules: - Every meeting has exactly one primary Space. - A meeting may be
linked to additional Spaces when it genuinely spans teams. - A record is
stored once and can be related to multiple Spaces. - Space membership
and record-level policy determine visibility. - A user may have
different roles in different Spaces. - Leadership views are
permission-aware aggregations, not unrestricted access to all raw
conversations.

### Three memory scopes

  -----------------------------------------------------------------------
  Scope                   What it contains        Example
  ----------------------- ----------------------- -----------------------
  Local memory            Context relevant to one Backend API decisions
                          Space                   and technical blockers

  Shared memory           Explicit relationships  Hiring capacity affects
                          across Spaces           backend delivery

  Organisational memory   Approved strategic      Platform launch risk
                          decisions, trends, and  across Engineering, HR,
                          high-impact risks       and Product
  -----------------------------------------------------------------------

## 5. Core product experiences

### A. Command Centre

A role-aware overview of: - Active decisions and recent changes - Open
commitments and overdue actions - Blockers and unresolved questions -
Cross-Space dependencies - Risks requiring review - Recent meetings and
generated intelligence

The overview should explain *why* an item is at risk and link to
evidence.

### B. Spaces

Each Space includes: - Description, members, and access level - Meetings
and source material - Decisions and their version history - Tasks,
blockers, and open questions - Local activity timeline - Related Spaces
and cross-Space dependencies - Ask this Space: evidence-backed question
answering scoped to the Space

### C. Meeting Room

For each meeting: - Transcript with speaker and timestamp - Concise
summary - Decisions, proposals, tasks, blockers, and questions -
Confidence and evidence for each extracted item - Suggested links to
prior meetings and existing records - Review and approval queue

### D. Decision Network

An interactive graph connecting: - Meetings - Decisions - Tasks -
Blockers - People - Projects / Spaces - Evidence and documents

Important relationships: `DECIDED_IN`, `EVIDENCED_BY`, `OWNED_BY`,
`DEPENDS_ON`, `BLOCKS`, `RESOLVES`, `SUPERSEDES`, `CONTRADICTS`,
`REVISITS`, `AFFECTS`, `RELATED_TO`.

Graph design must support search, filters, focus mode, time range, and a
detail inspector. Avoid showing the entire organisation graph by
default.

### E. Execution Centre

A consolidated task view with: - Owner, due date, status, priority -
Source meeting and originating decision - Dependencies and blockers -
Space and project - Change history

Users can filter by Space, owner, project, status, and deadline.

### F. Executive Intelligence

A leadership-oriented view of: - Strategic decisions and changes -
Cross-department dependencies - Resource conflicts - High-impact
blockers - Commitments at risk - Emerging themes and repeated unresolved
issues

The executive view should show only information the viewer is authorised
to access. Where raw details are restricted, show only an approved
aggregate or a permission-safe risk summary.

### G. Evidence-backed Ask

Users can ask questions in natural language. Answers should: - State the
answer directly. - Identify the Spaces and time period searched. - Link
each material claim to meeting evidence. - Separate confirmed facts from
inferred connections. - Say when evidence is insufficient. - Respect the
user's permissions before retrieval and generation.

## 6. Signature differentiator: Decision Integrity Engine

The Decision Integrity Engine monitors the knowledge network for changes
and inconsistencies.

Initial detection types: 1. Potentially contradictory decisions 2. A new
decision superseding an older one 3. Duplicate or overlapping tasks 4.
Missing task owner or due date 5. Repeated blockers 6. Dependency risk
7. Forgotten or overdue commitments 8. Downstream impact when a decision
changes

A detected issue is a **finding**, not an automatic mutation. It
includes: - Finding type and severity - Related records - Evidence
references - Confidence - Explanation - Suggested next step - Review
status

Similarity alone must never be treated as proof of contradiction.

## 7. Primary user journeys

### Journey 1 --- Ingest a meeting

1.  User selects a primary Space.
2.  User uploads a transcript or pastes text.
3.  System parses transcript segments and speaker/timestamp metadata.
4.  Meeting Analyst extracts candidate records with evidence spans.
5.  Context Router retrieves relevant local memory and permitted shared
    records.
6.  Memory Linker proposes relationships and duplicate candidates.
7.  Decision Integrity Engine identifies potential conflicts and
    impacts.
8.  User reviews and approves extracted records.
9.  Approved records are persisted and appear in the Space and graph.

### Journey 2 --- Find why a decision was made

1.  User asks: "Why did we move the platform launch?"
2.  Context Router selects relevant accessible Spaces.
3.  Retrieval returns decision history, blockers, and evidence.
4.  Answer explains the timeline and cites source meeting segments.
5.  User can open the decision trail.

### Journey 3 --- Understand cross-team risk

1.  Executive asks: "What threatens the January platform launch?"
2.  System searches permitted Product, Engineering, and HR context.
3.  It finds a backend delivery dependency and a recruitment shortfall.
4.  It explains the relationship and confidence with evidence.
5.  Restricted HR details remain hidden; only approved risk information
    is surfaced.

### Journey 4 --- Propagate a changed decision

1.  A new meeting proposes moving launch from December to January.
2.  System identifies the older active decision.
3.  It proposes a `SUPERSEDES` relationship.
4.  It traces dependent commitments, such as QA, marketing, and customer
    communications.
5.  It creates impact findings for review; it does not silently rewrite
    downstream dates.

## 8. Hackathon MVP scope

### P0 --- Must work

-   Organisation and Space setup (seeded is acceptable)
-   Transcript upload/paste
-   Structured extraction of decisions, tasks, blockers, questions, and
    evidence
-   Local Space memory retrieval
-   Cross-meeting linking
-   Decision history and supersession
-   Basic graph visualisation
-   Command Centre / Execution Centre
-   Evidence-backed question answering
-   Human review before persistence of AI-proposed changes

### P1 --- Strong differentiators

-   Cross-Space dependencies
-   Executive Intelligence view
-   Impact propagation
-   Conflict and duplicate findings
-   Role-aware access checks in backend queries
-   Voice input for asking questions, if time permits

### P2 --- Post-hackathon

-   Live Teams / Meet integrations
-   Calendar and task-system write-back
-   Advanced policy engine and audit exports
-   Full enterprise identity integration
-   Automated notifications and scheduled digests
-   Multi-tenant production hardening

## 9. What not to build

-   A generic chatbot with a transcript upload wrapper
-   A large collection of artificial agents that do not add measurable
    value
-   A graph containing every transcript word or every semantic
    similarity
-   Automatic task creation in external systems without approval
-   A full permissions administration console for the hackathon
-   A complex microservice architecture
-   Unverified claims such as "zero hallucinations" or
    "enterprise-ready"

## 10. Product positioning

**Short description:**\
CONFLUENCE turns meetings into a connected organisational memory. It
keeps each team's context relevant while connecting decisions,
dependencies, and commitments across the organisation---so people can
understand not just what was decided, but why it matters and what
changes next.

**One-line USP:**\
Separate contextual memories. One connected, evidence-backed decision
network.

**Demo promise:**\
Move a launch date in one meeting and watch CONFLUENCE trace the
affected decisions, tasks, and teams---without losing the evidence or
silently changing anyone's work.
