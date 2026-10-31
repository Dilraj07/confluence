'use client';

import React, { useState, useEffect } from 'react';
import { Meeting, TranscriptSegment } from '@/types';
import { X, Calendar, User, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface MeetingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  onClose,
  meeting
}) => {
  const [meetingDetail, setMeetingDetail] = useState<Meeting | null>(meeting);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && meeting) {
      setMeetingDetail(meeting);
      // Fetch full meeting details including segments
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/meetings/${meeting.id}`)
        .then(res => res.json())
        .then(data => setMeetingDetail(data))
        .catch(() => {});
    }
  }, [isOpen, meeting]);

  if (!isOpen || !meetingDetail) return null;

  const formatTime = (ms?: number) => {
    if (!ms) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded-full">
                {meetingDetail.source_type}
              </span>
              <span className="text-xs text-[#838280]">
                Space: {meetingDetail.primary_space_name}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a] mt-1">
              {meetingDetail.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#838280] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Turn-by-Turn Segments */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {meetingDetail.segments && meetingDetail.segments.length > 0 ? (
            meetingDetail.segments.map((seg, idx) => (
              <div
                key={seg.id || idx}
                className="p-3.5 bg-[#fbf8f4] rounded-xl border border-[#e1dcd3] space-y-1.5 hover:bg-white transition-all"
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
                      <span className="text-[10px] text-[#838280] bg-stone-100 px-2 py-0.5 rounded-full">
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
          ) : (
            <div className="p-8 text-center text-xs text-[#838280]">
              No segments available.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-[11px] text-[#838280]">
          <span>Segments are assigned immutable IDs used for evidence citations.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-stone-200 text-[#1c1b1a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

