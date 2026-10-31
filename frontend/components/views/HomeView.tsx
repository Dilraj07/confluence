'use client';

import React from 'react';
import { Decision, Meeting, Task, Blocker, Space } from '@/types';
import {
  Sparkles,
  Mic,
  Flame,
  ArrowRight,
  GitBranch,
  Calendar,
  AlertTriangle,
  Clock,
  User,
  Quote,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface HomeViewProps {
  decisions: Decision[];
  meetings: Meeting[];
  tasks: Task[];
  blockers: Blocker[];
  spaces: Space[];
  selectedSpace: Space | null;
  onOpenAskWithPrompt: (prompt?: string) => void;
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onReviewPending: () => void;
  onNavigateToView: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  decisions,
  meetings,
  tasks,
  blockers,
  spaces,
  selectedSpace,
  onOpenAskWithPrompt,
  onOpenDecisionTrail,
  onOpenMeeting,
  onReviewPending,
  onNavigateToView
}) => {
  const activeBlockers = blockers.filter(b => b.status === 'active');
  const supersededDecisions = decisions.filter(d => d.status === 'superseded');
  const myCommitments = tasks.filter(t => t.status === 'in_progress' || t.status === 'blocked' || t.status === 'todo');

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* 1. Narrative Executive Header & Integrated Ask */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#838280]">
            Executive Briefing &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1c1b1a] mt-1 tracking-tight">
            Good morning, Maya.
          </h1>
          <p className="text-sm text-[#7b776f] mt-1 font-light">
            Here&apos;s what needs your attention today across MeridianPay Smart Routing v2.
          </p>
        </div>

        {/* Integrated Natural Language & Wispr Flow Input Bar */}
        <div className="card-oura p-2 bg-white border border-[#e1dcd3] shadow-xs">
          <div className="flex items-center gap-2">
            <div
              onClick={() => onOpenAskWithPrompt()}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#2a72de] shrink-0" />
              <span className="text-xs text-[#838280] group-hover:text-[#1c1b1a] transition-colors truncate">
                Ask your organisation: &ldquo;Why was the Smart Routing rollout paused?&rdquo;
              </span>
            </div>

            <button
              onClick={() => onOpenAskWithPrompt()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#fbfaf7] border border-[#e1dcd3] hover:bg-stone-100 text-[#1c1b1a] transition-all shrink-0"
              title="Dictate with Wispr Flow"
            >
              <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
              <span className="hidden sm:inline">Wispr Flow</span>
            </button>
          </div>

          {/* Quick Context Prompts */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-t border-[#f0ece4] text-[11px] text-[#838280] overflow-x-auto">
            <span className="shrink-0 font-medium text-[#4a4741]">Try asking:</span>
            <button
              onClick={() => onOpenAskWithPrompt('Why was the Smart Routing rollout paused?')}
              className="shrink-0 px-2 py-0.5 rounded bg-[#f7f1e8] hover:bg-[#e1dcd3] text-[#1c1b1a] transition-colors"
            >
              Why was rollout paused?
            </button>
            <button
              onClick={() => onOpenAskWithPrompt('What changed from the original rollout plan?')}
              className="shrink-0 px-2 py-0.5 rounded bg-[#f7f1e8] hover:bg-[#e1dcd3] text-[#1c1b1a] transition-colors"
            >
              What changed from original plan?
            </button>
            <button
              onClick={() => onOpenAskWithPrompt('What must happen before we can expand to 20%?')}
              className="shrink-0 px-2 py-0.5 rounded bg-[#f7f1e8] hover:bg-[#e1dcd3] text-[#1c1b1a] transition-colors"
            >
              Prerequisites for 20% expansion
            </button>
            <button
              onClick={() => onOpenAskWithPrompt('Which teams still have launch blockers, and who owns each action?')}
              className="shrink-0 px-2 py-0.5 rounded bg-[#f7f1e8] hover:bg-[#e1dcd3] text-[#1c1b1a] transition-colors"
            >
              Launch blockers &amp; owners
            </button>
            <button
              onClick={() => onOpenAskWithPrompt('Can Merchant Operations confirm the pilot expansion date?')}
              className="shrink-0 px-2 py-0.5 rounded bg-[#f7f1e8] hover:bg-[#e1dcd3] text-[#1c1b1a] transition-colors"
            >
              Can Merchant Ops confirm expansion?
            </button>
          </div>
        </div>
      </div>

      {/* 2. Needs Attention (Narrative Priority Block) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e33a22] animate-pulse" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Needs attention
            </h2>
          </div>
          <span className="text-xs text-[#838280]">
            {activeBlockers.length} active launch blocker{activeBlockers.length === 1 ? '' : 's'} &bull; 1 Pending Approval
          </span>
        </div>

        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#f0ece4] shadow-xs">
          {/* Main Risk Story */}
          <div className="p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#e33a22] px-2 py-0.5 rounded">
                  Critical Launch Gate Block
                </span>
                <span className="text-xs text-[#838280]">
                  Smart Routing v2 &bull; 5% Canary Pilot
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#838280]">
                Payments &rarr; SRE &rarr; Risk &rarr; Security
              </span>
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium text-[#1c1b1a]">
                Smart Routing rollout is paused at 5%
              </h3>
              <p className="text-xs text-[#4a4741] mt-1 leading-relaxed">
                The pilot exposed an operational hazard: ambiguous processor timeouts can trigger unsafe retries, potentially creating duplicate authorisation attempts (a processor timeout does not prove the original processor failed to authorise).
                The planned 20% expansion commitment was formally superseded by a <strong>14 November readiness review</strong> requiring sign-off from Payments, SRE, Risk, and Security.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onOpenAskWithPrompt('Why was the Smart Routing rollout paused?')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
              >
                <span>Ask CONFLUENCE for Timeout Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateToView('knowledge')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#2a72de] hover:bg-blue-50 transition-all"
              >
                <span>Inspect Lineage in Knowledge Graph</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Superseded Decision Notice */}
          {supersededDecisions.length > 0 && (
            <div className="p-4 bg-[#fdfbf7] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-[#af751b] shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-[#1c1b1a]">Rollout Commitment Superseded: </span>
                  <span className="text-[#4a4741]">
                    &ldquo;{supersededDecisions[0].statement}&rdquo; was replaced by the 14 November technical readiness review.
                  </span>
                </div>
              </div>
              <button
                onClick={() => onOpenDecisionTrail(supersededDecisions[0])}
                className="text-xs text-[#af751b] font-medium hover:underline shrink-0"
              >
                Inspect Supersession &rarr;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Continue where you left off (Recent Meetings Experience) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5c6f5d]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Continue where you left off
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('meetings')}
            className="text-xs text-[#2a72de] hover:underline font-medium"
          >
            All {meetings.length} Meetings &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.slice(0, 2).map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => onOpenMeeting(meeting)}
              className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#5c6f5d]">
                  {meeting.primary_space_name || 'Meeting Space'}
                </span>
                <span className="text-[#838280]">
                  {new Date(meeting.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-base font-medium text-[#1c1b1a] group-hover:text-[#2a72de] transition-colors leading-snug">
                  {meeting.title}
                </h3>
                <p className="text-xs text-[#7b776f] mt-1 line-clamp-2">
                  {meeting.title.includes('gate')
                    ? 'Evaluated canary metrics, timeout hazard, and established the 14 November readiness review.'
                    : meeting.title.includes('timeout')
                    ? 'Discovered ambiguous processor timeouts triggering duplicate authorization risks during pilot.'
                    : meeting.title.includes('observability')
                    ? 'Established canary pause thresholds (p95 latency > 650 ms, error rate > 0.5%) and rollback runbooks.'
                    : 'Smart Routing architectural review on idempotency keys and cross-processor failover safety.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#838280]">
                <div className="flex items-center gap-3">
                  <span>{meeting.segment_count} segments</span>
                  <span>&bull;</span>
                  <span>{meeting.decision_count} decisions</span>
                </div>
                <span className="text-xs font-semibold text-[#1c1b1a] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Intelligence &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Your upcoming commitments (Execution list) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2a72de]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Your upcoming commitments
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('my-work')}
            className="text-xs text-[#2a72de] hover:underline font-medium"
          >
            My Work &rarr;
          </button>
        </div>

        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#f0ece4] shadow-xs">
          {myCommitments.slice(0, 4).map((task) => {
            const isCritical = task.priority === 'urgent' || task.status === 'blocked';
            return (
              <div
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fbfaf7] transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      isCritical ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] text-[#838280]">
                      Space: <strong className="text-[#1c1b1a]">{task.space_name}</strong>
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-[#1c1b1a]">
                    {task.title}
                  </h4>

                  {task.meeting_title && (
                    <p className="text-[11px] text-[#838280] truncate">
                      Originating from: {task.meeting_title}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#838280] shrink-0">
                  <div className="text-right">
                    <div className="text-[#1c1b1a] font-medium">
                      {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'In progress'}
                    </div>
                    <div className="text-[11px]">{task.assignee_name || 'Unassigned'}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    task.status === 'blocked' ? 'bg-red-100 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Collaborative Spaces Quick Nav */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-normal text-[#1c1b1a]">
            MeridianPay Functional Spaces
          </h2>
          <button
            onClick={() => onNavigateToView('spaces')}
            className="text-xs text-[#2a72de] hover:underline font-medium"
          >
            Explore all {spaces.length} Spaces &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {spaces.map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigateToView('spaces')}
              className="card-oura p-3.5 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#1c1b1a]">{s.name}</h4>
                <span className="text-[10px] text-[#838280] capitalize font-mono">({s.space_type})</span>
              </div>
              <p className="text-[11px] text-[#838280] line-clamp-1">
                {s.description || 'Department workspace'}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-[#838280] pt-1">
                <span>{s.decision_count} Decisions</span>
                <span>&bull;</span>
                <span>{s.task_count} Tasks</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
