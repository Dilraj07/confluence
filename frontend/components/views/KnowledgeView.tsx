'use client';

import React, { useState, useMemo } from 'react';
import { GraphData, GraphNode, Decision, Meeting, Space } from '@/types';
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Quote,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Activity,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';

interface KnowledgeViewProps {
  graphData: GraphData;
  decisions: Decision[];
  meetings: Meeting[];
  spaces: Space[];
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenMeeting: (meeting: Meeting) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  graphData,
  decisions,
  meetings,
  spaces,
  onOpenDecisionTrail,
  onOpenMeeting
}) => {
  // 3 Modes: Explore, Timeline, Impact Analysis
  const [viewMode, setViewMode] = useState<'explore' | 'timeline' | 'impact'>('explore');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(1);

  // Selected decision for Impact Analysis Simulator
  const [selectedImpactScenarioId, setSelectedImpactScenarioId] = useState<string>('scenario-gate-01');

  // Position nodes pseudo-organically in columns so it fills the canvas nicely
  const layoutNodes = useMemo(() => {
    const nodes = graphData.nodes.filter(n => {
      if (filterType === 'all') return true;
      if (filterType === 'decisions') return n.type === 'decision';
      if (filterType === 'blockers') return n.type === 'blocker';
      if (filterType === 'spaces') return n.type === 'space';
      if (filterType === 'tasks') return n.type === 'task';
      return true;
    });

    const spacesList = nodes.filter(n => n.type === 'space');
    const meetingsList = nodes.filter(n => n.type === 'meeting');
    const decisionsList = nodes.filter(n => n.type === 'decision');
    const tasksList = nodes.filter(n => n.type === 'task');
    const blockersList = nodes.filter(n => n.type === 'blocker');

    const positioned: Record<string, { x: number; y: number; node: GraphNode }> = {};

    spacesList.forEach((s, idx) => {
      positioned[s.id] = { x: 130, y: 80 + idx * 100, node: s };
    });

    meetingsList.forEach((m, idx) => {
      positioned[m.id] = { x: 410, y: 70 + idx * 80, node: m };
    });

    decisionsList.forEach((d, idx) => {
      positioned[d.id] = { x: 730, y: 65 + idx * 75, node: d };
    });

    tasksList.forEach((t, idx) => {
      positioned[t.id] = { x: 1040, y: 65 + idx * 65, node: t };
    });

    blockersList.forEach((b, idx) => {
      positioned[b.id] = { x: 1040, y: 440 + idx * 75, node: b };
    });

    return positioned;
  }, [graphData.nodes, filterType]);

  // Find rich metadata for selected node
  const activeDecision = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'decision') return null;
    return decisions.find(d => d.id === selectedNode.id) || null;
  }, [selectedNode, decisions]);

  const activeMeeting = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'meeting') {
      return meetings.find(m => m.id === selectedNode.id) || null;
    }
    if (activeDecision) {
      return meetings.find(m => m.id === activeDecision.meeting_id) || null;
    }
    return null;
  }, [selectedNode, activeDecision, meetings]);

  const nodeColor = (type: string, status?: string) => {
    switch (type) {
      case 'space':
        return { bg: '#ffffff', stroke: '#1c1b1a', text: '#1c1b1a', fill: '#1c1b1a' };
      case 'meeting':
        return { bg: '#ffffff', stroke: '#5c6f5d', text: '#5c6f5d', fill: '#5c6f5d' };
      case 'decision':
        if (status === 'superseded') {
          return { bg: '#fdfbf7', stroke: '#af751b', text: '#af751b', fill: '#af751b' };
        }
        return { bg: '#ffffff', stroke: '#2a72de', text: '#2a72de', fill: '#2a72de' };
      case 'task':
        return { bg: '#ffffff', stroke: '#4a4741', text: '#4a4741', fill: '#4a4741' };
      case 'blocker':
        return { bg: '#ffffff', stroke: '#e33a22', text: '#e33a22', fill: '#e33a22' };
      default:
        return { bg: '#ffffff', stroke: '#838280', text: '#838280', fill: '#838280' };
    }
  };

  const edgeColor = (type: string) => {
    switch (type) {
      case 'SUPERSEDES':
      case 'SUPERSEDED_BY':
        return '#af751b';
      case 'BLOCKS':
      case 'TRIGGERS':
        return '#e33a22';
      case 'AFFECTS':
      case 'MITIGATED_BY':
        return '#2a72de';
      default:
        return '#d3cebe';
    }
  };

  // Timeline events dataset (Chronological evolution for MeridianPay Smart Routing v2)
  const timelineEvents = [
    {
      date: 'Nov 02, 2026',
      meetingTitle: 'Smart Routing v2 kickoff',
      spaceName: 'Product & Strategy',
      decision: 'Begin with a 5% canary for the initial merchant pilot.',
      status: 'active',
      decidedBy: 'Maya Chen (Product Manager)',
      quote: 'Let\'s begin with a 5% canary. Expansion requires reliability and risk checks to pass.',
      rationale: 'Controlled pilot with 10 merchants to evaluate processor authorization rates without merchant code changes.',
      evolutionText: 'Initial baseline rollout parameter.'
    },
    {
      date: 'Nov 02, 2026',
      meetingTitle: 'Smart Routing v2 kickoff',
      spaceName: 'Product & Strategy',
      decision: 'Expand the pilot to 20% after the initial canary gate.',
      status: 'superseded',
      decidedBy: 'Maya Chen (Product Manager)',
      quote: 'Expand the pilot to 20% after the initial canary gate.',
      rationale: 'Original aggressive rollout timeline before discovering timeout ambiguity hazards.',
      evolutionText: 'Superseded on Nov 10 by 14 November technical readiness review.'
    },
    {
      date: 'Nov 03, 2026',
      meetingTitle: 'Routing architecture and idempotency review',
      spaceName: 'Payments Platform',
      decision: 'Propagate the same idempotency key across routing and processor attempts.',
      status: 'active',
      decidedBy: 'Elena Petrova (Backend Engineer)',
      quote: 'Carry the same idempotency key across routing and processor attempts. Do not automatically fail over an ambiguous timeout until we have safe reconciliation.',
      rationale: 'A processor timeout does not prove the original processor never received or authorized payment.',
      evolutionText: 'Fundamental idempotency constraint.'
    },
    {
      date: 'Nov 04, 2026',
      meetingTitle: 'Fraud controls during processor failover',
      spaceName: 'Risk & Fraud',
      decision: 'Mandatory risk evaluation must not be bypassed during processor failover; fail safely if unavailable.',
      status: 'active',
      decidedBy: 'Fatima Ali (Risk Engineer)',
      quote: 'Risk evaluation must be independent of processor selection. If mandatory risk evaluation is unavailable, fail safely rather than routing around it.',
      rationale: 'Guarantees transaction fraud scoring continuity regardless of secondary processor routing.',
      evolutionText: 'Risk continuity constraint.'
    },
    {
      date: 'Nov 06, 2026',
      meetingTitle: 'Canary observability and production readiness',
      spaceName: 'Site Reliability Engineering',
      decision: 'Use canary monitoring and pause expansion at the agreed pilot latency or error thresholds.',
      status: 'active',
      decidedBy: 'Priya Nair (SRE Lead)',
      quote: 'For this pilot, pause expansion if p95 latency exceeds 650 ms for ten minutes or the error rate exceeds 0.5%. Pause does not automatically mean rollback.',
      rationale: 'Establishes clear metrics boundaries for traffic expansion versus automatic pause.',
      evolutionText: 'SRE canary gates established.'
    },
    {
      date: 'Nov 09, 2026',
      meetingTitle: 'Pilot performance review: timeout ambiguity',
      spaceName: 'Payments Platform',
      decision: 'Pause expansion beyond 5% and disable automatic cross-processor retries for ambiguous timeouts.',
      status: 'active',
      decidedBy: 'Elena Petrova (Backend Engineer)',
      quote: 'Some requests are retried even though we cannot tell whether the original processor completed authorisation. Disable automatic cross-processor retries for ambiguous outcomes.',
      rationale: 'Observed pilot timeouts exposed risk of duplicate authorisations against cardholders.',
      evolutionText: 'Direct trigger for launch gate halt.'
    },
    {
      date: 'Nov 10, 2026',
      meetingTitle: 'Smart Routing launch gate decision',
      spaceName: 'Product & Strategy',
      decision: 'Replace the planned 20% expansion with a 14 November readiness review requiring four team approvals.',
      status: 'active',
      decidedBy: 'Maya Chen & Executive Committee',
      quote: 'Replace the planned 20% expansion date with a 14 November readiness review. Payments, SRE, Risk, and Security must approve before expansion.',
      rationale: 'Blocks traffic growth until Payments, SRE, Risk, and Security verified evidence is approved.',
      evolutionText: 'Supersedes 2 Nov 20% rollout commitment.'
    },
    {
      date: 'Nov 11, 2026',
      meetingTitle: 'Merchant pilot communications and support readiness',
      spaceName: 'Merchant Operations',
      decision: 'Keep merchant launch confirmation in draft until technical readiness is approved.',
      status: 'active',
      decidedBy: 'Sarah Kim & Maya Chen',
      quote: 'Keep merchant communication in draft. Do not confirm the expansion date until the technical readiness review is approved.',
      rationale: 'Protects merchant relationships by preventing external dates before technical sign-off.',
      evolutionText: 'Merchant external communications gate.'
    }
  ];

  // Impact simulation datasets for MeridianPay Smart Routing v2
  const impactScenarios: Record<string, {
    title: string;
    space: string;
    description: string;
    riskLevel: 'Critical' | 'Warning' | 'Low';
    affectedSpaces: { name: string; impact: string }[];
    affectedCommitments: { task: string; owner: string; currentStatus: string; consequence: string }[];
    downstreamBlockers: string[];
    mitigations: string[];
  }> = {
    'scenario-gate-01': {
      title: 'Replace 20% Expansion with 14 Nov Multi-Team Readiness Review',
      space: 'Product & Strategy',
      description: 'Simulating the impact of superseding the planned 20% expansion and requiring 4 departmental sign-offs.',
      riskLevel: 'Critical',
      affectedSpaces: [
        {
          name: 'Payments Platform',
          impact: 'Must implement safe timeout classification, idempotency key propagation, and disable automatic cross-processor retries.'
        },
        {
          name: 'Site Reliability Engineering',
          impact: 'Must validate canary latency alerts (650 ms p95, 0.5% error) and execute automated rollback drill in staging.'
        },
        {
          name: 'Risk & Fraud',
          impact: 'Must run end-to-end risk propagation tests to guarantee fraud evaluation continuity during retries.'
        },
        {
          name: 'Security & Compliance',
          impact: 'Must review error traces and application logs confirming zero raw PANs or sensitive authentication data.'
        },
        {
          name: 'Merchant Operations',
          impact: 'Must hold merchant expansion communications in draft status and prepare support failure runbooks.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Implement safe timeout classification and retry restrictions',
          owner: 'Elena Petrova',
          currentStatus: 'Blocked',
          consequence: 'P0 launch prerequisite; blocks all traffic expansion.'
        },
        {
          task: 'Run end-to-end risk propagation tests',
          owner: 'Fatima Ali',
          currentStatus: 'Todo',
          consequence: 'Must be verified prior to 14 November review.'
        },
        {
          task: 'Validate canary metrics and rollback procedure',
          owner: 'Priya Nair',
          currentStatus: 'Todo',
          consequence: 'SRE sign-off prerequisite for staging rollback safety.'
        },
        {
          task: 'Complete security review evidence for the routing service',
          owner: 'Nina Patel',
          currentStatus: 'Todo',
          consequence: 'PCI DSS log review evidence required for compliance approval.'
        },
        {
          task: 'Prepare merchant pilot communication and support runbook',
          owner: 'Sarah Kim',
          currentStatus: 'In progress',
          consequence: 'Comms held in draft until technical approvals are submitted.'
        }
      ],
      downstreamBlockers: [
        'Ambiguous processor timeouts can trigger unsafe retries (Payments Platform)',
        'Risk decision continuity is not verified end to end (Risk & Fraud)',
        'Canary monitoring and rollback validation are incomplete (SRE)',
        'Merchant support readiness is incomplete (Merchant Operations)'
      ],
      mitigations: [
        'CONFLUENCE Proactive Step: Enforce 14 November technical readiness approval gate before routing traffic > 5%.',
        'Stage shadow reconciliation service to confirm processor state before initiating any secondary attempt.',
        'Hold merchant communications in draft to avoid premature customer commitments.'
      ]
    },
    'scenario-timeout-01': {
      title: 'Ambiguous Processor Timeouts Trigger Unsafe Retries',
      space: 'Payments Platform',
      description: 'Simulating the operational hazard where processor timeouts cause duplicate customer authorizations.',
      riskLevel: 'Critical',
      affectedSpaces: [
        {
          name: 'Payments Platform',
          impact: 'High risk of duplicate ledger entries and chargebacks if secondary attempts proceed uncoordinated.'
        },
        {
          name: 'Merchant Operations',
          impact: 'Customer complaints and merchant billing inquiries if cardholders are double-authorized.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Implement safe timeout classification and retry restrictions',
          owner: 'Elena Petrova',
          currentStatus: 'Blocked',
          consequence: 'Must distinguish timeout ambiguity from explicit network declines.'
        }
      ],
      downstreamBlockers: [
        'Ambiguous processor timeouts trigger duplicate authorization hazard.'
      ],
      mitigations: [
        'Disable automatic cross-processor retries for ambiguous outcomes immediately as decided on Nov 9.',
        'Propagate stable idempotency keys across all processor attempts.'
      ]
    },
    'scenario-risk-01': {
      title: 'Risk Decision Continuity During Failovers',
      space: 'Risk & Fraud',
      description: 'Simulating fraud control failure if secondary processor routing bypasses original risk score.',
      riskLevel: 'Critical',
      affectedSpaces: [
        {
          name: 'Risk & Fraud',
          impact: 'Unchecked fraud exposure if failover routes do not inherit risk decisions.'
        },
        {
          name: 'Security & Compliance',
          impact: 'Regulatory non-compliance if high-risk transactions bypass screening.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Verify risk decision propagation across processor adapters',
          owner: 'Fatima Ali',
          currentStatus: 'Todo',
          consequence: 'Requires synthetic test coverage across all failover routes.'
        }
      ],
      downstreamBlockers: [
        'Risk decision continuity is not verified end to end.'
      ],
      mitigations: [
        'Enforce fail-safe rejection: if risk evaluation is unavailable, reject transaction rather than routing around.'
      ]
    }
  };

  const currentImpact = impactScenarios[selectedImpactScenarioId] || impactScenarios['scenario-gate-01'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* 1. Header with 3 Modes Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
              MeridianPay Memory Graph
            </span>
            <span className="text-xs text-[#838280]">
              {graphData.nodes.length} Nodes &bull; {graphData.edges.length} Edges
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1c1b1a] mt-1">
            Decision Network &amp; Lineage
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Navigate cross-team decisions, inspect historical evolution, and simulate downstream impacts for Smart Routing v2.
          </p>
        </div>

        {/* 3 Modes Segmented Control */}
        <div className="flex items-center bg-[#f0ece4] p-1 rounded-xl text-xs font-medium border border-[#e1dcd3] shadow-inner">
          <button
            onClick={() => setViewMode('explore')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'explore'
                ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>1. Explore</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#af751b]" />
            <span>2. Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('impact')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'impact'
                ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#e33a22]" />
            <span>3. Impact Analysis</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODE 1: EXPLORE GRAPH CANVAS                         */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'explore' && (
        <div className="space-y-4">
          {/* Filter Pills & Zoom Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-white border border-[#e1dcd3] rounded-lg p-1 shadow-xs overflow-x-auto">
              <span className="text-[11px] font-semibold text-[#838280] px-2">Filter:</span>
              {['all', 'decisions', 'blockers', 'spaces', 'tasks'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    filterType === f
                      ? 'bg-[#1c1b1a] text-white font-medium'
                      : 'text-[#4a4741] hover:text-[#1c1b1a]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center bg-white border border-[#e1dcd3] rounded-lg p-1 shadow-xs">
                <button
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
                  className="p-1.5 rounded hover:bg-stone-100 text-[#4a4741]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-2 text-[#838280]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
                  className="p-1.5 rounded hover:bg-stone-100 text-[#4a4741]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-1.5 rounded hover:bg-stone-100 text-[#838280]"
                  title="Reset Zoom"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive SVG Canvas & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Canvas (8 cols) */}
            <div className="lg:col-span-8 card-oura bg-[#fbfaf7] border border-[#e1dcd3] relative h-[650px] overflow-hidden rounded-xl shadow-inner">
              {/* Legend pill */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-[#e1dcd3] px-3.5 py-1.5 rounded-lg text-[11px] shadow-xs">
                <span className="flex items-center gap-1.5 text-[#af751b] font-medium">
                  <span className="w-3 h-0.5 bg-[#af751b]" /> SUPERSEDES
                </span>
                <span className="flex items-center gap-1.5 text-[#e33a22] font-medium">
                  <span className="w-3 h-0.5 bg-[#e33a22]" /> BLOCKS / TRIGGERS
                </span>
                <span className="flex items-center gap-1.5 text-[#2a72de] font-medium">
                  <span className="w-3 h-0.5 bg-[#2a72de]" /> AFFECTS / MITIGATED
                </span>
              </div>

              <svg
                className="w-full h-full"
                viewBox="0 0 1250 680"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <defs>
                  <marker id="arrow-gold" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#af751b" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#e33a22" />
                  </marker>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a72de" />
                  </marker>
                  <marker id="arrow-gray" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#838280" />
                  </marker>
                </defs>

                {/* Render Edges */}
                {graphData.edges.map((edge) => {
                  const src = layoutNodes[edge.source];
                  const tgt = layoutNodes[edge.target];
                  if (!src || !tgt) return null;

                  const isSpecial = ['SUPERSEDES', 'SUPERSEDED_BY', 'BLOCKS', 'TRIGGERS', 'AFFECTS', 'MITIGATED_BY'].includes(edge.type);
                  const color = edgeColor(edge.type);
                  const marker =
                    ['SUPERSEDES', 'SUPERSEDED_BY'].includes(edge.type)
                      ? 'url(#arrow-gold)'
                      : ['BLOCKS', 'TRIGGERS'].includes(edge.type)
                      ? 'url(#arrow-red)'
                      : ['AFFECTS', 'MITIGATED_BY'].includes(edge.type)
                      ? 'url(#arrow-blue)'
                      : 'url(#arrow-gray)';

                  const midX = (src.x + tgt.x) / 2;
                  const midY = (src.y + tgt.y) / 2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={color}
                        strokeWidth={isSpecial ? 2.5 : 1.2}
                        strokeDasharray={['SUPERSEDES', 'SUPERSEDED_BY'].includes(edge.type) ? '5 3' : undefined}
                        markerEnd={marker}
                        className="transition-all"
                      />
                      {isSpecial && (
                        <text
                          x={midX}
                          y={midY - 6}
                          fill={color}
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                          className="select-none bg-white font-sans"
                        >
                          {edge.label || edge.type}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {Object.values(layoutNodes).map(({ x, y, node }) => {
                  const colors = nodeColor(node.type, node.status);
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r={isSelected ? 26 : 22}
                        fill={colors.bg}
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 3 : 1.8}
                        className="transition-all filter drop-shadow-xs group-hover:scale-105"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fontSize="9"
                        fontWeight="700"
                        fill={colors.fill}
                        className="select-none pointer-events-none uppercase tracking-wider"
                      >
                        {node.type.slice(0, 3)}
                      </text>

                      {/* Label */}
                      <text
                        textAnchor="middle"
                        dy="36"
                        fontSize="10"
                        fontWeight="500"
                        fill="#1c1b1a"
                        className="select-none pointer-events-none"
                      >
                        {node.label.length > 26 ? node.label.slice(0, 26) + '...' : node.label}
                      </text>
                      {node.subtext && (
                        <text
                          textAnchor="middle"
                          dy="48"
                          fontSize="8"
                          fill="#838280"
                          className="select-none pointer-events-none"
                        >
                          {node.subtext}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Contextual Inspector Pane (4 cols) */}
            <div className="lg:col-span-4 card-oura p-6 bg-white border border-[#e1dcd3] flex flex-col justify-between h-[650px] shadow-xs">
              {selectedNode ? (
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
                      {selectedNode.type} Node
                    </span>
                    <span className="text-xs text-[#838280] font-medium capitalize">
                      {selectedNode.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-normal text-[#1c1b1a] leading-snug">
                      {selectedNode.label}
                    </h3>
                    {selectedNode.subtext && (
                      <p className="text-xs text-[#838280] mt-1">{selectedNode.subtext}</p>
                    )}
                  </div>

                  {/* Source Meeting */}
                  {activeMeeting && (
                    <div
                      onClick={() => onOpenMeeting(activeMeeting)}
                      className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[#838280] text-[10px] uppercase font-bold">
                        <span>Source Meeting</span>
                        <span>{new Date(activeMeeting.meeting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="font-semibold text-[#1c1b1a]">{activeMeeting.title}</div>
                      <div className="text-[11px] text-[#2a72de] font-medium pt-0.5 flex items-center gap-1">
                        <span>Open Turn-by-Turn Transcript</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}

                  {/* Verified Evidence Quote */}
                  {activeDecision && activeDecision.evidence_items && activeDecision.evidence_items.length > 0 && (
                    <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/80 space-y-1.5 text-xs text-[#1c1b1a]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#af751b]">
                        <Quote className="w-3 h-3" />
                        <span>Verified Transcript Evidence</span>
                      </div>
                      <p className="italic text-[#4a4741]">&ldquo;{activeDecision.evidence_items[0].quote}&rdquo;</p>
                      <div className="text-[10px] text-[#838280] pt-0.5">
                        Attributed to: <strong>{activeDecision.evidence_items[0].speaker_name || activeDecision.decided_by}</strong>
                      </div>
                    </div>
                  )}

                  {/* Connected Relationships */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-[#1c1b1a] block">
                      Relationships &amp; Dependencies:
                    </span>
                    <div className="space-y-2">
                      {graphData.edges
                        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((e) => (
                          <div
                            key={e.id}
                            className="p-2.5 bg-[#fbfaf7] rounded-md border border-[#e1dcd3] text-xs flex items-center justify-between"
                          >
                            <span className="font-bold text-[#af751b]">{e.type}</span>
                            <span className="text-[11px] text-[#838280]">{e.label || 'Connection'}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Supersession History if Decision */}
                  {activeDecision && (
                    <button
                      onClick={() => onOpenDecisionTrail(activeDecision)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-[#ddaa61]" />
                      <span>Inspect Full Decision Lineage</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#838280] space-y-2">
                  <Info className="w-8 h-8 opacity-40 text-[#838280]" />
                  <h4 className="font-serif text-lg text-[#1c1b1a]">Node Inspector</h4>
                  <p className="text-xs max-w-xs text-[#7b776f]">
                    Select any decision, meeting, blocker or space node on the canvas to inspect evidence, relationships, and supersession lineage.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[#e1dcd3] text-[11px] text-[#838280]">
                Database verified &bull; Nodes reflect canonical MeridianPay PostgreSQL records.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODE 2: DECISION TIMELINE                            */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-2 shadow-xs">
            <h3 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Smart Routing v2 Decision Evolution Timeline
            </h3>
            <p className="text-xs text-[#7b776f] max-w-2xl font-light">
              Track how routing, idempotency, and launch decisions evolved across meetings from 2 to 11 November 2026. The initial 20% expansion commitment is permanently retained with full supersession rationale.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e1dcd3]">
            {timelineEvents.map((evt, idx) => {
              const isSuperseded = evt.status === 'superseded';
              return (
                <div key={idx} className="relative space-y-2">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    isSuperseded ? 'border-[#af751b]' : 'border-[#2a72de]'
                  }`} />

                  <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#838280]">
                          {evt.date}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2a72de]">
                          {evt.spaceName}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSuperseded ? 'bg-amber-100 text-[#af751b]' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#838280]">
                        Meeting: <strong>{evt.meetingTitle}</strong>
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-serif text-lg font-medium ${isSuperseded ? 'line-through text-[#838280]' : 'text-[#1c1b1a]'}`}>
                        {evt.decision}
                      </h4>
                      <p className="text-xs text-[#4a4741] mt-1 leading-relaxed">
                        <strong>Rationale:</strong> {evt.rationale}
                      </p>
                    </div>

                    {/* Verbatim quote */}
                    <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs italic text-[#4a4741] flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                      <div>
                        <span>&ldquo;{evt.quote}&rdquo;</span>
                        <span className="block not-italic text-[10px] text-[#838280] mt-0.5">
                          — {evt.decidedBy}
                        </span>
                      </div>
                    </div>

                    {/* Evolution connection badge */}
                    <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#838280]">
                      <span className="flex items-center gap-1.5 font-medium text-[#af751b]">
                        <GitBranch className="w-3.5 h-3.5" />
                        {evt.evolutionText}
                      </span>
                      <button
                        onClick={() => {
                          const m = meetings.find(item => item.title.includes(evt.meetingTitle.slice(0, 15)));
                          if (m) onOpenMeeting(m);
                        }}
                        className="text-xs text-[#2a72de] font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Source Meeting</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODE 3: IMPACT ANALYSIS SIMULATOR                    */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'impact' && (
        <div className="space-y-6">
          {/* Simulator Controls Card */}
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e33a22] bg-red-50 px-2 py-0.5 rounded">
                  Downstream Impact Simulator
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1c1b1a] mt-1">
                  What gets affected when a decision or date changes?
                </h3>
                <p className="text-xs text-[#7b776f] mt-0.5 font-light">
                  Select a Smart Routing milestone or failure mode below to simulate cascading consequences across Payments, SRE, Risk, and Security.
                </p>
              </div>

              {/* Decision Selector Dropdown */}
              <div className="min-w-[280px]">
                <label className="text-[11px] font-semibold text-[#838280] block mb-1">
                  Select Target Decision to Simulate:
                </label>
                <select
                  value={selectedImpactScenarioId}
                  onChange={(e) => setSelectedImpactScenarioId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] font-medium focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                >
                  <option value="scenario-gate-01">Launch Gate: Replace 20% Expansion with 14 Nov Review</option>
                  <option value="scenario-timeout-01">Failure Hazard: Ambiguous Processor Timeout Retries</option>
                  <option value="scenario-risk-01">Risk Continuity: Mandatory Risk Evaluation During Failovers</option>
                </select>
              </div>
            </div>

            {/* Simulation Context Alert */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#e33a22] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1c1b1a]">{currentImpact.title}</span>
                  <span className="text-[10px] font-bold uppercase bg-red-100 text-[#e33a22] px-2 py-0.2 rounded">
                    {currentImpact.riskLevel} Risk Severity
                  </span>
                </div>
                <p className="text-[#4a4741] leading-relaxed">
                  {currentImpact.description}
                </p>
              </div>
            </div>
          </div>

          {/* Impact Grid: Affected Spaces & Affected Commitments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Affected Spaces (6 cols) */}
            <div className="lg:col-span-6 card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#f0ece4] pb-3">
                <Layers className="w-4 h-4 text-[#2a72de]" />
                <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Affected Departments &amp; Spaces
                </h4>
              </div>

              <div className="space-y-3">
                {currentImpact.affectedSpaces.map((sp, idx) => (
                  <div key={idx} className="p-3.5 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] space-y-1 text-xs">
                    <span className="font-semibold text-[#1c1b1a] block">
                      📁 {sp.name}
                    </span>
                    <p className="text-[#4a4741] leading-relaxed">
                      {sp.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Affected Commitments / Tasks (6 cols) */}
            <div className="lg:col-span-6 card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#f0ece4] pb-3">
                <Clock className="w-4 h-4 text-[#af751b]" />
                <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Impacted Commitments &amp; Tasks
                </h4>
              </div>

              <div className="divide-y divide-[#f0ece4]">
                {currentImpact.affectedCommitments.map((c, idx) => (
                  <div key={idx} className="py-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1c1b1a]">{c.task}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        c.currentStatus === 'Blocked' ? 'bg-red-100 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                      }`}>
                        {c.currentStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#838280]">
                      Owner: <strong>{c.owner}</strong> &bull; Consequence: <span className="text-[#e33a22] font-medium">{c.consequence}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Proactive Mitigations */}
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#f0ece4] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">
                CONFLUENCE Proactive Mitigation Recommendations
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              {currentImpact.mitigations.map((m, idx) => (
                <div key={idx} className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e1dcd3] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[#1c1b1a] leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
