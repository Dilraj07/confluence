'use client';

import React, { useState } from 'react';
import { Decision, Meeting } from '@/types';
import { getCanonicalDecision, DecisionIntelligenceRecord } from '@/lib/decisionIntelligence';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  User,
  Quote,
  Flame,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  History,
  Target,
  FileText,
  Compass,
  ArrowRight,
  X
} from 'lucide-react';

interface DecisionDetailViewProps {
  decisionId: string;
  onBack: () => void;
  onOpenMeeting: (meetingId: string) => void;
  onNavigateToView?: (view: string) => void;
}

export const DecisionDetailView: React.FC<DecisionDetailViewProps> = ({
  decisionId,
  onBack,
  onOpenMeeting,
  onNavigateToView
}) => {
  const decision: DecisionIntelligenceRecord = getCanonicalDecision(decisionId);

  // Quick Action Modal states
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'revision' | 'followup' | 'contradiction' | null;
    title: string;
  }>({ isOpen: false, type: null, title: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTriggerAction = (type: 'revision' | 'followup' | 'contradiction', title: string) => {
    setActionModal({ isOpen: true, type, title });
  };

  const handleConfirmAction = () => {
    const label = actionModal.title;
    setActionModal({ isOpen: false, type: null, title: '' });
    setToastMessage(`${label} successfully submitted to review queue.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* 1. Back Navigation & Quick Actions */}
      <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#838280] hover:text-[#1c1b1a] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Decisions</span>
        </button>

        <div className="flex items-center gap-2">
          {onNavigateToView && (
            <button
              onClick={() => onNavigateToView('decisions')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1dcd3] bg-white text-xs font-semibold hover:border-[#1c1b1a] transition-all shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-[#2a72de]" />
              <span>Full Decision Timeline</span>
            </button>
          )}
          <button
            onClick={() => handleTriggerAction('revision', 'Propose Decision Revision')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1b1a] text-white text-xs font-semibold hover:bg-[#39221e] transition-all shadow-xs"
          >
            <span>Propose Revision</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Canonical Decision Record (Answers the 9 Questions) */}
      <div className="card-oura p-7 bg-white border border-[#e1dcd3] space-y-7 shadow-xs">
        {/* Header Block: Identity, Status, Owners */}
        <div className="border-b border-[#f0ece4] pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-[#1c1b1a] bg-stone-100 px-2.5 py-0.5 rounded">
              {decision.code} · MERIDIANPAY
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#af751b] border border-amber-200">
              {decision.statusLabel}
            </span>
            <span className="text-xs text-[#838280]">
              {decision.decisionType}
            </span>
          </div>

          <h2 className="font-serif text-3xl font-normal text-[#1c1b1a]">
            {decision.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#7b776f]">
            <div>
              Space: <strong className="text-[#1c1b1a]">{decision.space}</strong>
            </div>
            <div>&bull;</div>
            <div>
              Proposed by: <strong className="text-[#1c1b1a]">{decision.owner}</strong> ({decision.ownerRole})
            </div>
            <div>&bull;</div>
            <div>
              Current status: <strong className="text-[#af751b] uppercase">{decision.statusLabel}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: What was decided? */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#838280] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>1. What was decided?</span>
          </h3>
          <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e1dcd3] text-sm text-[#1c1b1a] leading-relaxed">
            {decision.summary}
          </div>
        </div>

        {/* Section 2: Origin & Originating Meeting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[#e1dcd3] space-y-1 text-xs">
            <span className="text-[#838280] text-[10px] uppercase font-semibold block">
              2. Originating Forum &amp; Date
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#1c1b1a]">{decision.originMeeting}</span>
              <button
                onClick={() => decision.originMeetingId && onOpenMeeting(decision.originMeetingId)}
                className="text-[#2a72de] font-semibold hover:underline flex items-center gap-1 text-xs"
              >
                <span>Open Meeting</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[#838280] pt-1">
              Conducted on {decision.originDate} &bull; First proposed by {decision.owner}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[#e1dcd3] space-y-1 text-xs">
            <span className="text-[#838280] text-[10px] uppercase font-semibold block">
              3. Approving Body &amp; Audit Status
            </span>
            <div className="font-semibold text-sm text-[#1c1b1a]">Architecture Review Board</div>
            <p className="text-[#838280] pt-1">
              Confirmed on {decision.originDate} &bull; Revised on {decision.lastRevisedDate}
            </p>
          </div>
        </div>

        {/* Section 3: Why was this decision made? (Supporting Evidence) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#838280] flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>4. What problem and evidence led to it?</span>
          </h3>
          <p className="text-xs text-[#4a4741] leading-relaxed">
            {decision.problemRationale}
          </p>

          {/* Evidence Card */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2a72de]">
                Verified Supporting Evidence · Segment {decision.evidence.segmentId}
              </span>
              <button
                onClick={() => decision.originMeetingId && onOpenMeeting(decision.originMeetingId)}
                className="text-[11px] font-semibold text-[#2a72de] hover:underline flex items-center gap-1"
              >
                <span>Jump to turn in transcript</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <blockquote className="text-xs text-[#1c1b1a] italic leading-relaxed pl-3 border-l-2 border-[#2a72de]">
              &ldquo;{decision.evidence.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 text-[11px] text-[#838280] pt-1">
              <span><strong>{decision.evidence.speaker}</strong> ({decision.evidence.speakerRole})</span>
              <span>&bull;</span>
              <span>{decision.evidence.meetingName}</span>
              <span>&bull;</span>
              <span>{decision.evidence.meetingDate} · {decision.evidence.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Section 4: How did it change over time? (Decision History) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#838280] flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#af751b]" />
            <span>5. How did it evolve over time? (Version History)</span>
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e1dcd3]">
            {decision.history.map((h) => (
              <div key={h.step} className="relative space-y-1 text-xs">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#2a72de]" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1c1b1a]">{h.date} &bull; {h.phase}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded border ${h.statusBadgeColor}`}>
                    {h.statusBadge}
                  </span>
                  <span className="text-[11px] text-[#838280]">({h.meeting})</span>
                </div>
                <div className="font-medium text-[#1c1b1a]">{h.title}</div>
                <p className="text-[#7b776f] font-light leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Dependencies & Downstream Work */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#838280] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#e33a22]" />
            <span>6. What dependencies, tasks, and teams are affected?</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {decision.dependencies.map((dep, idx) => (
              <div key={idx} className="p-3.5 bg-[#fbfaf7] rounded-xl border border-[#e1dcd3] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-stone-100 text-[#1c1b1a]">
                    {dep.type}
                  </span>
                  <span className="text-[11px] text-[#838280]">Team: <strong>{dep.team}</strong></span>
                </div>
                <div className="font-semibold text-[#1c1b1a]">{dep.target}</div>
                <p className="text-[#7b776f] leading-relaxed">{dep.relationshipReason}</p>
              </div>
            ))}
          </div>

          {/* Downstream Milestone Impact Banner */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 flex items-start justify-between gap-3 text-xs mt-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1c1b1a]">{decision.downstreamMilestone.name}</span>
                <span className="text-[10px] font-bold uppercase bg-red-100 text-[#e33a22] px-2 py-0.2 rounded">
                  {decision.downstreamMilestone.status}
                </span>
              </div>
              <p className="text-[#4a4741]">
                {decision.downstreamMilestone.description}
              </p>
            </div>
            {onNavigateToView && (
              <button
                onClick={() => onNavigateToView('decisions')}
                className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-900 font-semibold hover:bg-red-100 transition-all shrink-0 shadow-xs"
              >
                Inspect Lineage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-oura bg-white border border-[#e1dcd3] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  {actionModal.title}
                </h3>
              </div>
              <button onClick={() => setActionModal({ isOpen: false, type: null, title: '' })}>
                <X className="w-4 h-4 text-[#838280]" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#7b776f]">
                Target decision: <strong>{decision.code} · {decision.shortTitle}</strong>
              </p>
              <div>
                <label className="font-semibold text-[#1c1b1a] block mb-1">Proposed Change or Comment:</label>
                <textarea
                  rows={3}
                  defaultValue="Extend key retention policy to 72 hours based on delayed processor webhooks."
                  className="w-full p-2.5 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a]"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, title: '' })}
                className="px-3.5 py-1.5 rounded-lg border border-[#e1dcd3] text-[#4a4741]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-1.5 rounded-lg bg-[#1c1b1a] text-white font-semibold"
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
