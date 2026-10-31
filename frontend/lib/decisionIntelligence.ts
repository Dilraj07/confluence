import { Decision } from '@/types';

export interface DecisionHistoryEvent {
  step: number;
  date: string;
  phase: 'Problem identified' | 'Initial proposal' | 'Architecture approval' | 'Revision' | 'Superseded' | 'Validation';
  title: string;
  description: string;
  statusBadge: string;
  statusBadgeColor: string;
  meeting: string;
  evidenceId: string;
  actor: string;
}

export interface DecisionIntelligenceRecord {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  status: 'active' | 'revised' | 'superseded' | 'blocked' | 'under_review';
  statusLabel: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  space: string;
  decisionType: string;
  owner: string;
  ownerRole: string;
  originMeeting: string;
  originMeetingId?: string;
  originDate: string;
  latestUpdate: string;
  firstProposedDate: string;
  lastRevisedDate: string;
  linkedMeetingsCount: number;
  affectedTeamsCount: number;
  openDependenciesCount: number;
  summary: string;
  problemRationale: string;
  evidence: {
    segmentId: string;
    quote: string;
    speaker: string;
    speakerRole: string;
    meetingName: string;
    meetingDate: string;
    timestamp: string;
  };
  history: DecisionHistoryEvent[];
  affectedWorkstreams: Array<{
    team: string;
    category: 'routing' | 'integration' | 'qa' | 'risk' | 'compliance' | 'merchant';
    impact: string;
    status: 'In progress' | 'Blocked' | 'Completed' | 'Pending';
  }>;
  downstreamMilestone: {
    name: string;
    status: 'At risk · validation incomplete' | 'Pending four-team review' | 'On hold';
    description: string;
  };
  lineageNodes: Array<{
    id: string;
    type: 'origin' | 'proposal' | 'decision' | 'revision' | 'outcome';
    column: number;
    title: string;
    sub: string;
    date: string;
    badge: string;
    badgeColor: string;
  }>;
  lineageEdges: Array<{
    from: string;
    to: string;
    label: string;
  }>;
  dependencies: Array<{
    type: 'Depends on' | 'Affects' | 'Supersedes' | 'Contradicts' | 'Evidence for' | 'Mitigates';
    target: string;
    team: string;
    relationshipReason: string;
    establishedInMeeting: string;
    severity?: 'critical' | 'high' | 'medium';
  }>;
}

export const CANONICAL_DECISIONS: DecisionIntelligenceRecord[] = [
  {
    id: 'dec-014',
    code: 'DEC-014',
    title: 'Adopt idempotency keys for payment retries',
    shortTitle: 'Payment idempotency',
    status: 'revised',
    statusLabel: 'Revised',
    impactLevel: 'high',
    space: 'Payments Platform',
    decisionType: 'Architecture decision',
    owner: 'Payments Engineering',
    ownerRole: 'Elena Petrova (Staff Backend) & Daniel Foster (Lead)',
    originMeeting: 'Payment Incident Review',
    originMeetingId: 'ea655bba-f14e-521d-8ec8-458fa2398acb',
    originDate: '18 Oct 2026',
    latestUpdate: '29 Oct 2026',
    firstProposedDate: '18 October 2026',
    lastRevisedDate: '29 October 2026',
    linkedMeetingsCount: 4,
    affectedTeamsCount: 3,
    openDependenciesCount: 1,
    summary:
      'Every logical payment must carry a stable idempotency key. Retry attempts for that payment must reuse the same key so the system can identify duplicate requests and return the original result instead of executing the payment again.',
    problemRationale:
      'Payment provider timeouts created severe ambiguity about whether transactions had actually succeeded at the banking partner. Retrying without a stable request identity risked duplicate customer charges.',
    evidence: {
      segmentId: 'S-018',
      quote:
        'We received a timeout, but the provider may already have processed the payment. Retrying it as a new request is exactly where duplicate execution can happen.',
      speaker: 'Elena Petrova',
      speakerRole: 'Staff Backend Architect',
      meetingName: 'Payment Incident Review',
      meetingDate: '18 Oct 2026',
      timestamp: '14:32'
    },
    history: [
      {
        step: 1,
        date: '18 Oct',
        phase: 'Problem identified',
        title: 'Duplicate execution risk discovered after provider timeouts',
        description:
          'Payment Operations flagged duplicate authorization incidents on test merchant accounts following 3-second processor timeouts.',
        statusBadge: 'Incident logged',
        statusBadgeColor: 'bg-red-50 text-red-700 border-red-200',
        meeting: 'Payment Incident Review',
        evidenceId: 'S-018',
        actor: 'Elena Petrova'
      },
      {
        step: 2,
        date: '20 Oct',
        phase: 'Initial proposal',
        title: 'Introduce exponential backoff for retry handling',
        description:
          'Engineering initially proposed retrying timeout requests with randomized exponential backoff intervals.',
        statusBadge: 'Superseded in part',
        statusBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        meeting: 'Engineering Design Sync',
        evidenceId: 'S-021',
        actor: 'Daniel Foster'
      },
      {
        step: 3,
        date: '24 Oct',
        phase: 'Architecture approval',
        title: 'Adopt stable idempotency keys across retries',
        description:
          'Payments Architecture approved mandating the same client idempotency key across all internal retry and provider failover paths.',
        statusBadge: 'Approved',
        statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        meeting: 'Architecture Review Board',
        evidenceId: 'S-029',
        actor: 'Architecture Review'
      },
      {
        step: 4,
        date: '29 Oct',
        phase: 'Revision',
        title: 'Extend key-retention policy from 24h to 72h',
        description:
          'QA testing revealed delayed asynchronous processor webhooks arriving past 24 hours. Retention extended to 72 hours.',
        statusBadge: 'Current version',
        statusBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        meeting: 'Reliability Test Review',
        evidenceId: 'S-035',
        actor: 'Elena Petrova & QA'
      }
    ],
    affectedWorkstreams: [
      {
        team: 'Payments Platform',
        category: 'routing',
        impact: 'Routing service updates to attach stable idempotency headers across gateway nodes.',
        status: 'In progress'
      },
      {
        team: 'Merchant Integrations',
        category: 'integration',
        impact: 'Propagate merchant client keys to downstream Stripe & Adyen provider adapters.',
        status: 'Blocked'
      },
      {
        team: 'QA & Reliability',
        category: 'qa',
        impact: 'Execute multi-provider timeout injection and duplicate-request fuzz testing.',
        status: 'In progress'
      },
      {
        team: 'Risk & Fraud',
        category: 'risk',
        impact: 'Ensure shadow fraud scoring does not recalculate or diverge on idempotent retries.',
        status: 'Completed'
      }
    ],
    downstreamMilestone: {
      name: 'Smart Routing v2 readiness',
      status: 'At risk · validation incomplete',
      description:
        'Downstream pilot expansion past 5% cannot proceed until end-to-end idempotency test passes.'
    },
    lineageNodes: [
      {
        id: 'node-origin',
        type: 'origin',
        column: 0,
        title: 'Payment timeout incident',
        sub: 'Payment Incident Review · 18 Oct',
        date: '18 Oct 2026',
        badge: 'ORIGIN',
        badgeColor: 'bg-red-50 text-red-700 border-red-200'
      },
      {
        id: 'node-proposal',
        type: 'proposal',
        column: 1,
        title: 'Exponential backoff retries',
        sub: 'Engineering Design Review · 20 Oct',
        date: '20 Oct 2026',
        badge: 'INITIAL PROPOSAL',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'node-decision',
        type: 'decision',
        column: 2,
        title: 'Stable idempotency keys',
        sub: 'Architecture Review · 24 Oct',
        date: '24 Oct 2026',
        badge: 'APPROVED DECISION',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/30'
      },
      {
        id: 'node-revision',
        type: 'revision',
        column: 3,
        title: 'Extend key-retention to 72h',
        sub: 'Reliability Test Review · 29 Oct',
        date: '29 Oct 2026',
        badge: 'REVISION',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
      },
      {
        id: 'node-outcome',
        type: 'outcome',
        column: 4,
        title: 'Retry safety validation',
        sub: 'QA & Merchant Integration Tests',
        date: '14 Nov Gate',
        badge: 'DOWNSTREAM OUTCOME',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    ],
    lineageEdges: [
      { from: 'node-origin', to: 'node-proposal', label: 'EVIDENCE FOR' },
      { from: 'node-proposal', to: 'node-decision', label: 'SUPERSEDED BY' },
      { from: 'node-decision', to: 'node-revision', label: 'REVISED TO' },
      { from: 'node-revision', to: 'node-outcome', label: 'AFFECTS' }
    ],
    dependencies: [
      {
        type: 'Depends on',
        target: 'Merchant Integrations: Key propagation SDK rollout',
        team: 'Merchant Operations',
        relationshipReason:
          'End-to-end idempotency guarantees require merchant client headers before traffic expansion.',
        establishedInMeeting: 'Merchant Integration Sync · 27 Oct',
        severity: 'critical'
      },
      {
        type: 'Affects',
        target: 'Payments Platform: Distributed cache table partitioning',
        team: 'Payments Platform',
        relationshipReason:
          'Extending retention to 72 hours increases Redis/Postgres storage requirements by 300%.',
        establishedInMeeting: 'Reliability Test Review · 29 Oct',
        severity: 'high'
      },
      {
        type: 'Supersedes',
        target: 'DEC-009: Exponential backoff retries without idempotency identity',
        team: 'Payments Platform',
        relationshipReason:
          'Pure backoff retries fail to eliminate duplicate charge hazard during provider timeouts.',
        establishedInMeeting: 'Architecture Review Board · 24 Oct'
      },
      {
        type: 'Mitigates',
        target: 'Active Blocker: Double authorization charges on 3-second provider timeout',
        team: 'Payments Platform & Risk',
        relationshipReason:
          'Reusing the same key allows banking processors to deduplicate repeated authorization attempts.',
        establishedInMeeting: 'Payment Incident Review · 18 Oct',
        severity: 'critical'
      },
      {
        type: 'Evidence for',
        target: 'Transcript S-018: Root cause analysis of provider timeout ambiguity',
        team: 'Payments Platform',
        relationshipReason:
          'Verbatim proof that processor timeouts do not guarantee transaction cancellation.',
        establishedInMeeting: 'Payment Incident Review · 18 Oct'
      }
    ]
  },
  {
    id: 'dec-009',
    code: 'DEC-009',
    title: 'Retry failed requests with exponential backoff',
    shortTitle: 'Retry backoff policy',
    status: 'superseded',
    statusLabel: 'Superseded in part',
    impactLevel: 'high',
    space: 'Payments Platform',
    decisionType: 'Engineering policy',
    owner: 'Payments Engineering',
    ownerRole: 'Daniel Foster (Payments Lead)',
    originMeeting: 'Payment Incident Review',
    originMeetingId: 'ea655bba-f14e-521d-8ec8-458fa2398acb',
    originDate: '18 Oct 2026',
    latestUpdate: '24 Oct 2026',
    firstProposedDate: '18 October 2026',
    lastRevisedDate: '24 October 2026',
    linkedMeetingsCount: 2,
    affectedTeamsCount: 2,
    openDependenciesCount: 0,
    summary:
      'Retry with exponential backoff was retained as a transient network retry policy, but no longer treated as sufficient protection against duplicate execution.',
    problemRationale:
      'Network blips between gateway and provider endpoints required retry handling, but exponential backoff alone failed to prevent double-charges on banking timeouts.',
    evidence: {
      segmentId: 'S-021',
      quote:
        'Exponential backoff gives the gateway time to recover, but if the bank already received the initial byte stream, another retry can issue a second charge.',
      speaker: 'Daniel Foster',
      speakerRole: 'Payments Lead',
      meetingName: 'Engineering Design Sync',
      meetingDate: '20 Oct 2026',
      timestamp: '11:15'
    },
    history: [
      {
        step: 1,
        date: '18 Oct',
        phase: 'Problem identified',
        title: 'Network timeout handling needed',
        description: 'Gateway needed a formalized protocol for non-responsive provider connections.',
        statusBadge: 'Proposed',
        statusBadgeColor: 'bg-stone-100 text-stone-700',
        meeting: 'Payment Incident Review',
        evidenceId: 'S-018',
        actor: 'Daniel Foster'
      },
      {
        step: 2,
        date: '20 Oct',
        phase: 'Initial proposal',
        title: 'Formalized 3-interval exponential backoff',
        description: 'Adopted 500ms, 1500ms, and 4500ms retry backoff schedule.',
        statusBadge: 'Active temporary',
        statusBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        meeting: 'Engineering Design Sync',
        evidenceId: 'S-021',
        actor: 'Engineering'
      },
      {
        step: 3,
        date: '24 Oct',
        phase: 'Superseded',
        title: 'Superseded by stable idempotency requirement',
        description: 'Formally superseded as the duplicate prevention mechanism by DEC-014.',
        statusBadge: 'Superseded in part',
        statusBadgeColor: 'bg-amber-100 text-amber-800',
        meeting: 'Architecture Review Board',
        evidenceId: 'S-029',
        actor: 'Architecture Board'
      }
    ],
    affectedWorkstreams: [
      {
        team: 'Payments Platform',
        category: 'routing',
        impact: 'Backoff intervals retained for socket timeouts only.',
        status: 'Completed'
      }
    ],
    downstreamMilestone: {
      name: 'Smart Routing v2 kickoff',
      status: 'On hold',
      description: 'Backoff alone is insufficient for production rollout.'
    },
    lineageNodes: [
      {
        id: 'node-origin-009',
        type: 'origin',
        column: 0,
        title: 'Socket timeout analysis',
        sub: 'Payment Incident Review · 18 Oct',
        date: '18 Oct 2026',
        badge: 'ORIGIN',
        badgeColor: 'bg-red-50 text-red-700'
      },
      {
        id: 'node-decision-009',
        type: 'decision',
        column: 1,
        title: 'Backoff retry policy',
        sub: 'Engineering Design Review · 20 Oct',
        date: '20 Oct 2026',
        badge: 'SUPERSEDED POLICY',
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        id: 'node-superseded-by',
        type: 'outcome',
        column: 2,
        title: 'DEC-014 Idempotency keys',
        sub: 'Architecture Review · 24 Oct',
        date: '24 Oct 2026',
        badge: 'REPLACED BY',
        badgeColor: 'bg-blue-50 text-blue-700'
      }
    ],
    lineageEdges: [
      { from: 'node-origin-009', to: 'node-decision-009', label: 'EVIDENCE FOR' },
      { from: 'node-decision-009', to: 'node-superseded-by', label: 'SUPERSEDED BY' }
    ],
    dependencies: [
      {
        type: 'Supersedes',
        target: 'DEC-014: Idempotency keys replaced pure backoff as primary safety mechanism',
        team: 'Payments Platform',
        relationshipReason: 'Eliminated double-authorization risk on banking timeouts.',
        establishedInMeeting: 'Architecture Review Board · 24 Oct'
      }
    ]
  },
  {
    id: 'dec-018',
    code: 'DEC-018',
    title: 'Propagate merchant client keys to payment providers',
    shortTitle: 'Merchant key propagation',
    status: 'blocked',
    statusLabel: 'Blocked',
    impactLevel: 'high',
    space: 'Merchant Operations',
    decisionType: 'Integration policy',
    owner: 'Merchant Operations',
    ownerRole: 'Sarah Kim (Merchant Ops Lead)',
    originMeeting: 'Merchant Integration Sync',
    originMeetingId: '7ca3e7f4-f3c5-555e-a615-56faea25c8fe',
    originDate: '27 Oct 2026',
    latestUpdate: '04 Nov 2026',
    firstProposedDate: '27 October 2026',
    lastRevisedDate: '04 November 2026',
    linkedMeetingsCount: 3,
    affectedTeamsCount: 2,
    openDependenciesCount: 1,
    summary:
      'Merchant integration changes and SDK updates are required before end-to-end idempotency can be validated across tier-1 pilot merchants.',
    problemRationale:
      'If pilot merchants do not pass original client transaction tokens, the Smart Routing platform cannot guarantee end-to-end deduplication on external retry calls.',
    evidence: {
      segmentId: 'S-031',
      quote:
        'We cannot guarantee zero duplicate charges unless merchant checkouts forward the client idempotency token through our public API gateway.',
      speaker: 'Sarah Kim',
      speakerRole: 'Merchant Ops Lead',
      meetingName: 'Merchant Integration Sync',
      meetingDate: '27 Oct 2026',
      timestamp: '16:00'
    },
    history: [
      {
        step: 1,
        date: '27 Oct',
        phase: 'Initial proposal',
        title: 'Mandatory client token header requirement',
        description: 'Proposed requiring Idempotency-Key header on all v2 checkout POST endpoints.',
        statusBadge: 'Proposed',
        statusBadgeColor: 'bg-stone-100 text-stone-700',
        meeting: 'Merchant Integration Sync',
        evidenceId: 'S-031',
        actor: 'Sarah Kim'
      },
      {
        step: 2,
        date: '04 Nov',
        phase: 'Problem identified',
        title: 'Merchant SDK rollout blocker discovered',
        description: 'Two top pilot merchants reported inability to update SDKs before 11 November.',
        statusBadge: 'Blocked',
        statusBadgeColor: 'bg-red-50 text-red-700 border-red-200',
        meeting: 'Executive Coordination Review',
        evidenceId: 'S-044',
        actor: 'Merchant Operations'
      }
    ],
    affectedWorkstreams: [
      {
        team: 'Merchant Operations',
        category: 'merchant',
        impact: 'Merchant communications held in draft pending readiness gate.',
        status: 'Blocked'
      },
      {
        team: 'Payments Platform',
        category: 'integration',
        impact: 'Must provide fallback synthetic key generator for non-compliant merchant requests.',
        status: 'In progress'
      }
    ],
    downstreamMilestone: {
      name: 'Pilot expansion past 5%',
      status: 'At risk · validation incomplete',
      description: 'Pilot expansion blocked until merchant token adoption passes 90% threshold.'
    },
    lineageNodes: [
      {
        id: 'node-origin-018',
        type: 'origin',
        column: 0,
        title: 'Merchant API requirements',
        sub: 'Integration Sync · 27 Oct',
        date: '27 Oct 2026',
        badge: 'ORIGIN',
        badgeColor: 'bg-stone-100 text-stone-800'
      },
      {
        id: 'node-decision-018',
        type: 'decision',
        column: 1,
        title: 'Mandatory client keys',
        sub: 'Integration Sync · 27 Oct',
        date: '27 Oct 2026',
        badge: 'DECISION',
        badgeColor: 'bg-blue-50 text-blue-700'
      },
      {
        id: 'node-blocker-018',
        type: 'revision',
        column: 2,
        title: 'Tier-1 SDK upgrade blocker',
        sub: 'Coordination Review · 04 Nov',
        date: '04 Nov 2026',
        badge: 'BLOCKED',
        badgeColor: 'bg-red-50 text-red-700'
      }
    ],
    lineageEdges: [
      { from: 'node-origin-018', to: 'node-decision-018', label: 'EVIDENCE FOR' },
      { from: 'node-decision-018', to: 'node-blocker-018', label: 'BLOCKED BY' }
    ],
    dependencies: [
      {
        type: 'Depends on',
        target: 'DEC-014: Payments Platform core idempotency cache table',
        team: 'Payments Platform',
        relationshipReason: 'Merchant keys must map to internal transaction records in database.',
        establishedInMeeting: 'Architecture Review Board · 24 Oct',
        severity: 'critical'
      },
      {
        type: 'Affects',
        target: 'Sarah Kim commitment: Draft merchant notification revision',
        team: 'Merchant Operations',
        relationshipReason: 'Cannot confirm pilot expansion dates to merchants.',
        establishedInMeeting: 'Executive Coordination Review · 04 Nov',
        severity: 'high'
      }
    ]
  },
  {
    id: 'dec-002',
    code: 'DEC-002',
    title: 'Replace planned 20% expansion with 14 November readiness review requiring four team approvals',
    shortTitle: '14 Nov Readiness Review Gate',
    status: 'active',
    statusLabel: 'Active Gate',
    impactLevel: 'critical',
    space: 'Product & Strategy',
    decisionType: 'Executive governance gate',
    owner: 'Product & Strategy',
    ownerRole: 'Maya Chen (Product Manager)',
    originMeeting: 'Executive Coordination Review',
    originMeetingId: '2033cb92-95e6-5580-a51a-b199bbb8b69f',
    originDate: '04 Nov 2026',
    latestUpdate: '04 Nov 2026',
    firstProposedDate: '04 November 2026',
    lastRevisedDate: '04 November 2026',
    linkedMeetingsCount: 5,
    affectedTeamsCount: 4,
    openDependenciesCount: 4,
    summary:
      'The planned automated expansion from 5% to 20% is halted. Pilot expansion requires formal readiness sign-off on 14 November from Payments, SRE, Risk, and Security.',
    problemRationale:
      'Timeout ambiguity and shadow scoring gaps make premature expansion unsafe for real payment traffic.',
    evidence: {
      segmentId: 'S-044',
      quote:
        'We cannot expand past 5% on an arbitrary calendar milestone while timeout ambiguity remains open. Expansion requires formal sign-off from Payments, SRE, Risk, and Security on 14 November.',
      speaker: 'Maya Chen',
      speakerRole: 'Product Manager',
      meetingName: 'Executive Coordination Review',
      meetingDate: '04 Nov 2026',
      timestamp: '10:00'
    },
    history: [
      {
        step: 1,
        date: '02 Nov',
        phase: 'Initial proposal',
        title: 'Initial 20% calendar rollout planned',
        description: 'DEC-001 initially committed to expanding pilot to 20% by 08 November.',
        statusBadge: 'Superseded',
        statusBadgeColor: 'bg-amber-50 text-amber-800',
        meeting: 'Smart Routing v2 Kickoff',
        evidenceId: 'S-002',
        actor: 'Product Operations'
      },
      {
        step: 2,
        date: '04 Nov',
        phase: 'Architecture approval',
        title: 'Formally halted and replaced with four-team gate',
        description:
          'Superseded DEC-001; established mandatory 14 Nov gate requiring Payments, SRE, Risk, Security approval.',
        statusBadge: 'Active Gate',
        statusBadgeColor: 'bg-emerald-50 text-emerald-800',
        meeting: 'Executive Coordination Review',
        evidenceId: 'S-044',
        actor: 'Maya Chen'
      }
    ],
    affectedWorkstreams: [
      { team: 'Payments Platform', category: 'routing', impact: 'Must verify idempotent timeout handling.', status: 'In progress' },
      { team: 'Site Reliability Engineering', category: 'qa', impact: 'Must validate circuit breaker trip & recovery.', status: 'In progress' },
      { team: 'Risk & Fraud', category: 'risk', impact: 'Must complete shadow scoring through 13 Nov.', status: 'In progress' },
      { team: 'Merchant Operations', category: 'merchant', impact: 'Hold merchant notification in draft.', status: 'Blocked' }
    ],
    downstreamMilestone: {
      name: 'Smart Routing v2 Pilot Expansion',
      status: 'Pending four-team review',
      description: 'Formal readiness vote scheduled for 14 November 2026.'
    },
    lineageNodes: [
      { id: 'n-001', type: 'origin', column: 0, title: 'Kickoff 20% plan', sub: 'Kickoff · 02 Nov', date: '02 Nov', badge: 'SUPERSEDED', badgeColor: 'bg-stone-100 text-stone-700' },
      { id: 'n-002', type: 'decision', column: 1, title: '14 Nov Readiness Gate', sub: 'Coordination Review · 04 Nov', date: '04 Nov', badge: 'ACTIVE GATE', badgeColor: 'bg-blue-50 text-blue-700 ring-2 ring-blue-500/30' },
      { id: 'n-003', type: 'outcome', column: 2, title: 'Four-team sign-off vote', sub: 'Readiness Review · 14 Nov', date: '14 Nov', badge: 'PENDING VOTE', badgeColor: 'bg-emerald-50 text-emerald-700' }
    ],
    lineageEdges: [
      { from: 'n-001', to: 'n-002', label: 'SUPERSEDES' },
      { from: 'n-002', to: 'n-003', label: 'GOVERNS' }
    ],
    dependencies: [
      {
        type: 'Supersedes',
        target: 'DEC-001: Automated pilot expansion to 20%',
        team: 'Product & Strategy',
        relationshipReason: 'Prevented premature scaling before timeout hazard resolution.',
        establishedInMeeting: 'Executive Coordination Review · 04 Nov'
      },
      {
        type: 'Depends on',
        target: 'DEC-014: Payment idempotency protocol implementation',
        team: 'Payments Platform',
        relationshipReason: 'Core technical prerequisite for safety.',
        establishedInMeeting: 'Executive Coordination Review · 04 Nov',
        severity: 'critical'
      }
    ]
  },
  {
    id: 'dec-021',
    code: 'DEC-021',
    title: 'Automated circuit-breaker tripping on provider timeout spikes',
    shortTitle: 'Routing fallback policy',
    status: 'active',
    statusLabel: 'Active',
    impactLevel: 'medium',
    space: 'Site Reliability Engineering',
    decisionType: 'Reliability architecture',
    owner: 'Site Reliability Engineering',
    ownerRole: 'Priya Nair (SRE Lead)',
    originMeeting: 'Canary Observability Review',
    originMeetingId: '880f34a1-35bd-5796-8ab1-ad4d662edcec',
    originDate: '02 Nov 2026',
    latestUpdate: '02 Nov 2026',
    firstProposedDate: '02 November 2026',
    lastRevisedDate: '02 November 2026',
    linkedMeetingsCount: 3,
    affectedTeamsCount: 2,
    openDependenciesCount: 1,
    summary:
      'Trip the circuit breaker to secondary provider (Stripe) only after idempotency key is locked and verified, preventing race conditions during latency degradation.',
    problemRationale:
      'Unchecked circuit breaking without idempotency state locks produces secondary authorization bursts against alternative providers.',
    evidence: {
      segmentId: 'S-012',
      quote:
        'For this pilot, pause expansion if p95 latency exceeds 650 ms for ten minutes or error rate exceeds 0.5%. Pause does not automatically mean rollback.',
      speaker: 'Priya Nair',
      speakerRole: 'SRE Lead',
      meetingName: 'Canary Observability Review',
      meetingDate: '02 Nov 2026',
      timestamp: '14:00'
    },
    history: [
      {
        step: 1,
        date: '02 Nov',
        phase: 'Architecture approval',
        title: 'Canary error & latency trip thresholds defined',
        description: 'Set p95 < 650ms and error rate < 0.5% as operational gates.',
        statusBadge: 'Approved',
        statusBadgeColor: 'bg-emerald-50 text-emerald-800',
        meeting: 'Canary Observability Review',
        evidenceId: 'S-012',
        actor: 'Priya Nair'
      }
    ],
    affectedWorkstreams: [
      { team: 'Site Reliability Engineering', category: 'qa', impact: 'Simulate timeout chaos testing against mocks.', status: 'In progress' }
    ],
    downstreamMilestone: {
      name: '14 Nov Readiness Review',
      status: 'Pending four-team review',
      description: 'SRE sign-off requires passing simulated timeout test.'
    },
    lineageNodes: [
      { id: 'node-sre-01', type: 'origin', column: 0, title: 'SLO definition', sub: 'Observability Review · 02 Nov', date: '02 Nov', badge: 'METRIC', badgeColor: 'bg-stone-100 text-stone-700' },
      { id: 'node-sre-02', type: 'decision', column: 1, title: 'Circuit breaker thresholds', sub: 'Observability Review · 02 Nov', date: '02 Nov', badge: 'ACTIVE', badgeColor: 'bg-blue-50 text-blue-700' }
    ],
    lineageEdges: [
      { from: 'node-sre-01', to: 'node-sre-02', label: 'DEFINES' }
    ],
    dependencies: [
      {
        type: 'Depends on',
        target: 'DEC-014: Idempotency locking protocol',
        team: 'Payments Platform',
        relationshipReason: 'Circuit breaker failover must reuse idempotency token.',
        establishedInMeeting: 'Canary Observability Review · 02 Nov',
        severity: 'high'
      }
    ]
  }
];

export function getCanonicalDecision(idOrCode: string): DecisionIntelligenceRecord {
  const match = CANONICAL_DECISIONS.find(
    d => d.id.toLowerCase() === idOrCode.toLowerCase() || d.code.toLowerCase() === idOrCode.toLowerCase()
  );
  return match || CANONICAL_DECISIONS[0];
}

