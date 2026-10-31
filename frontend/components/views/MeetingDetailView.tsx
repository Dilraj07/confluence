'use client';

import React, { useState, useEffect } from 'react';
import { Meeting, Decision, Task, Blocker, TranscriptSegment } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  User,
  GitBranch,
  CheckSquare,
  AlertTriangle,
  Quote,
  Flame,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  FileText
} from 'lucide-react';

interface MeetingDetailViewProps {
  meetingId: string;
  onBack: () => void;
  onOpenDecision?: (decisionId: string) => void;
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenCandidates: (meetingId: string) => void;
  onOpenConnectedMeeting: (connectedMeetingId: string) => void;
  onAskAboutMeeting: (meetingTitle: string) => void;
}

export const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({
  meetingId,
  onBack,
  onOpenDecision,
  onOpenDecisionTrail,
  onOpenCandidates,
  onOpenConnectedMeeting,
  onAskAboutMeeting
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'decisions' | 'tasks' | 'connections'>('overview');
  const [transcriptFilter, setTranscriptFilter] = useState('');

  const fetchMeeting = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/meetings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMeeting(data);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) {
      fetchMeeting(meetingId);
    }
  }, [meetingId]);

  if (loading || !meeting) {
    return (
      <div className="max-w-4xl mx-auto my-24 card-oura p-10 text-center bg-white border border-[#e1dcd3]">
        <span className="inline-block w-6 h-6 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="font-serif text-xl text-[#1c1b1a]">Retrieving Meeting Intelligence</h3>
        <p className="text-xs text-[#838280] mt-1 font-light">Loading speech turns, canonical decisions, and meeting lineage...</p>
      </div>
    );
  }

  // Derive speakers
  const speakers = Array.from(new Set(meeting.segments?.map(s => s.speaker_name).filter(Boolean)));

  // Filter segments
  const filteredSegments = (meeting.segments || []).filter(s => {
    if (!transcriptFilter) return true;
    const q = transcriptFilter.toLowerCase();
    return s.content.toLowerCase().includes(q) || (s.speaker_name && s.speaker_name.toLowerCase().includes(q));
  });

  const formatTime = (ms?: number) => {
    if (!ms) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4a4741] hover:text-[#1c1b1a] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Meetings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAboutMeeting(`What were the main conclusions and blockers in "${meeting.title}"?`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>Ask AI About This Meet</span>
          </button>

          <button
            onClick={() => onOpenCandidates(meeting.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-[#1c1b1a] transition-all"
          >
            Candidate Review
          </button>
        </div>
      </div>

      {/* Meeting Profile Card */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded">
                📁 {meeting.primary_space_name} Space
              </span>
              <span className="text-[10px] font-semibold text-[#5c6f5d] bg-emerald-50 px-2 py-0.5 rounded uppercase">
                {meeting.source_type}
              </span>
              <span className="text-xs text-[#838280]">
                Meeting Date: <strong>{new Date(meeting.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </span>
            </div>

            <h1 className="font-serif text-3xl font-normal text-[#1c1b1a]">
              {meeting.title}
            </h1>

            {/* Linked spaces */}
            {meeting.spaces && meeting.spaces.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-[#838280] pt-1">
                <span>Linked Secondary Spaces:</span>
                {meeting.spaces.filter(s => s.relationship_type === 'linked').map(ls => (
                  <span key={ls.space_id} className="font-semibold text-[#1c1b1a] bg-[#fbfaf7] px-2 py-0.5 rounded border border-[#e1dcd3]">
                    {ls.space_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Speakers Pill Row */}
          <div className="self-start md:self-auto p-3 bg-[#fbfaf7] rounded-xl border border-[#e1dcd3] space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#838280] block">
              Meeting Participants ({speakers.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {speakers.map((spk, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#e1dcd3] text-[11px] font-medium text-[#1c1b1a]">
                  <User className="w-3 h-3 text-[#838280]" />
                  <span>{spk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting Navigation Tabs */}
        <div className="flex items-center gap-1 pt-3 border-t border-[#e1dcd3] overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Summary & Outcomes' },
            { id: 'transcript', label: `Discussions & Speech Turns (${meeting.segments?.length || 0})` },
            { id: 'decisions', label: `Conclusions & Decisions (${meeting.decisions?.length || 0})` },
            { id: 'tasks', label: `Tasks & Commitments (${meeting.tasks?.length || 0})` },
            { id: 'connections', label: `Connection to Other Meetings (${meeting.connected_meetings?.length || 0})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
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

      {/* Tab 1: Summary & Outcomes */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-oura p-4 bg-white border border-[#e1dcd3]">
              <span className="text-[10px] uppercase font-bold text-[#838280] block">Decisions Approved</span>
              <div className="font-serif text-3xl font-light text-[#1c1b1a] mt-1">{meeting.decisions?.length || 0}</div>
              <span className="text-[11px] text-[#2a72de]">Anchored to transcript</span>
            </div>
            <div className="card-oura p-4 bg-white border border-[#e1dcd3]">
              <span className="text-[10px] uppercase font-bold text-[#838280] block">Commitments Created</span>
              <div className="font-serif text-3xl font-light text-[#5c6f5d] mt-1">{meeting.tasks?.length || 0}</div>
              <span className="text-[11px] text-[#5c6f5d]">Assigned to owners</span>
            </div>
            <div className="card-oura p-4 bg-white border border-[#e1dcd3]">
              <span className="text-[10px] uppercase font-bold text-[#838280] block">Cross-Meeting Links</span>
              <div className="font-serif text-3xl font-light text-[#af751b] mt-1">{meeting.connected_meetings?.length || 0}</div>
              <span className="text-[11px] text-[#af751b]">Supersessions & blockers</span>
            </div>
          </div>

          {/* Key Decisions Highlight */}
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-2">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">Core Decisions Made in This Meeting</h3>
              </div>
              <button onClick={() => setActiveTab('decisions')} className="text-xs text-[#2a72de] hover:underline font-medium">
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {(meeting.decisions || []).map(d => (
                <div
                  key={d.id}
                  onClick={() => {
                    if (onOpenDecision) onOpenDecision(d.id);
                    else onOpenDecisionTrail(d);
                  }}
                  className="p-3.5 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded">
                      {d.status} &bull; {d.impact_level} impact
                    </span>
                    <span className="text-[11px] text-[#838280]">Decided by: {d.decided_by || 'Team'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#1c1b1a]">{d.statement}</h4>
                  {d.rationale && <p className="text-xs text-[#4a4741] font-light">{d.rationale}</p>}
                  <div className="text-[10px] text-[#2a72de] font-semibold pt-1">
                    Inspect canonical decision detail &rarr;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Commitments Highlight */}
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#5c6f5d]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">Action Items & Commitments Created</h3>
              </div>
              <button onClick={() => setActiveTab('tasks')} className="text-xs text-[#2a72de] hover:underline font-medium">
                View all &rarr;
              </button>
            </div>

            <div className="divide-y divide-[#e1dcd3]">
              {(meeting.tasks || []).map(t => (
                <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1c1b1a]">{t.title}</span>
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

      {/* Tab 2: What Discussions Happened (Transcript) */}
      {activeTab === 'transcript' && (
        <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e1dcd3] pb-3">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#1c1b1a]">Discussions & Turn-by-Turn Transcript</h3>
              <p className="text-xs text-[#7b776f] font-light">
                Verbatim record of speech turns, timestamps, and speaker roles.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={transcriptFilter}
                onChange={e => setTranscriptFilter(e.target.value)}
                placeholder="Search transcript..."
                className="text-xs p-2 pl-8 pr-3 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
              />
              <Search className="w-3.5 h-3.5 text-[#838280] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredSegments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#838280]">No discussion turns matching search.</div>
            ) : (
              filteredSegments.map(seg => (
                <div
                  key={seg.id}
                  className="p-3.5 bg-[#fbfaf7] rounded-xl border border-[#e1dcd3] space-y-1.5 hover:bg-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center text-[10px] font-semibold">
                        {(seg.speaker_name || 'U')[0]}
                      </span>
                      <span className="text-xs font-semibold text-[#1c1b1a]">
                        {seg.speaker_name || 'Speaker'}
                      </span>
                      {seg.speaker_role && (
                        <span className="text-[10px] text-[#838280] bg-stone-100 px-2 py-0.2 rounded">
                          {seg.speaker_role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#838280]">
                      [{formatTime(seg.start_ms)}]
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4741] leading-relaxed pl-8 font-light">
                    {seg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Conclusions & Decisions */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          {(meeting.decisions && meeting.decisions.length > 0) ? (
            meeting.decisions.map(d => (
              <div
                key={d.id}
                onClick={() => {
                  if (onOpenDecision) onOpenDecision(d.id);
                  else onOpenDecisionTrail(d);
                }}
                className="card-oura p-6 bg-white border border-[#e1dcd3] hover:border-[#2a72de] cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    d.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
                  }`}>
                    {d.status} &bull; {d.impact_level} impact
                  </span>
                  <span className="text-xs text-[#838280]">Decided by: <strong>{d.decided_by || 'Team'}</strong></span>
                </div>

                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  {d.statement}
                </h3>

                {d.rationale && (
                  <p className="text-xs text-[#4a4741] font-light">
                    <strong>Rationale:</strong> {d.rationale}
                  </p>
                )}

                {/* Evidence Quote */}
                {d.evidence_items && d.evidence_items.length > 0 && (
                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                    <div>
                      <p className="italic text-[#4a4741]">&ldquo;{d.evidence_items[0].quote}&rdquo;</p>
                      <span className="text-[10px] text-[#838280] block mt-0.5">
                        Speaker: {d.evidence_items[0].speaker_name}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#2a72de] font-semibold pt-1">
                  <span>Inspect complete supersession lineage &rarr;</span>
                  {d.versions && d.versions.length > 1 && (
                    <span className="text-[11px] text-[#af751b]">v{d.versions.length} (Supersedes prior baseline)</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card-oura p-12 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
              No canonical decisions finalized in this meeting.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tasks & Commitments */}
      {activeTab === 'tasks' && (
        <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3] shadow-xs">
          {(meeting.tasks && meeting.tasks.length > 0) ? (
            meeting.tasks.map(t => (
              <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                      t.priority === 'urgent' ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                    }`}>
                      {t.priority} Priority
                    </span>
                    <span className="text-[11px] text-[#838280]">Space: {t.space_name}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#1c1b1a]">{t.title}</h4>
                  {t.description && <p className="text-xs text-[#7b776f] font-light">{t.description}</p>}
                  {t.evidence_quote && (
                    <div className="text-[11px] italic bg-[#fbfaf7] p-2 rounded border border-[#e1dcd3] text-[#4a4741] mt-1">
                      &ldquo;{t.evidence_quote}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-[#4a4741]">
                    {t.status}
                  </span>
                  <div className="text-right text-[11px] text-[#838280]">
                    <div>Assignee: <strong>{t.assignee_name || 'Unassigned'}</strong></div>
                    {t.due_date && <div>Due {new Date(t.due_date).toLocaleDateString()}</div>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-[#838280]">
              No commitments or tasks originated in this meeting.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Connection to Other Meetings & Prior History */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-2">
            <h3 className="font-serif text-xl font-normal text-[#1c1b1a]">Cross-Meeting Lineage & Connections</h3>
            <p className="text-xs text-[#7b776f] font-light">
              CONFLUENCE automatically identifies prior meetings superseded, cross-team blockers, and downstream affected meetings.
            </p>
          </div>

          {(meeting.connected_meetings && meeting.connected_meetings.length > 0) ? (
            meeting.connected_meetings.map((conn, idx) => (
              <div
                key={idx}
                onClick={() => onOpenConnectedMeeting(conn.meeting_id)}
                className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      conn.connection_type === 'supersedes'
                        ? 'bg-amber-100 text-[#af751b]'
                        : conn.connection_type === 'blocks' || conn.connection_type === 'blocked_by'
                        ? 'bg-red-50 text-[#e33a22]'
                        : 'bg-blue-50 text-[#2a72de]'
                    }`}>
                      {conn.connection_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#838280]">
                      Space: <strong>{conn.space_name}</strong> &bull; {new Date(conn.meeting_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-normal text-[#1c1b1a]">
                    {conn.title}
                  </h4>

                  <p className="text-xs text-[#4a4741] font-light pt-0.5">
                    {conn.reason}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2a72de] shrink-0">
                  <span>Open Meeting &rarr;</span>
                </div>
              </div>
            ))
          ) : (
            <div className="card-oura p-12 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
              No cross-meeting relationships recorded for this meeting.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

