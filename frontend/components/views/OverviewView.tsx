'use client';

import React from 'react';
import { Decision, Meeting, Task, Blocker, Space } from '@/types';
import { OverviewChatbot } from '@/components/chat/OverviewChatbot';
import {
  Sparkles,
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
  ArrowUpRight,
  Compass,
  FileText,
  Activity
} from 'lucide-react';

interface OverviewViewProps {
  decisions: Decision[];
  meetings: Meeting[];
  tasks: Task[];
  blockers: Blocker[];
  spaces: Space[];
  selectedSpace: Space | null;
  onOpenDecision: (decisionId: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onNavigateToView: (view: string) => void;
  onOpenAskWithPrompt: (prompt?: string) => void;
  onTaskCreated?: (task: Task) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  decisions,
  meetings,
  tasks,
  blockers,
  spaces,
  selectedSpace,
  onOpenDecision,
  onOpenMeeting,
  onNavigateToView,
  onOpenAskWithPrompt,
  onTaskCreated
}) => {
  const activeBlockers = blockers.filter(b => b.status === 'active');
  const myCommitments = tasks.filter(t => t.status === 'in_progress' || t.status === 'blocked' || t.status === 'todo');

  return (
    <div className="space-y-7 max-w-5xl mx-auto py-6">
      {/* 1. Executive Briefing Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#838280]">
          Executive Briefing &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <h1 className="font-serif text-3xl font-normal text-[#1c1b1a] tracking-tight">
          Good morning, Maya.
        </h1>
        <p className="text-xs text-[#7b776f] font-light">
          Here is what requires executive attention across MeridianPay Smart Routing v2.
        </p>
      </div>

      {/* 2. Interactive Workspace Copilot Chatbot */}
      <OverviewChatbot
        spaces={spaces}
        selectedSpace={selectedSpace}
        onOpenDecision={onOpenDecision}
        onOpenMeeting={onOpenMeeting}
        onNavigateToView={onNavigateToView}
        onOpenAskWithPrompt={onOpenAskWithPrompt}
        meetings={meetings}
        tasks={tasks}
        decisions={decisions}
        blockers={blockers}
        onTaskCreated={onTaskCreated}
      />

      {/* 3. Prioritised Attention Item (The Core Operational Risk) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e33a22] animate-pulse" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Prioritised Attention
            </h2>
          </div>
          <span className="text-xs text-[#838280]">
            {activeBlockers.length} active blockers &bull; Rollout paused at 5%
          </span>
        </div>

        <div className="card-oura bg-white border border-[#e1dcd3] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ece4] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#e33a22] px-2 py-0.5 rounded border border-red-200">
                Critical Launch Hazard
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
            <h3 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Smart Routing rollout is paused at 5%
            </h3>
            <p className="text-xs text-[#4a4741] mt-1.5 leading-relaxed">
              The pilot exposed a critical operational hazard: ambiguous processor timeouts trigger unsafe retries, risking duplicate customer charges (a timeout does not prove the original processor failed to authorize).
              The automated 20% expansion commitment was formally superseded by the <strong>14 November technical readiness review</strong> requiring four-team approval.
            </p>
          </div>

          {/* Direct Canonical Links */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onOpenDecision('dec-014')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all shadow-xs"
            >
              <span>Inspect Idempotency Decision (DEC-014)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenDecision('dec-002')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#2a72de] hover:bg-blue-50 transition-all border border-blue-200"
            >
              <span>Review 14 Nov Gate (DEC-002)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Important Organisational Changes (Canonical Decision Summaries) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#af751b]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Important Organisational Changes
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('decisions')}
            className="text-xs text-[#2a72de] hover:underline font-medium"
          >
            Decision Timeline &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: DEC-014 */}
          <div
            onClick={() => onOpenDecision('dec-014')}
            className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-[#1c1b1a]">DEC-014 · Payments Platform</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#af751b] border border-amber-200">
                Revised
              </span>
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#1c1b1a]">
                Adopt idempotency keys for payment retries
              </h4>
              <p className="text-xs text-[#7b776f] mt-1 leading-relaxed">
                Key retention extended from 24h to 72h after QA identified delayed webhooks. Replaced exponential backoff (DEC-009).
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-[#838280]">
              <span>Owner: <strong>Daniel Foster &amp; Elena Petrova</strong></span>
              <span className="text-[#2a72de] font-semibold flex items-center gap-1">
                <span>View Decision Detail</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: DEC-002 */}
          <div
            onClick={() => onOpenDecision('dec-002')}
            className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-[#1c1b1a]">DEC-002 · Product &amp; Strategy</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Gate
              </span>
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#1c1b1a]">
                14 November Four-Team Readiness Review Gate
              </h4>
              <p className="text-xs text-[#7b776f] mt-1 leading-relaxed">
                Formally supersedes the automated 20% calendar rollout commitment. Requires explicit sign-off from Payments, SRE, Risk, and Security.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-[#838280]">
              <span>Owner: <strong>Maya Chen (Product Manager)</strong></span>
              <span className="text-[#2a72de] font-semibold flex items-center gap-1">
                <span>View Decision Detail</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pending Actions & Active Blockers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4a4741]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Pending Actions &amp; Commitments
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('my-work')}
            className="text-xs text-[#2a72de] hover:underline font-medium"
          >
            My Work Tracker &rarr;
          </button>
        </div>

        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#f0ece4] shadow-xs">
          {myCommitments.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fbfaf7] transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    task.priority === 'urgent' ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-[#838280] truncate">
                    📁 {task.space_name || 'Space'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#1c1b1a]">
                  {task.title}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="text-right text-[11px] text-[#838280]">
                  <span className="block font-medium text-[#1c1b1a]">{task.assignee_name}</span>
                  {task.due_date && (
                    <span>Due {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  task.status === 'blocked' ? 'bg-red-100 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Upcoming Review Meetings & Launch Calendar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2a72de]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Upcoming Review Meetings &amp; Launch Calendar
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('meetings')}
            className="text-xs text-[#2a72de] hover:underline font-medium flex items-center gap-1"
          >
            <span>Open Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Nov 14 Gate Meeting */}
          <div
            onClick={() => {
              const m14 = meetings.find(m => m.meeting_date && m.meeting_date.includes('2026-11-14')) || meetings[meetings.length - 1];
              if (m14) onOpenMeeting(m14);
              else onNavigateToView('meetings');
            }}
            className="card-oura p-4 bg-gradient-to-br from-red-50/50 to-white border border-red-200 hover:border-red-400 cursor-pointer transition-all space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#e33a22]">
                14 Nov Gate
              </span>
              <span className="text-xs font-mono text-stone-500">10:00 AM</span>
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#1c1b1a] line-clamp-2">
                Technical Readiness Review Gate
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                Mandatory 4-team sign-off before 20% expansion. Payments, SRE, Risk, and Security review.
              </p>
            </div>
            <div className="pt-2 border-t border-red-100 flex items-center justify-between text-[11px] text-red-700 font-medium">
              <span>DEC-002 Requirement</span>
              <span className="flex items-center gap-1">Inspect &rarr;</span>
            </div>
          </div>

          {/* Today: 31 Oct Idempotency Session */}
          <div
            onClick={() => {
              const m31 = meetings.find(m => m.meeting_date && m.meeting_date.includes('2026-10-31'));
              if (m31) onOpenMeeting(m31);
              else onNavigateToView('meetings');
            }}
            className="card-oura p-4 bg-white border border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Today &bull; 31 Oct
              </span>
              <span className="text-xs font-mono text-stone-500">03:50 PM</span>
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1c1b1a] line-clamp-2">
                Idempotency &amp; Reconciliation Review
              </h4>
              <p className="text-[11px] text-[#7b776f] mt-1 line-clamp-2">
                Payments engineering session on idempotency retention and safe processor retries.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-stone-500">
              <span>Payments Platform</span>
              <span className="text-emerald-700 flex items-center gap-1 font-medium">Inspect &rarr;</span>
            </div>
          </div>

          {/* 29 Oct Launch Gate Decision */}
          <div
            onClick={() => {
              const m29 = meetings.find(m => m.meeting_date && m.meeting_date.includes('2026-10-29'));
              if (m29) onOpenMeeting(m29);
              else onNavigateToView('meetings');
            }}
            className="card-oura p-4 bg-white border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#2a72de] border border-blue-200">
                29 Oct 2026
              </span>
              <span className="text-xs font-mono text-stone-500">09:30 AM</span>
            </div>
            <div>
              <h4 className="font-serif text-sm font-medium text-[#1c1b1a] line-clamp-2">
                Smart Routing Launch Gate Decision
              </h4>
              <p className="text-[11px] text-[#7b776f] mt-1 line-clamp-2">
                Rollout paused at 5% due to timeout ambiguity risk. Established 14 Nov gate.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-stone-500">
              <span>Product &amp; Strategy</span>
              <span className="text-[#2a72de] flex items-center gap-1 font-medium">Inspect &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Recent Activity Audit Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2a72de]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Recent Activity Stream
            </h2>
          </div>
          <span className="text-xs text-[#838280]">Cryptographic append-only audit trail</span>
        </div>

        <div className="card-oura bg-white border border-[#e1dcd3] p-4 divide-y divide-[#f0ece4] shadow-xs text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[#1c1b1a]">
                <strong>Decision DEC-014</strong> updated to status <span className="font-mono text-[#af751b]">Revised</span> (Key retention extended to 72h).
              </span>
            </div>
            <span className="text-[11px] text-[#838280]">29 Oct 2026</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[#1c1b1a]">
                <strong>Meeting Ingestion</strong>: Pilot performance review transcript ingested &amp; verified.
              </span>
            </div>
            <span className="text-[11px] text-[#838280]">04 Nov 2026</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[#1c1b1a]">
                <strong>Launch Gate DEC-002</strong> confirmed: 20% expansion paused pending 14 Nov review.
              </span>
            </div>
            <span className="text-[11px] text-[#838280]">04 Nov 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};

