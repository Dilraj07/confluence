# MeridianPay — Smart Routing v2 demo dataset

All company, employee, meeting, transcript, metric, and project data is fictional and created for a CONFLUENCE demo.

## Files
- `meridianpay_seed.sql`: PostgreSQL seed inserts aligned to the logical tables in the project's `DATA_MODEL.md`.
- `DATASET_GUIDE.md`: this guide.

## Scenario
MeridianPay is a fictional B2B payment processor piloting Smart Routing v2. The service selects between payment processors. The pilot exposes a real operational hazard: a processor timeout does not prove that the original processor did not authorise a payment. An unsafe retry may create duplicate authorisation attempts. Risk-decision continuity, payment-data security, observability, rollback, and merchant support become launch gates.

## Contents
- 1 organisation, 1 project, 6 departments/Spaces, 12 synthetic users
- 8 meetings dated 2–11 November 2026
- 16 transcript segments with speaker attribution and timestamps
- 16 evidence records linked to exact transcript segments
- 9 decisions, including a superseded rollout commitment
- 10 tasks, 4 blockers, 3 open questions
- Graph nodes/edges, a cross-team finding, and a pending approval request

## Load
1. Apply Alembic migrations first.
2. Compare actual SQLAlchemy table/column names with `DATA_MODEL.md`.
3. Use a clean development database or take a backup.
4. Run: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f meridianpay_seed.sql`

UUIDs are deterministic. The script is intended for a clean database and is not an upsert; running it twice will cause primary-key conflicts. The script does not delete existing data.

## Important assumptions
- Uses the logical schema described in `DATA_MODEL.md`, including `record_spaces` and `finding_records`.
- `graph_edges.review_status` is set to `confirmed` so the graph appears immediately. Change to `proposed` if your app requires manual review.
- The approval request remains `pending`; the dataset does not claim that rollout expansion has been approved.
- The 5%/20% rollout and 650 ms/0.5% thresholds are fictional demo parameters, not industry standards.
- No real cardholder data, merchant credentials, or real employee information is included.

## Demo questions
- Why was the Smart Routing rollout paused?
- What changed from the original rollout plan?
- What must happen before we can expand to 20%?
- Which teams still have launch blockers, and who owns each action?
- Can Merchant Operations confirm the pilot expansion date?

## Expected answer
The rollout is paused at 5% because the pilot exposed ambiguous processor-timeout handling. The team must restrict unsafe retries, preserve idempotency, verify risk-decision continuity, validate canary monitoring and rollback, complete security review, and prepare merchant support. The original 20% expansion commitment was superseded by a readiness review requiring Payments, SRE, Risk, and Security approval.
