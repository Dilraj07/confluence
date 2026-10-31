# Risks, Assumptions, and Architecture Decisions

## 1. Key assumptions

-   Hackathon MVP uses transcript upload or paste, not live meeting
    capture.
-   Demo organisation and meeting data are synthetic.
-   One LLM provider is sufficient for the MVP.
-   PostgreSQL and pgvector are available in the deployment environment.
-   The team can implement a basic authentication/user identity layer or
    use a controlled demo login.
-   The goal is a compelling, testable prototype, not a production
    enterprise rollout.

## 2. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- -----------------------
  Hallucinated decisions  Incorrect               Structured extraction,
  or owners               organisational records  evidence validation,
                          damage trust            review queue

  False contradiction     Similar wording may     Treat as candidate
  detection               represent different     finding; require
                          contexts                evidence and human
                                                  review

  Incorrect cross-Space   Irrelevant context or   Explicit Space
  routing                 privacy exposure        selection first;
                                                  deterministic
                                                  permissions

  Permission leakage      Sensitive information   Filter in DB before LLM
                          may be exposed          context; test graph
                                                  traversal and executive
                                                  view

  Duplicate               Pollutes the knowledge  Canonical IDs,
  tasks/decisions         network                 duplicate candidates,
                                                  approval

  Graph clutter           Network becomes hard to Focus mode, filters,
                          interpret               bounded traversal,
                                                  progressive disclosure

  LLM latency/cost        Demo can fail or be     Small context, bounded
                          slow                    calls, caching,
                                                  precomputed fallback

  Transcript quality      Missing                 Preserve source text;
                          speakers/timestamps     mark unknown metadata;
                          reduce extraction       allow manual correction
                          quality                 

  Scope creep             Too many features       P0/P1/P2 prioritisation
                          prevent a complete      
                          workflow                

  Integration instability Third-party APIs may    Upload-first MVP;
                          require permissions or  integrations after core
                          tenant setup            workflow

  Misleading KPI claims   Small sample size can   Publish sample sizes
                          exaggerate quality      and actual evaluation
                                                  results
  -----------------------------------------------------------------------

## 3. Architecture decisions

### ADR-001: Modular monolith

**Decision:** Build one frontend, one API backend, one database, and
modular agent workflows.

**Reason:** Fast integration, fewer deployment dependencies, easier
debugging during a short hackathon.

### ADR-002: Spaces instead of ordinary folders

**Decision:** Use hierarchical Spaces with explicit membership and
scoped context.

**Reason:** Spaces represent meaningful organisational context and
access boundaries, not just file containers.

### ADR-003: One canonical record, multiple relationships

**Decision:** Store each decision/task once and link it to multiple
Spaces when appropriate.

**Reason:** Prevent divergent copies and preserve one history.

### ADR-004: PostgreSQL graph tables

**Decision:** Store nodes and edges in relational tables for the MVP.

**Reason:** Graph needs are bounded and relational storage reduces
operational complexity. Reconsider a dedicated graph database only if
measured requirements justify it.

### ADR-005: Permission-aware retrieval before generation

**Decision:** Apply access checks before retrieved content enters model
context.

**Reason:** The LLM must never be used as an authorisation layer.

### ADR-006: Human approval for state changes

**Decision:** AI extraction and relationship suggestions remain proposed
until reviewed.

**Reason:** Organisational decisions and commitments are consequential;
confidence scores alone are not approval.

### ADR-007: Evidence-linked knowledge

**Decision:** Persist evidence references for extracted records and
generated answers.

**Reason:** Traceability is a core trust differentiator.

## 4. Open questions to resolve during implementation

-   Which exact LLM provider and model will be used?
-   Which embedding model and vector dimension will be used?
-   Will authentication be real OAuth or a controlled demo login?
-   Will transcript uploads be stored locally or in object storage?
-   What is the maximum transcript size and processing time?
-   Which record types need separate sensitivity labels?
-   How will user identities map to extracted speaker names?
-   Which demo findings are pre-seeded versus generated live?

Resolve these with the simplest option that supports a reliable demo.
