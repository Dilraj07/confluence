'use client';

import React from 'react';
import { Decision, Task, Blocker, MetricsSummary, Space } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  User,
  Quote,
  Flame,
  ExternalLink
} from 'lucide-react';

interface CommandCentreProps {
  metrics: MetricsSummary | null;
  decisions: Decision[];
  tasks: Task[];
  blockers: Blocker[];
  spaces: Space[];
  selectedSpaceId: string | null;
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenAskLaunchRisk: () => void;
  onReviewPending: () => void;
}

export const CommandCentre: React.FC<CommandCentreProps> = ({
  metrics,
  decisions,
  tasks,
  blockers,
  spaces,
  selectedSpaceId,
  onOpenDecisionTrail,
  onOpenAskLaunchRisk,
  onReviewPending
}) => {
  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  // Separate active vs superseded
  const activeDecisions = decisions.filter(d => d.status === 'active');
  const supersededDecisions = decisions.filter(d => d.status === 'superseded');
  const criticalBlockers = blockers.filter(b => b.status === 'active');

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Title & Scope Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e1dcd3] pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#838280]">
            Executive Intelligence
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1c1b1a] mt-1">
            {selectedSpace ? `${selectedSpace.name} Command Centre` : 'Organisational Memory Overview'}
          </h1>
          <p className="text-sm text-[#4a4741] mt-1.5 max-w-2xl font-light">
            Evidence-backed decision lineage, cross-team commitments, and operational dependencies across Acme Cloud Technologies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#e1dcd3] text-[#4a4741]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync: Postgres Canonical Store
          </span>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="card-oura p-4 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#838280]">Active Decisions</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-light text-[#1c1b1a]">{metrics?.active_decisions ?? 0}</span>
            <span className="text-[11px] font-medium text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded-full">Canonical</span>
          </div>
        </div>

        <div className="card-oura p-4 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#838280]">Superseded</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-light text-[#af751b]">{metrics?.superseded_decisions ?? 0}</span>
            <span className="text-[11px] font-medium text-[#af751b] bg-amber-50 px-2 py-0.5 rounded-full">Audited</span>
          </div>
        </div>

        <div className="card-oura p-4 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#838280]">Open Tasks</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-light text-[#5c6f5d]">{metrics?.open_tasks ?? 0}</span>
            <span className="text-[11px] font-medium text-[#5c6f5d] bg-emerald-50 px-2 py-0.5 rounded-full">Tracked</span>
          </div>
        </div>

        <div className="card-oura p-4 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#838280]">Active Blockers</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-light text-[#e33a22]">{metrics?.active_blockers ?? 0}</span>
            <span className="text-[11px] font-medium text-[#e33a22] bg-red-50 px-2 py-0.5 rounded-full">Impact</span>
          </div>
        </div>

        <div className="card-oura p-4 bg-white flex flex-col justify-between cursor-pointer hover:border-[#2a72de] transition-all" onClick={onReviewPending}>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#838280]">Pending Review</span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-3xl font-light text-[#6b443d]">{metrics?.pending_reviews ?? 0}</span>
            <span className="text-[11px] font-medium text-[#6b443d] bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              Review <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Space High Risk Banner */}
      <div className="card-oura p-5 bg-[#ffffff] border-l-4 border-l-[#e33a22] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-full bg-red-50 text-[#e33a22] mt-0.5">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e33a22]">
                Critical Cross-Space Launch Risk Detected
              </span>
              <span className="text-[11px] bg-red-100 text-[#e33a22] px-2 py-0.5 rounded-full font-medium">
                Affects Platform Launch
              </span>
            </div>
            <p className="text-sm text-[#1c1b1a] mt-1 font-normal">
              Database schema partitioning decision (Engineering &rarr; Backend) + Senior Backend hiring delay (HR &rarr; Recruitment) threatens the March 15 launch target.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAskLaunchRisk}
          className="self-stretch md:self-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all whitespace-nowrap"
        >
          <span>Inspect Decision Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decision Lineage Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#2a72de]" />
              <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">Decision Lineage & History</h2>
            </div>
            <span className="text-xs text-[#838280]">Append-only audit trail</span>
          </div>

          <div className="space-y-3.5">
            {decisions.slice(0, 5).map(decision => {
              const isSuperseded = decision.status === 'superseded';
              return (
                <div
                  key={decision.id}
                  onClick={() => onOpenDecisionTrail(decision)}
                  className={`card-oura p-5 cursor-pointer transition-all hover:border-[#838280] ${
                    isSuperseded ? 'bg-[#f7f1e8]/60 opacity-80 border-dashed' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSuperseded
                          ? 'bg-amber-100 text-[#af751b]'
                          : 'bg-blue-50 text-[#2a72de]'
                      }`}>
                        {decision.status}
                      </span>
                      <span className="text-xs font-medium text-[#838280]">
                        Space: <strong className="text-[#1c1b1a]">{decision.space_name || 'Engineering'}</strong>
                      </span>
                    </div>

                    <span className="text-[11px] text-[#838280]">
                      {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className={`mt-2 text-sm font-semibold ${isSuperseded ? 'text-[#838280] line-through' : 'text-[#1c1b1a]'}`}>
                    {decision.statement}
                  </h3>

                  {decision.rationale && (
                    <p className="text-xs text-[#4a4741] mt-1.5 line-clamp-2">
                      {decision.rationale}
                    </p>
                  )}

                  {/* Evidence Citation Tag */}
                  {decision.evidence_items && decision.evidence_items.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#e1dcd3] flex items-center gap-2 text-xs text-[#4a4741] bg-[#f7f1e8]/40 p-2 rounded-lg">
                      <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0" />
                      <span className="italic truncate">&ldquo;{decision.evidence_items[0].quote}&rdquo;</span>
                      <span className="ml-auto text-[10px] font-semibold text-[#838280] shrink-0">
                        {decision.evidence_items[0].speaker_name || 'Speaker'}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-[#838280]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span>Decided by: {decision.decided_by || 'Team'}</span>
                    </div>
                    {decision.versions && decision.versions.length > 1 && (
                      <span className="text-[11px] font-medium text-[#af751b]">
                        v{decision.versions.length} (Supersedes previous baseline)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Blockers & Tasks (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Blockers Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#e33a22]" />
                <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">Active Blockers</h2>
              </div>
              <span className="text-xs text-[#838280]">{criticalBlockers.length} Unresolved</span>
            </div>

            <div className="space-y-3">
              {criticalBlockers.length === 0 ? (
                <div className="card-oura p-6 text-center text-xs text-[#838280]">
                  No active blockers. Operations running smoothly.
                </div>
              ) : (
                criticalBlockers.map(blocker => (
                  <div key={blocker.id} className="card-oura p-4 bg-white border border-[#e1dcd3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#e33a22] bg-red-50 px-2 py-0.5 rounded-full">
                        {blocker.severity} Severity
                      </span>
                      <span className="text-xs text-[#838280]">{blocker.space_name}</span>
                    </div>

                    <p className="text-xs font-medium text-[#1c1b1a]">
                      {blocker.description}
                    </p>

                    {blocker.evidence_quote && (
                      <div className="text-[11px] italic text-[#4a4741] bg-[#f7f1e8] p-2 rounded border border-[#e1dcd3]/60">
                        &ldquo;{blocker.evidence_quote}&rdquo;
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#838280] pt-1">
                      <span>Reported by: {blocker.reported_by || 'Unknown'}</span>
                      <span className="text-amber-700 font-semibold">Blocks downstream work</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Commitments / High Priority Tasks */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5c6f5d]" />
                <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">Key Commitments</h2>
              </div>
              <span className="text-xs text-[#838280]">Recent meeting tasks</span>
            </div>

            <div className="card-oura bg-white divide-y divide-[#e1dcd3]">
              {tasks.slice(0, 4).map(task => (
                <div key={task.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#f7f1e8]/30 transition-all">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#838280]">
                      {task.space_name || 'Space'}
                    </span>
                    <h4 className="text-xs font-semibold text-[#1c1b1a] mt-0.5">
                      {task.title}
                    </h4>
                    <span className="text-[11px] text-[#4a4741]">
                      Owner: {task.assignee_name || 'Unassigned'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    task.status === 'in_progress' ? 'bg-blue-50 text-[#2a72de]' : 'bg-stone-100 text-[#4a4741]'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
