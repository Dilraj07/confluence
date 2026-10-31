# API Contracts

These are proposed REST contracts for the MVP. Keep naming and response
shapes consistent across frontend and backend.

## 1. Conventions

-   Base path: `/api/v1`
-   JSON request and response bodies.
-   UUIDs for entity IDs.
-   ISO 8601 timestamps with timezone.
-   Return structured errors.
-   Authenticate every non-public endpoint.
-   Enforce organisation and Space access server-side.

Example error:

``` json
{
  "error": {
    "code": "SPACE_ACCESS_DENIED",
    "message": "You do not have access to this Space.",
    "request_id": "uuid"
  }
}
```

## 2. Spaces

### `GET /spaces`

List Spaces visible to the authenticated user.

Optional query: - `department_id` - `parent_space_id`

### `GET /spaces/{space_id}`

Return Space details and permitted summary.

### `POST /spaces`

Create a Space (admin/manager only).

Request:

``` json
{
  "name": "Backend",
  "department_id": "uuid",
  "parent_space_id": null,
  "space_type": "project",
  "description": "Backend engineering decisions and delivery."
}
```

## 3. Meetings

### `POST /meetings`

Create a meeting from pasted transcript or upload metadata.

Request:

``` json
{
  "title": "Platform launch review",
  "primary_space_id": "uuid",
  "linked_space_ids": ["uuid"],
  "project_id": "uuid",
  "source_type": "paste",
  "transcript_text": "Transcript text..."
}
```

For file upload, use multipart form data and a separate upload endpoint
if required.

Response:

``` json
{
  "meeting_id": "uuid",
  "processing_status": "queued"
}
```

### `GET /meetings/{meeting_id}`

Return meeting metadata, transcript segments, processing state, and
permitted extracted records.

### `POST /meetings/{meeting_id}/process`

Start or retry extraction. Ensure idempotency so duplicate requests do
not create duplicate records.

## 4. Extraction review

### `GET /meetings/{meeting_id}/candidates`

Return proposed decisions, tasks, blockers, questions, and evidence.

Candidate example:

``` json
{
  "candidate_id": "uuid",
  "candidate_type": "decision",
  "content": "Move the platform launch to January.",
  "confidence": 0.91,
  "review_status": "pending",
  "evidence": [
    {
      "evidence_id": "uuid",
      "segment_id": "uuid",
      "quote": "We should move the launch to January.",
      "speaker": "Product Lead",
      "start_ms": 125000
    }
  ]
}
```

### `POST /meetings/{meeting_id}/review`

Approve or reject candidate items.

Request:

``` json
{
  "decisions": [
    {"candidate_id": "uuid", "action": "approve"}
  ],
  "tasks": [
    {"candidate_id": "uuid", "action": "reject", "reason": "Not an actionable commitment"}
  ]
}
```

Backend must validate that all candidate IDs belong to the meeting and
organisation.

## 5. Decisions and tasks

### `GET /decisions`

Filters: - `space_id` - `project_id` - `status` - `from` - `to`

### `GET /decisions/{decision_id}`

Return decision, versions, source meeting, evidence, and permitted graph
relationships.

### `GET /tasks`

Filters: - `space_id` - `owner_user_id` - `status` - `due_before` -
`project_id`

### `PATCH /tasks/{task_id}`

Allow permitted human edits. Record an audit event. Do not let an agent
silently update a task.

## 6. Decision Network

### `GET /graph`

Query parameters: - `space_id` - `focus_node_id` - `depth` (bounded) -
`node_types` - `from` - `to`

Return only nodes and edges the user may access.

Response:

``` json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "decision",
      "label": "Launch moved to January",
      "status": "active"
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "uuid",
      "target": "uuid",
      "type": "supersedes",
      "review_status": "confirmed"
    }
  ]
}
```

## 7. Findings and impact

### `GET /findings`

Filters: - `status` - `severity` - `space_id` - `finding_type`

### `POST /findings/{finding_id}/review`

Request:

``` json
{
  "action": "confirm",
  "comment": "Confirmed in launch review."
}
```

Allowed actions: `confirm`, `dismiss`, `resolve`. Enforce allowed state
transitions.

## 8. Ask

### `POST /ask`

Request:

``` json
{
  "question": "What is threatening the January platform launch?",
  "space_id": null,
  "scope": "relevant_accessible_spaces"
}
```

Response:

``` json
{
  "answer": "The launch is exposed to an unresolved backend API dependency...",
  "scope_used": [
    {"space_id": "uuid", "space_name": "Backend"}
  ],
  "claims": [
    {
      "text": "The backend API dependency remains unresolved.",
      "evidence": [
        {
          "meeting_id": "uuid",
          "meeting_title": "Backend delivery review",
          "evidence_id": "uuid",
          "quote": "The API integration is still blocked..."
        }
      ]
    }
  ],
  "uncertainties": [
    "The latest launch date is recorded as proposed, not finally approved."
  ]
}
```

Validate citations against records accessible to the user before
returning the answer.

## 9. Dashboard

### `GET /dashboard/overview`

Return aggregate counts and recent activity for the selected Space or
permission-safe organisation scope.

### `GET /dashboard/executive`

Return approved strategic decisions, cross-Space findings, and
aggregated risk summaries visible to the user.

## 10. Idempotency and reliability

-   Accept an `Idempotency-Key` for transcript processing and review
    submissions.
-   Processing should be safe to retry.
-   Keep agent output separate from committed domain records.
-   Use transactions for approvals that create multiple related records.
-   Return processing run IDs and expose run status.
