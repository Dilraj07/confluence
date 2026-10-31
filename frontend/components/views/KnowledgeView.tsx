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
  const [selectedImpactDecisionId, setSelectedImpactDecisionId] = useState<string>('d-launch-01');

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
      positioned[s.id] = { x: 140, y: 150 + idx * 170, node: s };
    });

    meetingsList.forEach((m, idx) => {
      positioned[m.id] = { x: 420, y: 110 + idx * 140, node: m };
    });

    decisionsList.forEach((d, idx) => {
      positioned[d.id] = { x: 740, y: 90 + idx * 150, node: d };
    });

    tasksList.forEach((t, idx) => {
      positioned[t.id] = { x: 1040, y: 110 + idx * 140, node: t };
    });

    blockersList.forEach((b, idx) => {
      positioned[b.id] = { x: 1040, y: 350 + idx * 150, node: b };
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
        return '#af751b';
      case 'BLOCKS':
        return '#e33a22';
      case 'AFFECTS':
        return '#2a72de';
      default:
        return '#d3cebe';
    }
  };

  // Timeline events dataset (Chronological evolution)
  const timelineEvents = [
    {
      date: 'Oct 14, 2026',
      meetingTitle: 'Architecture Kickoff Sync',
      spaceName: 'Engineering → Backend',
      decision: 'Single-node Redis Cache for Session & Object Storage',
      status: 'superseded',
      decidedBy: 'Backend Team',
      quote: 'Redis cache is sufficient for initial development velocity prior to high concurrent tenant volume.',
      rationale: 'Quick setup during early stage; superseded as volume scaling requirements emerged.',
      evolutionText: 'Superseded on Oct 28 by PostgreSQL Table Partitioning.'
    },
    {
      date: 'Oct 28, 2026',
      meetingTitle: 'Backend Architecture & Database Review',
      spaceName: 'Engineering → Backend',
      decision: 'PostgreSQL Table Partitioning on organization_id',
      status: 'active',
      decidedBy: 'Elena Rostova (Tech Lead)',
      quote: 'We need table partitioning by organization_id in Postgres; otherwise p99 SLA fails across multi-tenant shards.',
      rationale: 'Satisfies multi-tenant isolation, query throughput benchmarks, and compliance partitioning.',
      evolutionText: 'Directly supersedes earlier Redis caching baseline; requires 3 weeks migration.'
    },
    {
      date: 'Oct 29, 2026',
      meetingTitle: 'Weekly Technical Recruitment Sync',
      spaceName: 'HR → Recruitment',
      decision: 'Engage External Agency to Replace Senior Distributed Engineer',
      status: 'active',
      decidedBy: 'David Chen (Head of Recruitment)',
      quote: 'The senior distributed engineer reneged. We must immediately retain an external agency on a 72-hour sourcing SLA.',
      rationale: 'In-house sourcing alone cannot fulfill critical backend staffing capacity before the March deadline.',
      evolutionText: 'Directly addresses backend engineering throughput deficit.'
    },
    {
      date: 'Oct 29, 2026',
      meetingTitle: 'Q1 Platform Launch Go/No-Go Review',
      spaceName: 'Product → Platform Launch',
      decision: 'Maintain March 15 Platform Launch Date with contingent staging gates',
      status: 'active',
      decidedBy: 'Alex Chen & Executive Committee',
      quote: 'We will hold March 15 as our baseline, but contingent on backend migration completing by Feb 1.',
      rationale: 'Maintains enterprise go-to-market commitments while tracking backend schema migration and staffing.',
      evolutionText: 'Dependent on Backend schema partitioning & HR recruitment resolution.'
    }
  ];

  // Impact simulation datasets
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
    'd-launch-01': {
      title: 'Maintain March 15 Platform Launch Date',
      space: 'Product → Platform Launch',
      description: 'Simulating a 4-week slippage or change to the March 15 Platform Launch milestone.',
      riskLevel: 'Critical',
      affectedSpaces: [
        {
          name: 'Engineering (Backend)',
          impact: 'Relieves urgent pressure on Alembic migration scripts; enables 2 additional weeks of staging load testing.'
        },
        {
          name: 'HR (Recruitment)',
          impact: 'Provides 3 additional weeks for the external agency to onboard the Senior Distributed Systems engineer.'
        },
        {
          name: 'Product & Go-To-Market',
          impact: 'Requires rescheduling customer onboarding cohorts and updating executive steering board.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Prepare database partition scripts',
          owner: 'Elena Rostova',
          currentStatus: 'In progress',
          consequence: 'Timeline extended; staging deploy moved to Feb 14.'
        },
        {
          task: 'Engage external recruitment agency',
          owner: 'David Chen',
          currentStatus: 'Urgent',
          consequence: 'Sourcing SLA target relaxed from 72h to 10 days.'
        },
        {
          task: 'Benchmark partition migration on staging',
          owner: 'Elena Rostova',
          currentStatus: 'Todo',
          consequence: 'Benchmarking window rescheduled after schema freeze.'
        }
      ],
      downstreamBlockers: [
        'Candidate reneged for Senior Distributed Systems engineer (HR)',
        'PostgreSQL table migration script lock during staging tests (Engineering)'
      ],
      mitigations: [
        'CONFLUENCE Proactive Step: Retain agency contract immediately to ensure new hire starts by Feb 1.',
        'Decouple non-critical API v2 endpoints to deploy in cohort 2 rather than launch day.',
        'Stage zero-downtime partition rewrite using shadow tables.'
      ]
    },
    'd-backend-01': {
      title: 'PostgreSQL Table Partitioning by organization_id',
      space: 'Engineering → Backend',
      description: 'Simulating reverting or pausing the table partitioning architecture.',
      riskLevel: 'Warning',
      affectedSpaces: [
        {
          name: 'Engineering (Backend)',
          impact: 'Avoids complex Alembic partition scripts but risks p99 query latency degradation above 5,000 tenants.'
        },
        {
          name: 'Product (Platform Launch)',
          impact: 'Removes 3-week migration prerequisite; however, violates customer multi-tenant SLA commitments.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Prepare database partition scripts',
          owner: 'Elena Rostova',
          currentStatus: 'In progress',
          consequence: 'Task would be cancelled or replaced by read-replica sharding.'
        }
      ],
      downstreamBlockers: [
        'High latency bottleneck on unpartitioned transactional tables at scale.'
      ],
      mitigations: [
        'Retain table partitioning architecture as approved by Tech Lead Elena Rostova.',
        'Use pre-tested Alembic partition scripts with automated rollback guards.'
      ]
    },
    'd-hr-01': {
      title: 'Candidate Reneged - Senior Distributed Systems Hire',
      space: 'HR → Recruitment',
      description: 'Simulating failure to source replacement senior distributed engineer within 14 days.',
      riskLevel: 'Critical',
      affectedSpaces: [
        {
          name: 'Engineering (Backend)',
          impact: 'Deficit of 1 senior engineer causes 4-week delivery delay on distributed transaction handlers.'
        },
        {
          name: 'Product (Platform Launch)',
          impact: 'Directly blocks the March 15 platform launch milestone.'
        }
      ],
      affectedCommitments: [
        {
          task: 'Engage external recruitment agency',
          owner: 'David Chen',
          currentStatus: 'Urgent',
          consequence: 'Must expedite retained agency search with sign-on compensation flexibility.'
        }
      ],
      downstreamBlockers: [
        'Senior backend engineering delivery capacity shortfall.'
      ],
      mitigations: [
        'Offer accelerated compensation band approved in People Ops guidelines.',
        'Contract specialized distributed systems consultant for interim 6-week sprint.'
      ]
    }
  };

  const currentImpact = impactScenarios[selectedImpactDecisionId] || impactScenarios['d-launch-01'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* 1. Header with 3 Modes Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
              Organisational Memory Graph
            </span>
            <span className="text-xs text-[#838280]">
              {graphData.nodes.length} Nodes &bull; {graphData.edges.length} Edges
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#1c1b1a] mt-1">
            Decision Network &amp; Lineage
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Navigate cross-team decisions, inspect historical evolution, and simulate downstream impacts.
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
                  <span className="w-3 h-0.5 bg-[#e33a22]" /> BLOCKS
                </span>
                <span className="flex items-center gap-1.5 text-[#2a72de] font-medium">
                  <span className="w-3 h-0.5 bg-[#2a72de]" /> AFFECTS
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

                  const isSpecial = ['SUPERSEDES', 'BLOCKS', 'AFFECTS'].includes(edge.type);
                  const color = edgeColor(edge.type);
                  const marker =
                    edge.type === 'SUPERSEDES'
                      ? 'url(#arrow-gold)'
                      : edge.type === 'BLOCKS'
                      ? 'url(#arrow-red)'
                      : edge.type === 'AFFECTS'
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
                        strokeDasharray={edge.type === 'SUPERSEDES' ? '5 3' : undefined}
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
                        r={isSelected ? 30 : 25}
                        fill={colors.bg}
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 3 : 1.8}
                        className="transition-all filter drop-shadow-xs group-hover:scale-105"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fontSize="10"
                        fontWeight="700"
                        fill={colors.fill}
                        className="select-none pointer-events-none uppercase tracking-wider"
                      >
                        {node.type.slice(0, 3)}
                      </text>

                      {/* Label */}
                      <text
                        textAnchor="middle"
                        dy="42"
                        fontSize="11"
                        fontWeight="500"
                        fill="#1c1b1a"
                        className="select-none pointer-events-none"
                      >
                        {node.label.length > 28 ? node.label.slice(0, 28) + '...' : node.label}
                      </text>
                      {node.subtext && (
                        <text
                          textAnchor="middle"
                          dy="56"
                          fontSize="9"
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
                Database verified &bull; Nodes reflect canonical PostgreSQL records.
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
              Decision Evolution &amp; Supersession Timeline
            </h3>
            <p className="text-xs text-[#7b776f] max-w-2xl font-light">
              Track how architectural decisions evolved across meetings over time. Earlier decisions are permanently retained with explicit supersession lineage and reasoning.
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
                          const m = meetings.find(item => item.title.includes(evt.meetingTitle.split(' ')[0]));
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
                  Select a milestone or architectural commitment below to simulate cascading consequences across Engineering, HR, and Product.
                </p>
              </div>

              {/* Decision Selector Dropdown */}
              <div className="min-w-[280px]">
                <label className="text-[11px] font-semibold text-[#838280] block mb-1">
                  Select Target Decision to Simulate:
                </label>
                <select
                  value={selectedImpactDecisionId}
                  onChange={(e) => setSelectedImpactDecisionId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] font-medium focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                >
                  <option value="d-launch-01">Milestone: Maintain March 15 Platform Launch Date</option>
                  <option value="d-backend-01">Architecture: PostgreSQL Table Partitioning</option>
                  <option value="d-hr-01">Staffing: Senior Distributed Engineer Renege</option>
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
                  Affected Spaces &amp; Departments
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
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-[#4a4741] uppercase">
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
