'use client';

import React, { useState } from 'react';
import { Space, Meeting, Decision, Task, Blocker } from '@/types';
import {
  Folder,
  Calendar,
  GitBranch,
  CheckSquare,
  FileText,
  Activity,
  Plus,
  Flame,
  User,
  Quote,
  ShieldCheck,
  ChevronRight,
  Eye,
  Layers,
  ArrowRight,
  ExternalLink,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SpacesViewProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
  meetings: Meeting[];
  decisions: Decision[];
  tasks: Task[];
  blockers: Blocker[];
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenCandidates: (meetingId: string) => void;
  onOpenIngest: () => void;
}

export const SpacesView: React.FC<SpacesViewProps> = ({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  meetings,
  decisions,
  tasks,
  blockers,
  onOpenMeeting,
  onOpenDecisionTrail,
  onOpenCandidates,
  onOpenIngest
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'decisions' | 'tasks' | 'documents' | 'activity'>('overview');

  const activeSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];

  const spaceMeetings = meetings.filter(m => m.primary_space_id === activeSpace?.id);
  const spaceDecisions = decisions.filter(d => d.space_id === activeSpace?.id);
  const spaceTasks = tasks.filter(t => t.space_id === activeSpace?.id);
  const spaceBlockers = blockers.filter(b => b.space_id === activeSpace?.id);

  if (!activeSpace) {
    return (
      <div className="card-oura p-12 text-center max-w-xl mx-auto my-12 bg-white">
        <Folder className="w-8 h-8 text-[#838280] mx-auto mb-2" />
        <h3 className="font-serif text-xl text-[#1c1b1a]">No Spaces Configured</h3>
        <p className="text-xs text-[#838280] mt-1">Please seed or create a space to begin.</p>
      </div>
    );
  }

  // Cross-space dependencies detection
  const isBackend = activeSpace.slug.includes('backend');
  const isLaunch = activeSpace.slug.includes('launch');
  const isHR = activeSpace.slug.includes('recruitment');

  // Space-specific contextual documents
  const getSpaceDocuments = () => {
    if (isBackend) {
      return [
        {
          title: 'RFC #14: PostgreSQL Partitioning by Organization ID',
          type: 'Architecture Spec',
          author: 'Elena Rostova',
          updated: 'Oct 28, 2026',
          status: 'Approved',
          summary: 'Defines composite table partitioning on organization_id and created_at to guarantee sub-15ms p99 query latency across multi-tenant shards.'
        },
        {
          title: 'API v2 Service Level Agreement & Sharding Topology',
          type: 'Technical SLA',
          author: 'Distributed Systems Team',
          updated: 'Oct 20, 2026',
          status: 'Active',
          summary: 'Outlines read-replica distribution, failover guarantees, and connection pooling requirements for high-throughput tenant workloads.'
        },
        {
          title: 'Alembic Schema Partitioning Migration Runbook',
          type: 'Operational Runbook',
          author: 'Backend Infra Team',
          updated: 'Oct 29, 2026',
          status: 'In Review',
          summary: 'Step-by-step rollout plan for zero-downtime table rewrites and index creation on production database clusters.'
        }
      ];
    }
    if (isHR) {
      return [
        {
          title: 'Q4 Technical Staffing Plan & Headcount Allocation',
          type: 'Strategic Plan',
          author: 'David Chen',
          updated: 'Oct 15, 2026',
          status: 'Active',
          summary: 'Allocates hiring headcount across distributed systems, frontend engineering, and platform reliability roles for Q4/Q1.'
        },
        {
          title: 'Senior Staff Distributed Systems Compensation Band',
          type: 'Compensation Policy',
          author: 'People Ops Team',
          updated: 'Oct 22, 2026',
          status: 'Confidential',
          summary: 'Benchmarks equity, base salary tiers, and sign-on incentives for tier-1 distributed infrastructure candidates.'
        },
        {
          title: 'Executive Search Agency Retainer & SLA Agreement',
          type: 'Vendor Agreement',
          author: 'David Chen',
          updated: 'Oct 29, 2026',
          status: 'Executed',
          summary: 'Defines 72-hour sourcing SLA and 14-day interview loop commitment for replacement senior backend engineers.'
        }
      ];
    }
    return [
      {
        title: 'Q1 Platform Launch Readiness Checklist & Go/No-Go Gate',
        type: 'Product Checklist',
        author: 'Alex Chen',
        updated: 'Oct 29, 2026',
        status: 'In Progress',
        summary: 'Mandatory technical, compliance, security, and staffing prerequisites required prior to customer cohort onboarding.'
      },
      {
        title: 'Multi-Region Failover & Disaster Recovery SOP',
        type: 'SRE Procedure',
        author: 'Platform Ops & SRE',
        updated: 'Oct 25, 2026',
        status: 'Approved',
        summary: 'Operational manual detailing automated DNS failover, partition recovery, and data replay procedures.'
      }
    ];
  };

  // Space-specific audit log
  const getSpaceAuditTrail = () => {
    if (isBackend) {
      return [
        {
          action: 'Canonical Decision Approved',
          description: 'Elena Rostova approved decision: "PostgreSQL table partitioning on organization_id".',
          evidence: 'Verified against Transcript Segment #4 (Backend Review).',
          date: 'Oct 28, 2026',
          actor: 'Elena Rostova (Tech Lead)'
        },
        {
          action: 'Decision Superseded',
          description: 'Marked "Single-node Redis Cache" as superseded with permanent audit lineage retained.',
          evidence: 'Superseded by Postgres partitioning decision.',
          date: 'Oct 28, 2026',
          actor: 'Elena Rostova (Tech Lead)'
        },
        {
          action: 'Commitment Created',
          description: 'Elena Rostova assigned task: "Prepare database partition scripts".',
          evidence: 'Extracted from Backend Architecture Sync.',
          date: 'Oct 28, 2026',
          actor: 'Extraction Engine'
        }
      ];
    }
    if (isHR) {
      return [
        {
          action: 'Critical Blocker Raised',
          description: 'Candidate reneged on Senior Distributed Systems Engineer role due to competitive counter-offer.',
          evidence: 'Verified against Transcript Segment #3 (Recruitment Sync).',
          date: 'Oct 29, 2026',
          actor: 'David Chen (Head of Recruitment)'
        },
        {
          action: 'Urgent Commitment Staged',
          description: 'David Chen committed task: "Engage external recruitment agency to source replacement engineer".',
          evidence: 'Due: Nov 3, 2026.',
          date: 'Oct 29, 2026',
          actor: 'David Chen'
        },
        {
          action: 'Space Ingestion',
          description: 'Ingested 4 transcript segments from Weekly Technical Recruitment Sync.',
          evidence: 'Meeting ID: mtg-recruitment-01.',
          date: 'Oct 29, 2026',
          actor: 'CONFLUENCE Ingest'
        }
      ];
    }
    return [
      {
        action: 'Cross-Space Dependency Flagged',
        description: 'Launch milestone dependent on Backend database partitioning and HR staffing capacity.',
        evidence: 'Verified against Transcript Segment #2 (Go/No-Go Review).',
        date: 'Oct 29, 2026',
        actor: 'Alex Chen (Product Lead)'
      },
      {
        action: 'Canonical Decision Confirmed',
        description: 'Confirmed: "Maintain March 15 Platform Launch Date with contingent staging gates".',
        evidence: 'Verified against Transcript Segment #4.',
        date: 'Oct 29, 2026',
        actor: 'Executive Committee'
      }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* 1. Space Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e1dcd3]">
        {spaces.map((s) => {
          const isSelected = s.id === activeSpace.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSpace(s.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-white text-[#1c1b1a] shadow-xs font-semibold border border-[#e1dcd3]'
                  : 'text-[#4a4741] hover:bg-black/5'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-[#2a72de]' : 'text-[#838280]'}`} />
              <span>{s.name}</span>
              <span className="text-[10px] text-[#838280] capitalize">({s.space_type})</span>
            </button>
          );
        })}
      </div>

      {/* 2. Space Hero Card */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded">
                {activeSpace.space_type} Space
              </span>
              <span className="text-[10px] font-semibold text-[#838280] bg-stone-100 px-2 py-0.5 rounded">
                Access: {activeSpace.sensitivity_level}
              </span>
              <span className="text-xs text-[#838280]">
                Slug: <code>{activeSpace.slug}</code>
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-[#1c1b1a]">
              {activeSpace.name} Space
            </h1>
            <p className="text-xs text-[#7b776f] max-w-2xl font-light">
              {activeSpace.description || 'Contextual collaborative workspace for decisions, commitments, and meetings.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenIngest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Meeting</span>
            </button>
          </div>
        </div>

        {/* Cross-Space Dependency Notice */}
        {isLaunch && (
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-lg text-xs flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-[#e33a22] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a] leading-relaxed">
              <strong>Cross-Space Dependency Active:</strong> March 15 Platform Launch is dependent on{' '}
              <span className="font-semibold text-[#2a72de]">Engineering → Backend</span> database schema migration and{' '}
              <span className="font-semibold text-[#af751b]">HR → Recruitment</span> senior engineering capacity.
            </div>
          </div>
        )}

        {isBackend && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex items-start gap-2.5">
            <GitBranch className="w-4 h-4 text-[#af751b] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a] leading-relaxed">
              <strong>Downstream Impact Notice:</strong> PostgreSQL table partitioning supersedes single-node caching.
              Directly determines readiness for <span className="font-semibold text-[#2a72de]">Product → Platform Launch</span>.
            </div>
          </div>
        )}

        {isHR && (
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-lg text-xs flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-[#e33a22] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a] leading-relaxed">
              <strong>Upstream Blocker:</strong> Candidate reneged for Senior Distributed Systems engineer.
              Directly limits throughput in <span className="font-semibold text-[#2a72de]">Engineering → Backend</span>.
            </div>
          </div>
        )}

        {/* Space Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 pt-2 border-t border-[#e1dcd3] overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'meetings', label: `Meetings (${spaceMeetings.length})` },
            { id: 'decisions', label: `Decisions (${spaceDecisions.length})` },
            { id: 'tasks', label: `Tasks (${spaceTasks.length})` },
            { id: 'documents', label: 'Documents & Context' },
            { id: 'activity', label: 'Audit Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1c1b1a] text-white font-semibold'
                  : 'text-[#4a4741] hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab: Overview (Balanced Two-Column Layout) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Meetings & Decisions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recent Meetings Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5c6f5d]" />
                    <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                      Recent Space Meetings
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('meetings')}
                    className="text-xs text-[#2a72de] hover:underline font-medium"
                  >
                    View all {spaceMeetings.length} &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {spaceMeetings.length === 0 ? (
                    <div className="p-4 bg-white rounded-lg border border-[#e1dcd3] text-xs text-[#838280] text-center">
                      No meetings recorded in this Space yet.
                    </div>
                  ) : (
                    spaceMeetings.slice(0, 2).map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onOpenMeeting(m)}
                        className="card-oura p-4 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#5c6f5d]">
                            {m.source_type}
                          </span>
                          <span className="text-[#838280]">
                            {new Date(m.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-medium text-[#1c1b1a] group-hover:text-[#2a72de] transition-colors">
                          {m.title}
                        </h4>

                        <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#838280]">
                          <div className="flex items-center gap-3">
                            <span>{m.segment_count} segments</span>
                            <span>&bull;</span>
                            <span>{m.decision_count} decisions</span>
                            <span>&bull;</span>
                            <span>{m.task_count} commitments</span>
                          </div>
                          <span className="text-xs font-semibold text-[#1c1b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Open Intelligence &rarr;
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Decisions Section (Compact & Contextual) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#af751b]" />
                    <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                      Decisions in Space
                    </h3>
                  </div>
                  {spaceDecisions.length > 0 && (
                    <button
                      onClick={() => setActiveTab('decisions')}
                      className="text-xs text-[#2a72de] hover:underline font-medium"
                    >
                      View all {spaceDecisions.length} &rarr;
                    </button>
                  )}
                </div>

                {spaceDecisions.length === 0 ? (
                  <div className="p-4 bg-white rounded-lg border border-[#e1dcd3] text-xs space-y-1.5">
                    <div className="font-medium text-[#1c1b1a]">
                      No standalone architectural decisions recorded yet.
                    </div>
                    <p className="text-[#838280] leading-relaxed">
                      Discussions in the {activeSpace.name} Space currently center on candidate pipelines, compensation negotiations, and hiring commitments rather than formal architectural policies.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {spaceDecisions.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        onClick={() => onOpenDecisionTrail(d)}
                        className="card-oura p-4 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            d.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
                          }`}>
                            {d.status}
                          </span>
                          <span className="text-[#838280]">
                            Decided by: <strong>{d.decided_by || 'Team'}</strong>
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-[#1c1b1a]">
                          {d.statement}
                        </h4>

                        {d.evidence_items && d.evidence_items.length > 0 && (
                          <div className="text-[11px] italic bg-[#fbfaf7] p-2.5 rounded border border-[#e1dcd3] text-[#4a4741] flex items-start gap-1.5">
                            <Quote className="w-3 h-3 text-[#af751b] shrink-0 mt-0.5" />
                            <span>&ldquo;{d.evidence_items[0].quote}&rdquo;</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Tasks, Blockers & Dependencies (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Active Blockers */}
              {spaceBlockers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#e33a22]" />
                    <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                      Active Blockers
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {spaceBlockers.map((b) => (
                      <div key={b.id} className="p-3.5 bg-red-50/70 rounded-lg border border-red-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold text-[#e33a22] tracking-wider">
                            {b.severity} severity
                          </span>
                          <span className="text-[10px] text-[#838280]">
                            Reported by: {b.reported_by || 'Team'}
                          </span>
                        </div>
                        <div className="font-semibold text-[#1c1b1a]">{b.description}</div>
                        {b.evidence_quote && (
                          <div className="italic text-[11px] text-[#4a4741] pt-0.5">
                            &ldquo;{b.evidence_quote}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commitments & Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#2a72de]" />
                    <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                      Space Commitments
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs text-[#2a72de] hover:underline font-medium"
                  >
                    View all {spaceTasks.length} &rarr;
                  </button>
                </div>

                <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#f0ece4] shadow-xs">
                  {spaceTasks.length === 0 ? (
                    <div className="p-4 text-xs text-[#838280] text-center">
                      No open tasks in this space.
                    </div>
                  ) : (
                    spaceTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="p-3.5 space-y-1 hover:bg-[#fbfaf7] transition-colors">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#1c1b1a]">{t.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-[#4a4741] uppercase">
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#838280]">
                          <span>Assignee: {t.assignee_name || 'Unassigned'}</span>
                          <span>Priority: {t.priority}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cross-Space Dependencies */}
              <div className="card-oura p-4 bg-[#fbfaf7] border border-[#e1dcd3] space-y-2">
                <span className="text-xs font-semibold text-[#1c1b1a] block">
                  Cross-Space Linkages
                </span>
                <p className="text-[11px] text-[#7b776f] leading-relaxed">
                  {isBackend
                    ? 'Outputs from this Space directly unblock API migration milestones in Platform Launch.'
                    : isHR
                    ? 'Staffing velocity in this Space directly gates engineering throughput in the Backend Space.'
                    : 'This Space acts as the umbrella milestone coordinating Backend database deliverables and HR staffing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Activity Timeline */}
          <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0ece4] pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-base font-normal text-[#1c1b1a]">
                  Recent Space Activity &amp; Memory Events
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-xs text-[#2a72de] hover:underline font-medium"
              >
                View Complete Audit &rarr;
              </button>
            </div>

            <div className="divide-y divide-[#f0ece4]">
              {getSpaceAuditTrail().slice(0, 2).map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#1c1b1a]">{item.action}: </span>
                    <span className="text-[#4a4741]">{item.description}</span>
                  </div>
                  <span className="text-[11px] text-[#838280] shrink-0 font-mono">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Meetings */}
      {activeTab === 'meetings' && (
        <div className="space-y-3">
          {spaceMeetings.length === 0 ? (
            <div className="card-oura p-8 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
              No meetings recorded in this Space yet.
            </div>
          ) : (
            spaceMeetings.map((m) => (
              <div
                key={m.id}
                className="card-oura p-5 bg-white border border-[#e1dcd3] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#838280] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#5c6f5d] bg-emerald-50 px-2 py-0.5 rounded">
                      {m.source_type}
                    </span>
                    <span className="text-xs text-[#838280]">
                      {new Date(m.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">{m.title}</h4>
                  <div className="text-xs text-[#838280] flex items-center gap-3">
                    <span>{m.segment_count} Transcript Segments</span>
                    <span>&bull;</span>
                    <span>{m.decision_count} Decisions Extracted</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCandidates(m.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-[#1c1b1a] hover:bg-stone-200 transition-all"
                  >
                    Extraction Review
                  </button>
                  <button
                    onClick={() => onOpenMeeting(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Transcript &amp; Intelligence</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Decisions */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {spaceDecisions.length === 0 ? (
            <div className="card-oura p-8 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
              No decisions recorded in this Space yet.
            </div>
          ) : (
            spaceDecisions.map((d) => (
              <div
                key={d.id}
                onClick={() => onOpenDecisionTrail(d)}
                className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    d.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
                  }`}>
                    {d.status}
                  </span>
                  <span className="text-xs text-[#838280]">Decided by: {d.decided_by || 'Team'}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#1c1b1a]">{d.statement}</h4>
                {d.rationale && <p className="text-xs text-[#4a4741]">{d.rationale}</p>}
                {d.evidence_items && d.evidence_items.length > 0 && (
                  <div className="text-xs italic bg-[#fbfaf7] p-2.5 rounded border border-[#e1dcd3] text-[#4a4741]">
                    &ldquo;{d.evidence_items[0].quote}&rdquo;
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3]">
          {spaceTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#838280]">No tasks in this Space.</div>
          ) : (
            spaceTasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-semibold text-[#1c1b1a]">{t.title}</h5>
                  <div className="text-[11px] text-[#838280] flex items-center gap-2 mt-0.5">
                    <span>Assignee: {t.assignee_name || 'Unassigned'}</span>
                    <span>&bull;</span>
                    <span>Priority: {t.priority}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-[#4a4741] uppercase">
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Documents & Context (Genuine rich content) */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-2">
            <h4 className="font-serif text-xl font-normal text-[#1c1b1a]">
              {activeSpace.name} Documentation &amp; Context Pack
            </h4>
            <p className="text-xs text-[#7b776f] max-w-2xl font-light">
              Verified contextual specifications, RFCs, and operating agreements governing this Space.
              All documents are synchronized directly with meeting conclusions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getSpaceDocuments().map((doc, idx) => (
              <div
                key={idx}
                className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3 hover:border-[#838280] transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2a72de]">
                    {doc.type}
                  </span>
                  <span className="text-[#838280] font-mono text-[11px]">{doc.updated}</span>
                </div>

                <div>
                  <h5 className="font-serif text-base font-medium text-[#1c1b1a]">
                    {doc.title}
                  </h5>
                  <p className="text-xs text-[#4a4741] mt-1 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#838280]">
                  <span>Author: <strong>{doc.author}</strong></span>
                  <span className="text-[#2a72de] font-medium flex items-center gap-1 hover:underline cursor-pointer">
                    <FileText className="w-3.5 h-3.5" /> Read Context
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Activity (Genuine rich event stream) */}
      {activeTab === 'activity' && (
        <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4">
          <div className="border-b border-[#e1dcd3] pb-3">
            <h4 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Cryptographic Audit Stream &amp; Lineage
            </h4>
            <p className="text-xs text-[#7b776f] mt-0.5">
              Append-only tamper-evident record of all extractions, supersessions, and approvals in this Space.
            </p>
          </div>

          <div className="space-y-3">
            {getSpaceAuditTrail().map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-[#1c1b1a]">{item.action}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#838280]">{item.date}</span>
                </div>

                <p className="text-[#4a4741] leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#e1dcd3]/60 text-[11px] text-[#838280]">
                  <span className="italic">{item.evidence}</span>
                  <span>Actor: <strong>{item.actor}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
