# Five-Minute Demo Script

## Demo objective

Show that CONFLUENCE is not a summariser. It preserves context across
Spaces and explains how a decision in one meeting affects work
elsewhere.

## Demo setup

Create one synthetic organisation with three departments:

-   **Engineering → Backend**
-   **HR → Recruitment**
-   **Product → Platform Launch**

Use synthetic data only. Prepare 6--8 meetings and one new meeting to
ingest live.

### Scenario timeline

1.  Product meeting: platform launch approved for December.
2.  Engineering meeting: API delivery depends on two backend engineers.
3.  HR meeting: recruitment pipeline can provide only one of the two
    engineers by the target date.
4.  Product meeting: marketing commits to a December campaign.
5.  Engineering follow-up: API blocker remains unresolved.
6.  Leadership meeting: launch date is reconsidered.
7.  New meeting transcript: launch moves to January, subject to final
    approval.

The system should link the new meeting to the existing decision and
propose impact findings for related commitments.

## Run of show

### 0:00--0:35 --- The problem

"Teams don't lack meeting notes. They lack connected memory. A decision
is made in Product, a dependency sits in Engineering, and a capacity
constraint lives in HR. Those facts are separated, so the impact is easy
to miss."

### 0:35--1:15 --- Spaces

Show the Space hierarchy. Open Backend and Recruitment.

"Each Space keeps its own relevant context. HR recruitment discussions
do not pollute Engineering's local memory. But the system can still
connect information when there is a real dependency and the viewer has
permission."

### 1:15--2:00 --- Meeting ingestion

Upload the prepared transcript to Platform Launch.

Show: - Meeting transcript - Extracted launch decision - Tasks and
blockers - Evidence quotes and source segments - Proposed links to prior
records

Approve the valid items.

### 2:00--3:00 --- Decision Network

Show the graph focused on Platform Launch.

Trace: - Launch decision - Backend API dependency - Recruitment capacity
constraint - Marketing campaign commitment

Explain that the records are stored once and connected by relationships,
not copied into multiple folders.

### 3:00--4:10 --- Decision change and impact

Show the new January launch decision.

The system should: - Identify the prior December decision. - Propose a
`SUPERSEDES` relationship. - Preserve the old decision and its
evidence. - Trace affected tasks and commitments. - Create reviewable
impact findings rather than silently changing dates.

### 4:10--4:45 --- Executive Intelligence

Ask:

**"What is threatening the platform launch, and what changed after the
latest meeting?"**

Show a concise answer: - The backend API dependency remains
unresolved. - Recruitment capacity is below the stated engineering
need. - The latest decision proposes moving launch to January. -
Marketing and QA commitments need review. - Each claim links to source
evidence.

If access policy restricts HR details, demonstrate the safe aggregate
rather than exposing the underlying confidential record.

### 4:45--5:00 --- Close

"CONFLUENCE keeps team memories contextual but connects the decisions
that matter. It doesn't just tell you what happened in a meeting. It
shows what changed, why it matters, and what needs attention next."

## Demo reliability checklist

-   [ ] Seed data loaded and verified.
-   [ ] Transcript file stored locally or in configured storage.
-   [ ] LLM API key and quota tested.
-   [ ] Fallback precomputed extraction available if provider fails.
-   [ ] Graph opens at the correct focus node.
-   [ ] Every displayed evidence link works.
-   [ ] Executive answer has citations.
-   [ ] Permission test run.
-   [ ] Browser zoom and screen resolution checked.
-   [ ] No placeholder values or fake KPI results visible.
