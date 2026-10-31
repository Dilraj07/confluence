# Five-Minute Demo Script: MeridianPay Smart Routing v2

## Demo objective

Show that CONFLUENCE is not a simple summariser. It is an intelligent organizational memory network that preserves context across Spaces, tracks decision lineage through supersession, flags cross-space blockers, and explains how a technical hazard in one meeting halts business execution elsewhere.

## Demo setup

MeridianPay is piloting **Smart Routing v2** across 6 collaborative Spaces:

- **Payments Platform**: Core routing logic and processor integrations
- **Site Reliability Engineering (SRE)**: Latency budgets, circuit breakers, and canary gates
- **Risk & Fraud**: Scoring models, shadow mode validation, and fraud thresholds
- **Security & Compliance**: Multi-processor tokenization and PCI-DSS failover compliance
- **Merchant Operations**: Merchant onboarding, pilot SLAs, and communication drafts
- **Product & Strategy**: Go/no-go readiness gates and executive coordination

### Scenario Timeline & The Operational Hazard

1. **Initial Plan (Nov 2)**: Pilot launched at 5% traffic with an automated milestone to expand to 20%.
2. **The Operational Hazard (Nov 4)**: In test scenarios where a processor took 3 seconds to respond, failover to Stripe triggered a second authorization. Because timeouts are ambiguous (the bank may have actually approved the payment before the timeout), automatic failovers risked **duplicate customer charges**.
3. **The Executive Decision (Nov 4)**: Maya Chen formally pauses the rollout at 5%. The original 20% expansion commitment is **superseded** by Decision `57635a88` requiring a formal 14 November readiness review with 4 mandatory team sign-offs (Payments, SRE, Risk, Security).
4. **Cross-Space Blockers**:
   - **Payments Platform**: Daniel Foster must deliver idempotent retry handling and reconciliation.
   - **SRE**: Priya Nair must validate circuit-breaker tripping under simulated timeouts.
   - **Risk & Fraud**: Omar Hassan must complete shadow mode scoring through 13 November.
   - **Merchant Operations**: Sarah Kim must hold all merchant pilot expansion communications in draft.

---

## Run of show

### 0:00–0:35 — The Problem

"Teams don't lack meeting notes. They lack connected organizational memory. A 3-second processor timeout discovered in Payments creates a duplicate charge risk that blocks SRE canary gates, invalidates Risk assumptions, and forces Merchant Operations to halt customer notifications. In traditional tools, these facts live in separate silos and lead to disastrous launches."

### 0:35–1:15 — The Executive Home

Show the executive workspace:
- Greeted as **Maya Chen (Product Manager)**.
- Review the high-priority attention card: *Smart Routing v2 paused at 5% traffic due to duplicate authorization hazard*.
- Notice the four active cross-space blockers and their direct owners (Daniel Foster, Priya Nair, Omar Hassan, Sarah Kim).

### 1:15–2:15 — Spaces & Cross-Space Dependencies

Navigate into **Spaces**:
- Open **Payments Platform Space**: inspect the recent meetings, decisions, and documents (RFC-204 Idempotent Failover Protocol).
- Open **Merchant Operations Space**: observe the dependency warning explaining why merchant communication is blocked on Payments idempotency and Risk sign-off.
- Inspect the **Audit Activity Stream** with cryptographic hash verification.

### 2:15–3:15 — Decision Lineage & Impact Analysis

Switch to **Knowledge / Decision Network**:
- **Timeline View**: Trace the 8 chronological decisions from 2 Nov to 11 Nov. Point out the red `SUPERSEDED` badge on Decision `e4c9dfff` (*Expand pilot to 20%*) and how it points forward to Decision `57635a88` (*Replace with 14 Nov four-team review*).
- **Impact Analysis Simulator**: Click through the 3 operational scenarios:
  1. *14 November Launch Gate Decision*: see which 4 teams and 6 commitments are impacted.
  2. *Timeout Ambiguity Hazard*: see how failure to implement idempotency blocks Merchant Ops and triggers regulatory duplicate charge exposure.
  3. *Risk Score Continuity*: see what happens if high-velocity fraud spikes occur.

### 3:15–4:15 — Ask CONFLUENCE (Wispr Flow Voice & Scoped AI)

Open **Ask CONFLUENCE**:
- Test the 5 core MeridianPay evaluation questions:
  1. *"Why was the Smart Routing rollout paused?"*
  2. *"What changed from the original rollout plan?"*
  3. *"What must happen before we can expand to 20%?"*
  4. *"Which teams still have launch blockers, and who owns each action?"*
  5. *"Can Merchant Operations confirm the pilot expansion date?"*
- Highlight that every statement cites exact, verbatim transcript segments with timestamps and verified speaker turns (e.g. `[00:02:15] Daniel Foster (Payments Lead)`).
- Demonstrate Wispr Flow voice dictation workflow into the focused query bar.

### 4:15–5:00 — My Work & Execution Tracker

Open **My Work**:
- View Maya Chen's assigned commitments (Go/no-go readiness review documentation).
- Filter across all 10 commitments by assignee (Daniel Foster, Elena Petrova, Priya Nair, Omar Hassan, Sarah Kim).
- Show how every task links back to its originating meeting transcript and decision evidence.
