'use client';

import React from 'react';
import { Decision, Meeting, Task, Blocker, Space } from '@/types';
import { Logo } from '@/components/brand/Logo';
import {
  Compass,
  CheckSquare,
  CalendarDays,
  GitBranch,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Mic,
  Users,
  ChevronRight,
  Activity,
  ArrowUpRight,
  Flame,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';

interface LandingPageViewProps {
  spaces: Space[];
  meetings: Meeting[];
  decisions: Decision[];
  tasks: Task[];
  blockers: Blocker[];
  onNavigateToView: (view: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenDecision: (decisionId: string) => void;
  onOpenAskWithPrompt: (prompt?: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  spaces,
  meetings,
  decisions,
  tasks,
  blockers,
  onNavigateToView,
  onOpenMeeting,
  onOpenDecision,
  onOpenAskWithPrompt
}) => {
  const activeBlockers = blockers.filter(b => b.status === 'active');
  const myCommitments = tasks.filter(t => t.status === 'in_progress' || t.status === 'blocked' || t.status === 'todo');

  const screenDestinations = [
    {
      id: 'overview',
      title: 'Executive Overview Dashboard',
      badge: 'Main Screen',
      badgeColor: 'bg-blue-50 text-[#2a72de] border-blue-200',
      icon: Compass,
      iconBg: 'bg-[#1c1b1a] text-white',
      description:
        'Prioritised launch hazard (5% pause), active cross-team blockers, audit stream, and embedded Workspace Copilot chatbot.',
      metrics: `${activeBlockers.length} Active Blocker · Pilot Paused`,
      actionText: 'Go to Overview',
      primary: true
    },
    {
      id: 'my-work',
      title: 'My Work & Execution Queue',
      badge: 'Maya Chen',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckSquare,
      iconBg: 'bg-emerald-600 text-white',
      description:
        'Personal governance commitments for the 14 Nov readiness gate, merchant communication policies, and direct task actions.',
      metrics: '4 Active Commitments · Due Nov 06 - 12',
      actionText: 'Go to My Work'
    },
    {
      id: 'meetings',
      title: 'Meeting Repository & Calendar',
      badge: 'Oct 31 Today · Nov 14 Gate',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CalendarDays,
      iconBg: 'bg-purple-600 text-white',
      description:
        'Interactive calendar covering today (31 Oct architecture review) and the Nov launch schedule with turn-by-turn evidence.',
      metrics: `${meetings.length} Verified Transcripts · Dual Month`,
      actionText: 'Go to Calendar'
    },
    {
      id: 'decisions',
      title: 'Decision Explorer & Network',
      badge: '24 Decisions',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: GitBranch,
      iconBg: 'bg-amber-600 text-white',
      description:
        'Cryptographic append-only decision lineage. Inspect DEC-014 (idempotency key retention 72h) and DEC-002 (readiness gate).',
      metrics: 'DEC-014 Revised · DEC-002 Active Gate',
      actionText: 'Go to Decisions'
    },
    {
      id: 'ask',
      title: 'Ask CONFLUENCE Copilot',
      badge: 'Real-time Gemini AI · Voice',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Sparkles,
      iconBg: 'bg-blue-600 text-white',
      description:
        'Conversational search with Wispr Flow speech dictation, inline LaTeX mathematical formatting, and transcript citation links.',
      metrics: 'Zero Hallucinations · Real-time LLM',
      actionText: 'Go to Copilot'
    },
    {
      id: 'spaces',
      title: 'Organizational Spaces Hub',
      badge: `${spaces.length} Spaces`,
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
      icon: Layers,
      iconBg: 'bg-stone-800 text-white',
      description:
        'Scoped organizational memory hubs across Payments Platform, SRE, Risk & Fraud, Security & Compliance, and Merchant Operations.',
      metrics: '5 Teams · Cross-space Linked',
      actionText: 'Go to Spaces'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 animate-in fade-in duration-200">
      {/* 1. Hero Welcome & Executive Status */}
      <div className="card-oura bg-gradient-to-br from-white via-[#fcfbf9] to-[#f7f2ea] border border-[#e1dcd3] p-8 md:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 translate-y-1/3 w-80 h-80 bg-amber-50/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#f0ece4] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-[#1c1b1a]">
                CONFLUENCE Memory Network Live
              </span>
              <span className="text-[#838280]">&bull;</span>
              <span className="text-stone-600 font-medium">
                Today is <strong>Saturday, October 31, 2026</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-[#e1dcd3]">
                Logged in: Maya Chen (Lead PM)
              </span>
            </div>
          </div>

          {/* Main Hero Header */}
          <div className="space-y-3 max-w-3xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#2a72de] font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
              MeridianPay &bull; Smart Routing v2
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal text-[#1c1b1a] tracking-tight leading-tight">
              Welcome to Your Organizational Memory
            </h1>
            <p className="text-sm md:text-base text-[#5c5850] font-light leading-relaxed">
              Zero-hallucination institutional intelligence, verifiable decision lineages, and launch gate synchronization across Payments, SRE, Risk, Security, and Merchant Operations.
            </p>
          </div>

          {/* Fast-Track Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToView('overview')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-black transition-all shadow-sm group"
            >
              <span>Enter Workspace Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToView('meetings')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#e1dcd3] text-[#1c1b1a] hover:bg-stone-50 hover:border-[#838280] transition-all shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-[#2a72de]" />
              <span>Meeting Calendar (Oct &amp; Nov)</span>
            </button>

            <button
              onClick={() => onNavigateToView('my-work')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#e1dcd3] text-[#1c1b1a] hover:bg-stone-50 hover:border-[#838280] transition-all shadow-2xs"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>My Tasks ({myCommitments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Critical Launch Gate Horizon Alert */}
      <div className="card-oura p-5 bg-white border-l-4 border-l-[#e33a22] border-y border-r border-[#e1dcd3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#e33a22] border border-red-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#e33a22] px-2 py-0.5 rounded">
                Active Governance Gate
              </span>
              <span className="text-xs text-[#838280] font-mono">DEC-002</span>
            </div>
            <h3 className="font-serif text-base font-semibold text-[#1c1b1a] mt-0.5">
              14 November Technical Readiness Review Gate
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Smart Routing rollout is paused at 5% due to processor timeout ambiguity. 20% expansion is on hold pending mandatory sign-off from Payments, SRE, Risk, and Security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenDecision('dec-002')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-[#e33a22] border border-red-200 transition-colors"
          >
            Review Gate Policy
          </button>
          <button
            onClick={() => onNavigateToView('meetings')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] hover:bg-stone-800 text-white transition-colors"
          >
            View in Calendar
          </button>
        </div>
      </div>

      {/* 3. "Go to Your Screen" Quick-Launch Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1dcd3] pb-3">
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
              Choose Your Destination Screen
            </h2>
            <p className="text-xs text-[#7b776f] mt-0.5 font-light">
              Select any workspace module below to jump directly into your work.
            </p>
          </div>
          <span className="text-xs text-[#838280] font-mono">
            6 Available Views &bull; Maya Chen Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {screenDestinations.map((dest) => {
            const Icon = dest.icon;
            return (
              <div
                key={dest.id}
                onClick={() => onNavigateToView(dest.id)}
                className={`card-oura p-6 bg-white border transition-all cursor-pointer flex flex-col justify-between group shadow-xs ${
                  dest.primary
                    ? 'border-[#2a72de] hover:border-[#1c1b1a] ring-1 ring-[#2a72de]/20 hover:shadow-md'
                    : 'border-[#e1dcd3] hover:border-[#2a72de] hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${dest.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${dest.badgeColor}`}>
                      {dest.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1b1a] group-hover:text-[#2a72de] transition-colors">
                      {dest.title}
                    </h3>
                    <p className="text-xs text-[#6a665f] mt-1.5 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>
                </div>

                {/* Footer Meta & Action */}
                <div className="pt-4 mt-4 border-t border-[#f0ece4] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#838280]">
                    {dest.metrics}
                  </span>
                  <span className="font-semibold text-[#2a72de] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{dest.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Today's Agenda (Oct 31) & Upcoming Timeline Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2a72de]" />
            <h2 className="font-serif text-xl font-normal text-[#1c1b1a]">
              Today (31 Oct 2026) &amp; Launch Timeline
            </h2>
          </div>
          <button
            onClick={() => onNavigateToView('meetings')}
            className="text-xs text-[#2a72de] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Interactive Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Today's Session (31 Oct) */}
          <div
            onClick={() => {
              const mToday = meetings.find(m => m.meeting_date && m.meeting_date.includes('2026-10-31'));
              if (mToday) onOpenMeeting(mToday);
              else onNavigateToView('meetings');
            }}
            className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-emerald-500 cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Today &bull; 31 Oct 2026
              </span>
              <span className="text-xs font-mono text-stone-500">15:50 PM</span>
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#1c1b1a]">
                Idempotency and Reconciliation Architecture Extension
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Platform Payments review on idempotency key retention, safe retry policies, and eliminating duplicate charge risks during failover.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-stone-500">
              <span>Payments Platform</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span>Inspect Transcript</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card B: Launch Gate Review (14 Nov) */}
          <div
            onClick={() => {
              const mGate = meetings.find(m => m.meeting_date && m.meeting_date.includes('2026-11-14'));
              if (mGate) onOpenMeeting(mGate);
              else onNavigateToView('meetings');
            }}
            className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-red-400 cursor-pointer transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-[#e33a22] border border-red-200">
                14 Nov Gate &bull; 14 Days Remaining
              </span>
              <span className="text-xs font-mono text-stone-500">10:00 AM</span>
            </div>
            <div>
              <h4 className="font-serif text-base font-medium text-[#1c1b1a]">
                Smart Routing v2 Technical Readiness Review Gate
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Mandatory multi-team sign-off before 20% traffic expansion. Payments, SRE, Risk, and Security verification.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-xs text-stone-500">
              <span>Product &amp; Strategy</span>
              <span className="text-[#e33a22] font-semibold flex items-center gap-1">
                <span>Inspect Gate Agenda</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Institutional Memory Health & System Specs */}
      <div className="card-oura bg-[#fbfaf7] border border-[#e1dcd3] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-[#7b776f]">
        <div className="flex items-center gap-6">
          <div>
            <span className="font-mono text-[#1c1b1a] font-bold text-sm block">10</span>
            <span>Canonical Transcripts</span>
          </div>
          <div className="h-6 w-px bg-stone-300" />
          <div>
            <span className="font-mono text-[#1c1b1a] font-bold text-sm block">24</span>
            <span>Decisions Linked</span>
          </div>
          <div className="h-6 w-px bg-stone-300" />
          <div>
            <span className="font-mono text-[#1c1b1a] font-bold text-sm block">5</span>
            <span>Team Spaces</span>
          </div>
          <div className="h-6 w-px bg-stone-300" />
          <div>
            <span className="font-mono text-emerald-700 font-bold text-sm block">$0.00</span>
            <span>Local Retrieval Cost</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAskWithPrompt()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>Ask CONFLUENCE Copilot</span>
          </button>
        </div>
      </div>
    </div>
  );
};

