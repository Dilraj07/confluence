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
  ArrowRight
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

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Space Switcher Tabs */}
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

      {/* Space Hero Card */}
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
              <span>New Meeting</span>
            </button>
          </div>
        </div>

        {/* Cross-Space Dependency Notice */}
        {isLaunch && (
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-[#e33a22] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a]">
              <strong>Cross-Space Dependency Active:</strong> March 15 Platform Launch is dependent on{' '}
              <span className="font-semibold text-[#2a72de]">Engineering → Backend</span> database schema migration and{' '}
              <span className="font-semibold text-[#af751b]">HR → Recruitment</span> senior engineering capacity.
            </div>
          </div>
        )}

        {isBackend && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex items-start gap-2.5">
            <GitBranch className="w-4 h-4 text-[#af751b] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a]">
              <strong>Downstream Impact Notice:</strong> PostgreSQL table partitioning supersedes single-node caching.
              Affects timeline for <span className="font-semibold text-[#2a72de]">Product → Platform Launch</span>.
            </div>
          </div>
        )}

        {isHR && (
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-[#e33a22] shrink-0 mt-0.5" />
            <div className="text-[#1c1b1a]">
              <strong>Upstream Blocker:</strong> Candidate reneged for Senior Distributed Systems engineer.
              Directly blocks throughput in <span className="font-semibold text-[#2a72de]">Engineering → Backend</span>.
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Decisions in Space */}
          <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-2">
              <span className="text-xs font-semibold text-[#1c1b1a]">Active Decisions in Space</span>
              <span className="text-[11px] text-[#838280]">{spaceDecisions.length} Total</span>
            </div>

            <div className="space-y-3">
              {spaceDecisions.length === 0 ? (
                <div className="text-xs text-[#838280] p-4 text-center">No decisions recorded yet.</div>
              ) : (
                spaceDecisions.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onOpenDecisionTrail(d)}
                    className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        d.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
                      }`}>
                        {d.status}
                      </span>
                      <span className="text-[10px] text-[#838280]">{d.decision_type}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#1c1b1a]">{d.statement}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Commitments & Blockers */}
          <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-2">
              <span className="text-xs font-semibold text-[#1c1b1a]">Active Commitments & Blockers</span>
              <span className="text-[11px] text-[#838280]">{spaceTasks.length} Tasks</span>
            </div>

            <div className="space-y-3">
              {spaceBlockers.map((b) => (
                <div key={b.id} className="p-3 bg-red-50/60 rounded-lg border border-red-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-[#e33a22]">{b.severity} severity</span>
                    <span className="text-[10px] text-[#838280]">Blocker</span>
                  </div>
                  <div className="font-semibold text-[#1c1b1a]">{b.description}</div>
                </div>
              ))}

              {spaceTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#1c1b1a]">{t.title}</div>
                    <div className="text-[11px] text-[#838280]">Assignee: {t.assignee_name || 'Unassigned'}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-[#4a4741]">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Meetings */}
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
                    <span>View Transcript</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Decisions */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {spaceDecisions.map((d) => (
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
          ))}
        </div>
      )}

      {/* Tab 4: Tasks */}
      {activeTab === 'tasks' && (
        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3]">
          {spaceTasks.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <h5 className="text-xs font-semibold text-[#1c1b1a]">{t.title}</h5>
                <div className="text-[11px] text-[#838280] flex items-center gap-2 mt-0.5">
                  <span>Assignee: {t.assignee_name || 'Unassigned'}</span>
                  <span>&bull;</span>
                  <span>Priority: {t.priority}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-[#4a4741]">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Documents & Context */}
      {activeTab === 'documents' && (
        <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4">
          <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">Space Documentation & Context Pack</h4>
          <p className="text-xs text-[#7b776f]">
            Verified context specifications defining architecture, API schemas, and operating procedures for this Space.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs">
              <span className="font-semibold text-[#1c1b1a] block">Core Schema & Storage</span>
              <p className="text-[11px] text-[#838280] mt-0.5">PostgreSQL multi-tenant tables partitioned by organization ID.</p>
            </div>
            <div className="p-3.5 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs">
              <span className="font-semibold text-[#1c1b1a] block">Team Working Agreement</span>
              <p className="text-[11px] text-[#838280] mt-0.5">Decisions require human review before altering canonical memory.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Activity */}
      {activeTab === 'activity' && (
        <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4">
          <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">Space Audit Log & Lineage</h4>
          <div className="space-y-3">
            <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#1c1b1a]">Approved Decision: PostgreSQL Partitioning</span>
                <p className="text-[11px] text-[#838280]">Elena Rostova approved initial extracted record citing transcript segment.</p>
              </div>
              <span className="text-[10px] text-[#838280]">Audited</span>
            </div>
            <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#af751b]">Superseded Decision: Single-node Redis Cache</span>
                <p className="text-[11px] text-[#838280]">Marked superseded; historical version preserved permanently.</p>
              </div>
              <span className="text-[10px] text-[#af751b]">Superseded</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

