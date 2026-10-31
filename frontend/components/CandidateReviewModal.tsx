'use client';

import React, { useState, useEffect } from 'react';
import { ExtractionCandidate } from '@/types';
import { X, Check, Trash2, Quote, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface CandidateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  onApproved: () => void;
}

export const CandidateReviewModal: React.FC<CandidateReviewModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  onApproved
}) => {
  const [candidates, setCandidates] = useState<ExtractionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/meetings/${meetingId}/candidates`);
      const data = await res.json();
      setCandidates(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && meetingId) {
      fetchCandidates();
    }
  }, [isOpen, meetingId]);

  if (!isOpen) return null;

  const handleAction = async (candidateId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoadingId(candidateId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/meetings/${meetingId}/candidates/${candidateId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
        onApproved();
      }
      setActionLoadingId(null);
    } catch {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2a72de]" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2a72de]">
                Human-in-the-Loop Review
              </span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
              Extraction Candidates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#838280] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#838280]">
              <span className="inline-block w-4 h-4 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading candidate proposals...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="card-oura p-8 text-center text-xs text-[#838280] bg-[#f7f1e8]/30">
              <Check className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              <p className="font-semibold text-[#1c1b1a]">All items reviewed</p>
              <p className="text-[11px] mt-0.5">Approved items are persisted in the canonical database.</p>
            </div>
          ) : (
            candidates.map(candidate => {
              const p = candidate.payload;
              return (
                <div
                  key={candidate.id}
                  className="card-oura p-5 bg-[#fbf8f4] border border-[#e1dcd3] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#2a72de]">
                      Proposed {candidate.candidate_type}
                    </span>
                    <span className="text-xs text-[#838280]">
                      Confidence: {Math.round(candidate.confidence_score * 100)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#1c1b1a]">
                      {p.statement || p.title || p.description}
                    </h3>
                    {p.rationale && (
                      <p className="text-xs text-[#4a4741] mt-1">{p.rationale}</p>
                    )}
                  </div>

                  {/* Evidence Quote */}
                  {p.evidence_quote && (
                    <div className="text-xs italic text-[#4a4741] bg-white p-2.5 rounded border border-[#e1dcd3] flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                      <span>&ldquo;{p.evidence_quote}&rdquo;</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e1dcd3]">
                    <button
                      onClick={() => handleAction(candidate.id, 'reject')}
                      disabled={actionLoadingId === candidate.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#e33a22] hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleAction(candidate.id, 'approve')}
                      disabled={actionLoadingId === candidate.id}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve & Persist</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-[11px] text-[#838280]">
          <span>Human review is required before modifying organizational memory state.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-stone-200 text-[#1c1b1a]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
