'use client';

import React, { useState } from 'react';
import { Space, Meeting, Decision, Task, Blocker, TranscriptSegment } from '@/types';
import {
  Layers,
  Calendar,
  FileText,
  CheckSquare,
  AlertCircle,
  Clock,
  User,
  Quote,
  ChevronRight,
  Eye,
  Plus
} from 'lucide-react';

interface SpaceViewProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
  meetings: Meeting[];
  decisions: Decision[];
  tasks: Task[];
  blockers: Blocker[];
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenCandidates: (meetingId: string) => void;
  onOpenIngest: () => void;
}

export const SpaceView: React.FC<SpaceViewProps> = ({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  meetings,
  decisions,
  tasks,
  blockers,
  onOpenMeeting,
  onOpenCandidates,
  onOpenIngest,
}) => {
  const [subTab, setSubTab] = useState<'meetings' | 'decisions' | 'tasks' | 'blockers'>('meetings');

  const activeSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];

  const filteredMeetings = meetings.filter(m => m.primary_space_id === activeSpace?.id);
  const filteredDecisions = decisions.filter(d => d.space_id === activeSpace?.id);
  const filteredTasks = tasks.filter(t => t.space_id === activeSpace?.id);
  const filteredBlockers = blockers.filter(b => b.space_id === activeSpace?.id);

  if (!activeSpace) {
    return (
      <div className="card-oura p-12 text-center max-w-xl mx-auto my-12">
        <Layers className="w-8 h-8 text-[#838280] mx-auto mb-3" />
        <h3 className="font-serif text-xl text-[#1c1b1a]">No Space Selected</h3>
        <p className="text-xs text-[#838280] mt-1">Select a Space from the sidebar to inspect scoped local memory.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Space Directory Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#e1dcd3]">
        {spaces.map(s => {
          const isSelected = s.id === activeSpace.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSpace(s.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#1c1b1a] text-white shadow-sm font-semibold'
                  : 'bg-white text-[#4a4741] border border-[#e1dcd3] hover:border-[#838280]'
              }`}
            >
              📁 {s.name} <span className="opacity-70 text-[10px]">({s.space_type})</span>
            </button>
          );
        })}
      </div>

      {/* Active Space Detail Card */}
      <div className="card-oura p-6 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2a72de] px-2.5 py-0.5 rounded-full">
                {activeSpace.sensitivity_level}
              </span>
              <span className="text-xs text-[#838280]">
                Space ID: {activeSpace.slug}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-[#1c1b1a] mt-1.5">
              {activeSpace.name} Space
            </h1>
            <p className="text-xs text-[#4a4741] mt-1 font-light max-w-2xl">
              {activeSpace.description || 'Contextual memory space for this department and project.'}
            </p>
          </div>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest into {activeSpace.name}</span>
          </button>
        </div>

        {/* Space Metrics */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[#e1dcd3]">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#838280]">Meetings</span>
            <div className="text-lg font-serif font-light text-[#1c1b1a]">{filteredMeetings.length}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#838280]">Decisions</span>
            <div className="text-lg font-serif font-light text-[#1c1b1a]">{filteredDecisions.length}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#838280]">Tasks</span>
            <div className="text-lg font-serif font-light text-[#1c1b1a]">{filteredTasks.length}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#838280]">Active Blockers</span>
            <div className="text-lg font-serif font-light text-[#e33a22]">{filteredBlockers.length}</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e1dcd3] pb-3">
        <button
          onClick={() => setSubTab('meetings')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            subTab === 'meetings' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#4a4741] hover:text-[#1c1b1a]'
          }`}
        >
          Meetings ({filteredMeetings.length})
        </button>
        <button
          onClick={() => setSubTab('decisions')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            subTab === 'decisions' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#4a4741] hover:text-[#1c1b1a]'
          }`}
        >
          Decisions ({filteredDecisions.length})
        </button>
        <button
          onClick={() => setSubTab('tasks')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            subTab === 'tasks' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#4a4741] hover:text-[#1c1b1a]'
          }`}
        >
          Tasks ({filteredTasks.length})
        </button>
        <button
          onClick={() => setSubTab('blockers')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
            subTab === 'blockers' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#4a4741] hover:text-[#1c1b1a]'
          }`}
        >
          Blockers ({filteredBlockers.length})
        </button>
      </div>

      {/* Sub Tab Contents */}
      {subTab === 'meetings' && (
        <div className="space-y-3.5">
          {filteredMeetings.length === 0 ? (
            <div className="card-oura p-8 text-center text-xs text-[#838280]">
              No meetings ingested in this space yet.
            </div>
          ) : (
            filteredMeetings.map(m => (
              <div key={m.id} className="card-oura p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#838280] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6f5d] bg-emerald-50 px-2 py-0.5 rounded-full">
                      {m.source_type}
                    </span>
                    <span className="text-xs text-[#838280]">
                      {new Date(m.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#838280] pt-1">
                    <span>{m.segment_count} Transcript Segments</span>
                    <span>•</span>
                    <span>{m.decision_count} Decisions</span>
                    <span>•</span>
                    <span>{m.task_count} Tasks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCandidates(m.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-[#1c1b1a] hover:bg-stone-200 transition-all"
                  >
                    Extraction Candidates
                  </button>
                  <button
                    onClick={() => onOpenMeeting(m)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Transcript</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'decisions' && (
        <div className="space-y-3.5">
          {filteredDecisions.map(d => (
            <div key={d.id} className="card-oura p-5 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  d.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
                }`}>
                  {d.status}
                </span>
                <span className="text-xs text-[#838280]">Decided by: {d.decided_by || 'Team'}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#1c1b1a]">{d.statement}</h3>
              {d.rationale && <p className="text-xs text-[#4a4741]">{d.rationale}</p>}
              {d.evidence_items && d.evidence_items.length > 0 && (
                <div className="text-xs italic bg-[#f7f1e8] p-2.5 rounded border border-[#e1dcd3] text-[#4a4741]">
                  &ldquo;{d.evidence_items[0].quote}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {subTab === 'tasks' && (
        <div className="card-oura bg-white divide-y divide-[#e1dcd3]">
          {filteredTasks.map(t => (
            <div key={t.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-[#1c1b1a]">{t.title}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#838280] mt-1">
                  <span>Assignee: {t.assignee_name || 'Unassigned'}</span>
                  <span>•</span>
                  <span>Priority: {t.priority}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-[#4a4741]">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {subTab === 'blockers' && (
        <div className="space-y-3">
          {filteredBlockers.map(b => (
            <div key={b.id} className="card-oura p-4 bg-white border-l-4 border-l-[#e33a22] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#e33a22]">{b.severity} severity</span>
                <span className="text-xs text-[#838280]">{b.status}</span>
              </div>
              <p className="text-xs font-semibold text-[#1c1b1a]">{b.description}</p>
              {b.evidence_quote && (
                <p className="text-[11px] italic text-[#4a4741] bg-[#f7f1e8] p-2 rounded">
                  &ldquo;{b.evidence_quote}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

