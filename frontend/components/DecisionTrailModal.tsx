'use client';

import React from 'react';
import { Decision } from '@/types';
import { X, GitBranch, ArrowRight, Quote, CheckCircle2, History } from 'lucide-react';

interface DecisionTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: Decision | null;
  allDecisions: Decision[];
}

export const DecisionTrailModal: React.FC<DecisionTrailModalProps> = ({
  isOpen,
  onClose,
  decision,
  allDecisions
}) => {
  if (!isOpen || !decision) return null;

  // Find superseded decision if any
  const supersededDecision = decision.supersedes_id
    ? allDecisions.find(d => d.id === decision.supersedes_id)
    : null;

  // Find decision that supersedes this if any
  const supersedingDecision = decision.superseded_by_id
    ? allDecisions.find(d => d.id === decision.superseded_by_id)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#af751b]" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#af751b]">
                Decision Lineage & History
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
                Decision Audit Trail
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#838280] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Current Selected Decision */}
          <div className="card-oura p-5 bg-[#ffffff] border-2 border-[#2a72de]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                decision.status === 'active' ? 'bg-blue-50 text-[#2a72de]' : 'bg-amber-100 text-[#af751b]'
              }`}>
                {decision.status}
              </span>
              <span className="text-xs text-[#838280]">
                Space: {decision.space_name}
              </span>
            </div>

            <h3 className="text-base font-semibold text-[#1c1b1a]">
              {decision.statement}
            </h3>

            {decision.rationale && (
              <p className="text-xs text-[#4a4741]">{decision.rationale}</p>
            )}

            {decision.evidence_items && decision.evidence_items.length > 0 && (
              <div className="text-xs italic bg-[#f7f1e8] p-3 rounded-lg border border-[#e1dcd3] text-[#4a4741] flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                <div>
                  <p>&ldquo;{decision.evidence_items[0].quote}&rdquo;</p>
                  <span className="not-italic text-[10px] text-[#838280] block mt-1">
                    Cites: {decision.meeting_title || 'Meeting'} &bull; Speaker: {decision.evidence_items[0].speaker_name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Supersession Chain */}
          {supersededDecision && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#af751b]">
                <History className="w-4 h-4" />
                <span>Supersedes Historical Decision:</span>
              </div>

              <div className="card-oura p-5 bg-[#fbf8f4] border border-[#e1dcd3] space-y-2.5 opacity-85">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-[#af751b] px-2 py-0.5 rounded-full">
                    superseded
                  </span>
                  <span className="text-xs text-[#838280]">
                    Prior Baseline
                  </span>
                </div>

                <h4 className="text-sm font-medium text-[#1c1b1a] line-through">
                  {supersededDecision.statement}
                </h4>

                {supersededDecision.evidence_items && supersededDecision.evidence_items.length > 0 && (
                  <div className="text-xs italic bg-white p-2.5 rounded border border-[#e1dcd3] text-[#4a4741]">
                    &ldquo;{supersededDecision.evidence_items[0].quote}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Version History Table */}
          {decision.versions && decision.versions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1c1b1a] block">
                Version History (Append-Only):
              </span>
              <div className="card-oura bg-white divide-y divide-[#e1dcd3] text-xs">
                {decision.versions.map(v => (
                  <div key={v.id} className="p-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-[#af751b]">v{v.version_number} &bull; {v.status}</span>
                      <p className="text-[#4a4741] mt-0.5">{v.change_reason || v.statement}</p>
                    </div>
                    <span className="text-[11px] text-[#838280] shrink-0">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-[11px] text-[#838280]">
          <span>Decisions are immutable; changes create new audited records connected by relationships.</span>
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
