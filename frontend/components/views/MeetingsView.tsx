'use client';

import React, { useState } from 'react';
import { Meeting, Space } from '@/types';
import {
  Calendar,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Filter,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MeetingsViewProps {
  meetings: Meeting[];
  spaces: Space[];
  selectedSpaceId: string | null;
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenCandidates: (meetingId: string) => void;
  onOpenIngest: () => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  spaces,
  selectedSpaceId,
  onOpenMeeting,
  onOpenCandidates,
  onOpenIngest
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMeetings = meetings.filter((m) => {
    if (selectedSpaceId && m.primary_space_id !== selectedSpaceId) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.primary_space_name && m.primary_space_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
            Meeting Repository & Transcripts
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Immutable turn-by-turn speech turns with stable segment IDs used for evidence citations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meetings..."
              className="text-xs p-2 pl-8 pr-3 rounded-lg border border-[#e1dcd3] bg-white focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            />
            <Search className="w-3.5 h-3.5 text-[#838280] absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="card-oura p-12 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
            No meetings found matching your filter criteria.
          </div>
        ) : (
          filteredMeetings.map((m) => (
            <div
              key={m.id}
              className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#838280] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
                    📁 {m.primary_space_name || 'Space'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#5c6f5d] bg-emerald-50 px-2 py-0.5 rounded">
                    {m.source_type}
                  </span>
                  <span className="text-xs text-[#838280]">
                    {new Date(m.meeting_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  {m.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#838280] pt-0.5">
                  <span>{m.segment_count} Transcript Segments</span>
                  <span>&bull;</span>
                  <span>{m.decision_count} Decisions Extracted</span>
                  <span>&bull;</span>
                  <span>{m.task_count} Action Items</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCandidates(m.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-[#1c1b1a] hover:bg-stone-200 transition-all"
                >
                  Candidate Review
                </button>
                <button
                  onClick={() => onOpenMeeting(m)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Transcript</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
