# KPIs and Evaluation Plan

## 1. Measurement philosophy

Do not optimise for the number of agents, number of graph edges, or
volume of generated summaries. Measure whether CONFLUENCE reliably
preserves useful organisational context and helps people find the right
evidence and understand downstream impact.

Separate: - Product adoption and usefulness - Extraction and retrieval
quality - Decision-network quality - System performance and
reliability - Hackathon demo success

For the hackathon, use a small labelled evaluation set and report actual
results. Targets below are **proposed acceptance targets**, not measured
achievements.

## 2. North Star metric

**Verified Context Retrieval Rate (VCRR)**

Percentage of representative user questions for which the system returns
a correct, permission-safe answer with supporting evidence that a
reviewer confirms is sufficient.

``` text
VCRR =
questions answered correctly with sufficient valid evidence
÷
questions in the evaluation set
× 100
```

A correct answer without evidence does not count as a success.

## 3. KPI scorecard

  ------------------------------------------------------------------------
  Area             Metric           Definition                  MVP target
  ---------------- ---------------- ---------------- ---------------------
  Extraction       Decision         Correct                         ≥ 0.85
                   precision        extracted        
                                    decisions / all  
                                    extracted        
                                    decisions        

  Extraction       Decision recall  Correct                         ≥ 0.80
                                    extracted        
                                    decisions / all  
                                    gold decisions   

  Extraction       Task field       Correct owner,                  ≥ 0.85
                   accuracy         due date, and    
                                    action fields on 
                                    labelled tasks   

  Evidence         Evidence         Extracted items                 ≥ 0.95
                   validity         whose evidence   
                                    span supports    
                                    the claim        

  Retrieval        VCRR             Correct answers                 ≥ 0.80
                                    with sufficient  
                                    evidence / test  
                                    questions        

  Retrieval        Citation         Material factual                  100%
                   coverage         claims with a    
                                    valid source     
                                    citation         

  Linking          Relationship     Correct proposed                ≥ 0.80
                   precision        links / all      
                                    reviewed         
                                    proposed links   

  Integrity        Supersession     Correct                         ≥ 0.85
                   accuracy         supersession     
                                    findings /       
                                    reviewed         
                                    supersession     
                                    findings         

  Security         Permission       Restricted                           0
                   leakage          records returned 
                                    to unauthorised  
                                    users            

  Workflow         Reviewability    AI proposals                      100%
                                    shown with       
                                    evidence and     
                                    approve/reject   
                                    controls         

  Performance      Transcript       Time from upload   Record p50/p95; aim
                   processing       to review-ready  under 60 sec for demo
                                    result                      transcript

  Reliability      Workflow         Successful        ≥ 0.95 in demo tests
                   completion       completed runs / 
                                    initiated runs   

  UX               Task completion  Test users               ≥ 4/5 testers
                                    complete core    
                                    workflow without 
                                    assistance       
  ------------------------------------------------------------------------

Targets are directional. A tiny evaluation set produces high
uncertainty; show sample size and examples.

## 4. Evaluation dataset

Create a labelled benchmark of at least: - 8--12 synthetic meeting
transcripts - 30--50 gold decisions, tasks, blockers, and questions -
20--30 questions requiring local retrieval - 10--15 questions requiring
cross-Space retrieval - 5--10 supersession or contradiction cases - 5
permission-denied cases

For each gold item record: - Expected type - Expected content - Source
meeting and evidence span - Expected owner/date if explicitly stated -
Expected Space - Relevant prior record IDs - Whether a relationship is
confirmed, uncertain, or absent

## 5. Metric definitions

### Extraction precision and recall

Use exact or reviewer-approved semantic matching. A task with the wrong
owner or invented due date should not count as fully correct.

### Evidence validity

A reviewer checks whether the cited source span actually supports the
extracted statement. A nearby quote that does not substantiate the claim
is invalid.

### Retrieval quality

Evaluate at question level: - Is the answer factually correct? - Did
retrieval include the relevant record? - Are citations valid and
sufficient? - Did the answer avoid unsupported extrapolation? - Did it
respect the query's intended Space scope?

### Relationship quality

Review each proposed graph edge: - Correct source and target? - Correct
relationship type? - Evidence supports it? - Confidence appropriate? -
Should it be confirmed or remain proposed?

### Permission safety

Run explicit adversarial tests: - Engineering user asks for HR
compensation details. - User follows a graph link to an inaccessible
record. - Cross-Space query includes one permitted and one restricted
source. - Executive asks for a summary where only aggregate risk is
allowed.

The expected result is denial or policy-safe aggregation, never leakage.

## 6. Dashboard metrics

Command Centre: - Meetings processed - Active decisions - Open tasks -
Overdue tasks - Open blockers - Findings awaiting review - Cross-Space
dependencies at risk - Recent decision changes

Space view: - Decisions by status - Tasks by status - Blockers by
age/severity - Meetings over time - Items awaiting review

Executive view: - High-impact risks - Cross-department dependencies -
Changed strategic decisions - Resource conflicts - At-risk commitments

Only show a metric if its underlying query is defined and its data is
available. Label demo/seed data.

## 7. Instrumentation events

Suggested events: - `meeting_upload_started` -
`meeting_ingestion_completed` - `extraction_review_opened` -
`extraction_item_approved` - `extraction_item_rejected` -
`space_context_selected` - `cross_space_link_confirmed` -
`finding_confirmed` - `finding_dismissed` - `decision_superseded` -
`evidence_opened` - `question_submitted` - `answer_citation_opened`

Store event time, organisation, actor, target IDs, and relevant
non-sensitive metadata. Avoid raw transcript content in analytics.

## 8. Hackathon evaluation protocol

1.  Freeze a labelled test set before tuning prompts.
2.  Run the same inputs through the candidate build.
3.  Have a human reviewer score outputs against the gold labels.
4.  Report precision, recall, evidence validity, and retrieval success
    with sample sizes.
5.  Include failure examples and known limitations.
6.  Never present proposed targets as achieved results.
