# Data Model

## 1. Data design principles

-   PostgreSQL is the canonical source of truth.
-   Use UUIDs for persistent entities.
-   Every tenant-owned record includes `organization_id`.
-   A meeting has one primary Space and may have additional linked
    Spaces.
-   Decisions and tasks are canonical records, not duplicated per Space.
-   Graph edges represent relationships, not access rights.
-   Evidence is stored separately and referenced by extracted records.
-   Preserve decision history with explicit lifecycle state and
    supersession links.

## 2. Entity map

``` text
Organization
 ├── Users / Memberships
 ├── Departments
 ├── Spaces (hierarchical)
 │    ├── Space Members / Permissions
 │    └── Meetings ── Meeting Spaces
 │          ├── Transcript Segments
 │          └── Evidence
 ├── Projects
 ├── Decisions ── Decision Versions
 ├── Tasks
 ├── Blockers
 ├── Open Questions
 ├── Findings
 ├── Graph Nodes / Graph Edges
 ├── Approval Requests
 └── Agent Runs / Audit Events
```

## 3. Core tables

The following is a logical schema. Implement with SQLAlchemy models and
Alembic migrations. Adapt types and naming consistently in code.

### organisations

-   `id UUID PRIMARY KEY`
-   `name TEXT NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`

### users

-   `id UUID PRIMARY KEY`
-   `email TEXT NOT NULL`
-   `display_name TEXT NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`

### organisation_members

-   `organisation_id UUID NOT NULL`
-   `user_id UUID NOT NULL`
-   `role TEXT NOT NULL`
-   `status TEXT NOT NULL`
-   Primary key: `(organisation_id, user_id)`

### departments

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `created_at TIMESTAMPTZ NOT NULL`

### spaces

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `department_id UUID`
-   `parent_space_id UUID`
-   `name TEXT NOT NULL`
-   `space_type TEXT NOT NULL`
-   `description TEXT`
-   `sensitivity_level TEXT NOT NULL DEFAULT 'internal'`
-   `created_at TIMESTAMPTZ NOT NULL`

`parent_space_id` enables nested Spaces. Example: Engineering → Backend.

### space_members

-   `space_id UUID NOT NULL`
-   `user_id UUID NOT NULL`
-   `role TEXT NOT NULL`
-   Primary key: `(space_id, user_id)`

### projects

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `name TEXT NOT NULL`
-   `description TEXT`
-   `status TEXT NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`

### meetings

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `primary_space_id UUID NOT NULL`
-   `project_id UUID`
-   `title TEXT NOT NULL`
-   `meeting_date TIMESTAMPTZ`
-   `source_type TEXT NOT NULL` --- `upload`, `paste`, or future
    integration
-   `source_filename TEXT`
-   `created_by UUID NOT NULL`
-   `processing_status TEXT NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`

### meeting_spaces

-   `meeting_id UUID NOT NULL`
-   `space_id UUID NOT NULL`
-   `relationship_type TEXT NOT NULL` --- `primary` or `linked`
-   Primary key: `(meeting_id, space_id)`
-   Enforce one primary Space per meeting, ideally with a partial unique
    index or equivalent application/database constraint.

### transcript_segments

-   `id UUID PRIMARY KEY`
-   `meeting_id UUID NOT NULL`
-   `segment_index INTEGER NOT NULL`
-   `speaker_name TEXT`
-   `start_ms BIGINT`
-   `end_ms BIGINT`
-   `content TEXT NOT NULL`
-   `embedding VECTOR` --- optional pgvector column
-   Unique: `(meeting_id, segment_index)`

### evidence

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `meeting_id UUID NOT NULL`
-   `transcript_segment_id UUID`
-   `start_offset INTEGER`
-   `end_offset INTEGER`
-   `quote TEXT NOT NULL`
-   `speaker_name TEXT`
-   `start_ms BIGINT`
-   `end_ms BIGINT`
-   `created_at TIMESTAMPTZ NOT NULL`

Evidence offsets should be validated against the referenced segment. Do
not fabricate timestamps.

### decisions

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `project_id UUID`
-   `statement TEXT NOT NULL`
-   `decision_type TEXT`
-   `status TEXT NOT NULL` --- `proposed`, `active`, `superseded`,
    `disputed`, `completed`, `cancelled`, `rejected`
-   `source_meeting_id UUID NOT NULL`
-   `confidence NUMERIC`
-   `valid_from TIMESTAMPTZ`
-   `valid_until TIMESTAMPTZ`
-   `created_by UUID`
-   `approved_by UUID`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

### decision_evidence

-   `decision_id UUID NOT NULL`
-   `evidence_id UUID NOT NULL`
-   Primary key: `(decision_id, evidence_id)`

### decision_versions

-   `id UUID PRIMARY KEY`
-   `decision_id UUID NOT NULL`
-   `version_number INTEGER NOT NULL`
-   `statement TEXT NOT NULL`
-   `status TEXT NOT NULL`
-   `change_reason TEXT`
-   `source_meeting_id UUID`
-   `evidence_id UUID`
-   `created_by UUID`
-   `created_at TIMESTAMPTZ NOT NULL`
-   Unique: `(decision_id, version_number)`

For major changed decisions, prefer a new canonical decision record
connected by `SUPERSEDES`. Use versions for edits to the same decision's
wording or metadata. Preserve both.

### tasks

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `project_id UUID`
-   `title TEXT NOT NULL`
-   `description TEXT`
-   `status TEXT NOT NULL` --- `proposed`, `open`, `in_progress`,
    `blocked`, `completed`, `cancelled`
-   `priority TEXT`
-   `owner_user_id UUID`
-   `due_at TIMESTAMPTZ`
-   `source_meeting_id UUID NOT NULL`
-   `origin_decision_id UUID`
-   `confidence NUMERIC`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `updated_at TIMESTAMPTZ NOT NULL`

### task_evidence

-   `task_id UUID NOT NULL`
-   `evidence_id UUID NOT NULL`
-   Primary key: `(task_id, evidence_id)`

### blockers

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `project_id UUID`
-   `title TEXT NOT NULL`
-   `description TEXT`
-   `status TEXT NOT NULL` --- `open`, `mitigating`, `resolved`,
    `wont_fix`
-   `severity TEXT`
-   `source_meeting_id UUID NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `resolved_at TIMESTAMPTZ`

### open_questions

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `question TEXT NOT NULL`
-   `status TEXT NOT NULL` --- `open`, `answered`, `deferred`,
    `cancelled`
-   `source_meeting_id UUID NOT NULL`
-   `owner_user_id UUID`
-   `created_at TIMESTAMPTZ NOT NULL`

### graph_nodes

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `node_type TEXT NOT NULL`
-   `entity_id UUID NOT NULL`
-   `label TEXT NOT NULL`
-   `created_at TIMESTAMPTZ NOT NULL`
-   Unique: `(node_type, entity_id)`

### graph_edges

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `source_node_id UUID NOT NULL`
-   `target_node_id UUID NOT NULL`
-   `relation_type TEXT NOT NULL`
-   `confidence NUMERIC`
-   `evidence_id UUID`
-   `origin_meeting_id UUID`
-   `review_status TEXT NOT NULL` --- `proposed`, `confirmed`,
    `rejected`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `created_by UUID`

### findings

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `finding_type TEXT NOT NULL`
-   `severity TEXT NOT NULL`
-   `title TEXT NOT NULL`
-   `explanation TEXT NOT NULL`
-   `confidence NUMERIC`
-   `status TEXT NOT NULL` --- `new`, `in_review`, `confirmed`,
    `dismissed`, `resolved`
-   `source_meeting_id UUID`
-   `created_at TIMESTAMPTZ NOT NULL`

Related records should be stored in a `finding_records` join table
rather than as an unvalidated JSON array.

### finding_records

-   `finding_id UUID NOT NULL`
-   `record_type TEXT NOT NULL`
-   `record_id UUID NOT NULL`
-   `relationship TEXT`
-   Primary key: `(finding_id, record_type, record_id)`

### approval_requests

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `requested_by UUID NOT NULL`
-   `reviewed_by UUID`
-   `target_type TEXT NOT NULL`
-   `target_id UUID NOT NULL`
-   `proposed_action TEXT NOT NULL`
-   `status TEXT NOT NULL` --- `pending`, `approved`, `rejected`
-   `created_at TIMESTAMPTZ NOT NULL`
-   `reviewed_at TIMESTAMPTZ`

### agent_runs

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `workflow_type TEXT NOT NULL`
-   `target_id UUID`
-   `status TEXT NOT NULL`
-   `model_provider TEXT`
-   `model_name TEXT`
-   `prompt_version TEXT`
-   `started_at TIMESTAMPTZ NOT NULL`
-   `completed_at TIMESTAMPTZ`
-   `error_code TEXT`
-   `metadata JSONB`

### audit_events

-   `id UUID PRIMARY KEY`
-   `organisation_id UUID NOT NULL`
-   `actor_user_id UUID`
-   `action TEXT NOT NULL`
-   `target_type TEXT NOT NULL`
-   `target_id UUID`
-   `metadata JSONB`
-   `created_at TIMESTAMPTZ NOT NULL`

## 4. Space association

Decisions/tasks should be associated to Spaces through a join table if
they need explicit multi-Space visibility:

`record_spaces(record_type, record_id, space_id, relationship_type)`

Do not infer access from this association alone. The policy layer must
check the record's source and sensitivity policy.

## 5. Indexes

Add indexes for: - All `organisation_id` columns -
`meetings(primary_space_id, meeting_date)` -
`transcript_segments(meeting_id, segment_index)` -
`decisions(project_id, status, created_at)` -
`tasks(owner_user_id, status, due_at)` -
`findings(status, severity, created_at)` -
`graph_edges(source_node_id, relation_type)` -
`graph_edges(target_node_id, relation_type)` -
`meeting_spaces(space_id, meeting_id)`

Add a pgvector index only after selecting the embedding dimension and
distance metric.

## 6. Data integrity constraints

-   Foreign keys on all relational references.
-   One primary Space per meeting.
-   Decision/task status values constrained.
-   Evidence must reference a segment from the same meeting as the
    evidence record.
-   Graph edge source and target nodes must belong to the same
    organisation.
-   No cross-organisation relationships.
-   A `SUPERSEDES` edge must connect compatible decision records.
-   A completed task must not be reopened by an agent without an
    explicit state transition.
-   Every approved extraction must retain its originating meeting and
    evidence.

## 7. Demo seed data

Create: - One demo organisation - Departments: Engineering, HR,
Product - Spaces: Backend, Recruitment, Platform Launch - 10--12
meetings over a few weeks - A December launch decision, a backend API
blocker, a recruitment capacity shortfall, a marketing commitment, and a
later January launch decision - Tasks and evidence spans that connect
these events

Keep the seed data synthetic and clearly labelled as demo data.
