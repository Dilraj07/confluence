'use client';

import React, { useState } from 'react';
import { Space } from '@/types';
import { X, Upload, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface IngestMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: Space[];
  selectedSpaceId: string | null;
  onIngestSuccess: (meetingId: string) => void;
}

const SAMPLE_TRANSCRIPT = `[00:00:30] Elena Rostova (Staff Backend Architect): Let's make a final call on the query cache architecture.
[00:01:45] Alex Rivera (Engineering Lead): We agreed we will deprecate the standalone Redis cluster and migrate entirely to native PostgreSQL read replicas with table partitioning.
[00:03:10] Elena Rostova (Staff Backend Architect): That formally supersedes our Q3 Redis caching setup. I will prepare the read replica failover test plan by next Tuesday.
[00:04:20] Alex Rivera (Engineering Lead): We are blocked on AWS staging IAM permissions from the infrastructure security squad.`;

export const IngestMeetingModal: React.FC<IngestMeetingModalProps> = ({
  isOpen,
  onClose,
  spaces,
  selectedSpaceId,
  onIngestSuccess
}) => {
  const [title, setTitle] = useState('');
  const [primarySpaceId, setPrimarySpaceId] = useState(selectedSpaceId || spaces[0]?.id || '');
  const [transcriptText, setTranscriptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreFill = () => {
    setTitle('Read Replica Architecture & Cache Deprecation');
    setTranscriptText(SAMPLE_TRANSCRIPT);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !transcriptText.trim() || !primarySpaceId) {
      setError('Please provide a title, primary Space, and transcript content.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          primary_space_id: primarySpaceId,
          source_type: 'paste',
          transcript_text: transcriptText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to ingest meeting');
      }

      const meeting = await res.json();
      setIsSubmitting(false);
      onIngestSuccess(meeting.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during ingestion.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2a72de]">
              Ingestion Pipeline
            </span>
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
              Ingest Meeting Transcript
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#838280] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 text-[#e33a22] rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1c1b1a] mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Storage & Read Replica Review"
              className="w-full text-xs p-2.5 rounded-lg border border-[#e1dcd3] focus:outline-none focus:ring-1 focus:ring-[#2a72de] bg-[#f7f1e8]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1c1b1a] mb-1">
              Primary Space Scope
            </label>
            <select
              value={primarySpaceId}
              onChange={(e) => setPrimarySpaceId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#e1dcd3] focus:outline-none focus:ring-1 focus:ring-[#2a72de] bg-white cursor-pointer"
            >
              {spaces.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.space_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#1c1b1a]">
                Transcript Content
              </label>
              <button
                type="button"
                onClick={handlePreFill}
                className="text-[11px] text-[#2a72de] hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" /> Pre-fill Sample Script
              </button>
            </div>
            <textarea
              rows={6}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste meeting transcript here with [MM:SS] timestamps or Speaker: speech turns..."
              className="w-full text-xs p-3 rounded-lg border border-[#e1dcd3] focus:outline-none focus:ring-1 focus:ring-[#2a72de] bg-[#f7f1e8]/20 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e1dcd3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#4a4741] hover:bg-stone-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest & Extract Records</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
