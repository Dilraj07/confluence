# CONFLUENCE --- Project Context Pack

> **An intelligent organisational memory network that turns meetings
> into connected decisions, commitments, risks, and execution.**

This folder contains the product definition and the technical context
required to build the CONFLUENCE hackathon MVP.

## Documents

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `PRODUCT_PLAN.md`                   Product vision, users, scope,
                                      workflows, differentiators

  `ARCHITECTURE.md`                   System architecture, agent flow,
                                      retrieval, security, deployment

  `AGENTS.md`                         Instructions and engineering rules
                                      for AI coding agents

  `DATA_MODEL.md`                     PostgreSQL schema, entities,
                                      relationships, lifecycle

  `KPIS.md`                           Product, agent-quality, system, and
                                      demo success metrics

  `IMPLEMENTATION_PLAN.md`            Prioritised build sequence,
                                      milestones, team split, acceptance
                                      criteria

  `DEMO_SCRIPT.md`                    Five-minute demonstration narrative
                                      and sample scenario

  `API_CONTRACTS.md`                  Suggested API endpoints and
                                      structured payload contracts

  `RISKS_AND_DECISIONS.md`            Key assumptions, risks,
                                      mitigations, and decisions
  -----------------------------------------------------------------------

## Product in one minute

CONFLUENCE is not a meeting summariser. It creates a durable,
evidence-backed memory of what an organisation has decided and committed
to do.

Meetings are organised into **Spaces** such as Engineering → Backend, HR
→ Recruitment, and Product → Platform Launch. Each Space has relevant
local context. A shared knowledge network connects related decisions and
work across Spaces without copying records or bypassing permissions.

The system can answer questions such as:

-   What did Engineering decide about the API contract?
-   Which commitments are still open from the last three launch
    meetings?
-   Why is the January platform launch at risk?
-   What changed when the launch date moved, and which teams need to
    review their plans?

## MVP boundary

Build a convincing vertical slice, not an entire enterprise
collaboration suite:

1.  Create an organisation and a small set of Spaces.
2.  Upload or paste meeting transcripts.
3.  Extract decisions, actions, blockers, questions, people, dates, and
    evidence.
4.  Link new records to relevant history within the selected Space.
5.  Detect cross-Space dependencies and potential conflicts.
6.  Show a connected Decision Network and an execution/risk dashboard.
7.  Answer questions with citations to meeting evidence.
8.  Require human approval before consequential changes or external
    actions.

Use synthetic demo data for the hackathon. Do not claim production-grade
security, integrations, or model accuracy unless implemented and tested.
