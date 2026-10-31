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
  ExternalLink
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
  // Focus on actionable items
  const activeBlockers = blockers.filter(b => b.status === 'active');
  const supersededDecisions = decisions.filter(d => d.status === 'superseded');
  const activeDecisions = decisions.filter(d => d.status === 'active');
  const upcomingTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo');

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      {/* 1. Prominent Ask CONFLUENCE & Wispr Flow Dictation Hero */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded-full">
                Organisational Memory Search
              </span>
              <span className="text-xs text-[#838280]">
                {selectedSpace ? `Scoped to ${selectedSpace.name}` : 'Full Organisation Knowledge'}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a] mt-1">
              Ask your organisation.
            </h2>
            <p className="text-xs text-[#7b776f] font-light">
              Retrieve decisions, understand blockers, and trace commitments across meetings.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto text-[11px] text-[#838280] bg-[#fbfaf7] border border-[#e1dcd3] px-2.5 py-1 rounded-full">
            <Mic className="w-3 h-3 text-[#2a72de]" />
            <span>Wispr Flow Dictation Supported</span>
          </div>
        </div>

        {/* Input Bar */}
        <div
          onClick={() => onOpenAskWithPrompt()}
          className="relative cursor-pointer group"
        >
          <input
            type="text"
            readOnly
            placeholder='Ask: "Why is our January platform launch at risk?" or click to speak...'
            className="w-full text-xs p-3.5 pl-4 pr-36 rounded-xl border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] cursor-pointer group-hover:border-[#838280] shadow-inner transition-all"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1.5 bg-white border border-[#e1dcd3] px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#1c1b1a] shadow-xs group-hover:bg-[#f7f1e8] transition-all">
            <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>Dictate Prompt</span>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#838280]">
          <span className="font-medium shrink-0">Try asking:</span>
          <button
            onClick={() => onOpenAskWithPrompt('Why is our January platform launch at risk?')}
            className="shrink-0 px-2.5 py-1 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
          >
            &ldquo;Why is platform launch at risk?&rdquo;
          </button>
          <button
            onClick={() => onOpenAskWithPrompt('What did the backend team decide in its last meeting?')}
            className="shrink-0 px-2.5 py-1 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
          >
            &ldquo;What did backend team decide?&rdquo;
          </button>
          <button
            onClick={() => onOpenAskWithPrompt('Which unresolved blockers are affecting recruitment?')}
            className="shrink-0 px-2.5 py-1 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
          >
            &ldquo;Which blockers affect recruitment?&rdquo;
          </button>
        </div>
      </div>

      {/* 2. Critical Cross-Team Alert (If Any Active Blockers or Risks) */}
      {activeBlockers.length > 0 && (
        <div className="card-oura p-4 bg-white border-l-4 border-l-[#e33a22] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-[#e33a22] mt-0.5 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e33a22]">
                  Cross-Space Risk & Blocker
                </span>
                <span className="text-[10px] bg-red-100 text-[#e33a22] px-2 py-0.2 rounded font-semibold">
                  HR &rarr; Engineering &rarr; Product
                </span>
              </div>
              <p className="text-xs text-[#1c1b1a] mt-1 font-normal">
                {activeBlockers[0].description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAskWithPrompt('Why is our January platform launch at risk?')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <span>Inspect Decision Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Two-Column Workspace Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decisions Requiring Attention & Recent Meetings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Decisions Requiring Attention */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#af751b]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Decisions Requiring Attention
                </h3>
              </div>
              <button
                onClick={() => onNavigateToView('knowledge')}
                className="text-xs text-[#2a72de] hover:underline font-medium"
              >
                View Network &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {decisions.slice(0, 3).map((decision) => {
                const isSuperseded = decision.status === 'superseded';
                return (
                  <div
                    key={decision.id}
                    onClick={() => onOpenDecisionTrail(decision)}
                    className="card-oura p-4 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSuperseded ? 'bg-amber-100 text-[#af751b]' : 'bg-blue-50 text-[#2a72de]'
                        }`}>
                          {decision.status}
                        </span>
                        <span className="text-[11px] text-[#838280]">
                          Space: <strong className="text-[#1c1b1a]">{decision.space_name}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#838280]">
                        {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className={`text-xs font-semibold ${isSuperseded ? 'line-through text-[#838280]' : 'text-[#1c1b1a]'}`}>
                      {decision.statement}
                    </h4>

                    {decision.evidence_items && decision.evidence_items.length > 0 && (
                      <div className="text-[11px] italic bg-[#fbfaf7] p-2 rounded border border-[#e1dcd3] text-[#4a4741] truncate flex items-center gap-1.5">
                        <Quote className="w-3 h-3 text-[#af751b] shrink-0" />
                        <span className="truncate">&ldquo;{decision.evidence_items[0].quote}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5c6f5d]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Recent Meetings
                </h3>
              </div>
              <button
                onClick={() => onNavigateToView('meetings')}
                className="text-xs text-[#2a72de] hover:underline font-medium"
              >
                All Meetings &rarr;
              </button>
            </div>

            <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3]">
              {meetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => onOpenMeeting(meeting)}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#fbfaf7] cursor-pointer transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-[#5c6f5d] bg-emerald-50 px-1.5 py-0.2 rounded">
                        {meeting.primary_space_name}
                      </span>
                      <span className="text-[11px] text-[#838280]">
                        {new Date(meeting.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#1c1b1a] truncate">
                      {meeting.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#838280] shrink-0">
                    <span>{meeting.decision_count} decisions</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#cccac7]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Commitments & Space Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Commitments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Upcoming Commitments
                </h3>
              </div>
              <button
                onClick={() => onNavigateToView('my-work')}
                className="text-xs text-[#2a72de] hover:underline font-medium"
              >
                My Work &rarr;
              </button>
            </div>

            <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3]">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="p-3.5 space-y-1.5 hover:bg-[#fbfaf7] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#838280]">
                      {task.space_name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                      task.priority === 'urgent' ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h5 className="text-xs font-medium text-[#1c1b1a]">
                    {task.title}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] text-[#838280] pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignee_name || 'Unassigned'}
                    </span>
                    {task.due_date && (
                      <span>Due {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spaces Overview Quick Nav */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                Workspaces & Departments
              </h3>
              <button
                onClick={() => onNavigateToView('spaces')}
                className="text-xs text-[#2a72de] hover:underline font-medium"
              >
                All Spaces &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {spaces.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onNavigateToView('spaces')}
                  className="card-oura p-3 bg-white border border-[#e1dcd3] flex items-center justify-between hover:border-[#838280] cursor-pointer transition-all"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-[#1c1b1a]">{s.name}</h5>
                    <p className="text-[11px] text-[#838280] truncate max-w-[200px]">
                      {s.description || 'Department workspace'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#838280]">
                    <span>{s.decision_count} Decisions</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#cccac7]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

