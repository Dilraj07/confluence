'use client';

import React, { useState } from 'react';
import { Space, AskQueryResponse } from '@/types';
import {
  X,
  Sparkles,
  Send,
  Quote,
  ShieldCheck,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface AskConfluenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: Space[];
  selectedSpaceId: string | null;
  initialQuery?: string;
}

export const AskConfluenceModal: React.FC<AskConfluenceModalProps> = ({
  isOpen,
  onClose,
  spaces,
  selectedSpaceId,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [scope, setScope] = useState<'local' | 'shared' | 'organization'>('organization');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (promptToAsk?: string) => {
    const q = promptToAsk || query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/query/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          space_id: selectedSpaceId,
          scope,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve intelligence');
      }

      const data = await res.json();
      setResponse(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during query execution.');
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What is putting the Platform Launch at risk?',
    'Why was the single-node architecture decision superseded?',
    'What active blockers exist across HR and Engineering?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1b1a] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#2a72de]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#838280]">
                Organisational Memory Search
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
                Ask CONFLUENCE
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

        {/* Query Input & Scope Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#838280]">Search Scope:</span>
            <div className="flex items-center gap-1 bg-[#ececec] p-1 rounded-full text-xs">
              <button
                type="button"
                onClick={() => setScope('local')}
                className={`px-3 py-1 rounded-full ${scope === 'local' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
              >
                Local Space
              </button>
              <button
                type="button"
                onClick={() => setScope('shared')}
                className={`px-3 py-1 rounded-full ${scope === 'shared' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
              >
                Shared
              </button>
              <button
                type="button"
                onClick={() => setScope('organization')}
                className={`px-3 py-1 rounded-full ${scope === 'organization' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
              >
                🌐 Full Organisation
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything about decisions, blockers, commitments, or dependencies..."
              className="w-full text-sm p-3.5 pr-12 rounded-full border border-[#e1dcd3] focus:outline-none focus:ring-2 focus:ring-[#2a72de] bg-[#f7f1e8]/30 shadow-inner"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-2 rounded-full bg-[#2a72de] text-white hover:bg-[#205bb5] disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-[#838280]">
            <span className="shrink-0 font-medium">Try asking:</span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                  handleAsk(q);
                }}
                className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading && (
            <div className="card-oura p-8 text-center text-xs text-[#838280] bg-[#f7f1e8]/40">
              <span className="inline-block w-5 h-5 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-medium text-[#1c1b1a]">Searching organizational memory across permitted Spaces...</p>
              <p className="text-[11px] mt-1 text-[#838280]">Evaluating decision lineage, commitments, and transcript citations</p>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs bg-red-50 text-[#e33a22] rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {response && !loading && (
            <div className="space-y-4">
              {/* Answer Card */}
              <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Evidence-Backed Answer
                  </span>
                  <span className="text-xs text-[#838280]">
                    Scope: <strong className="capitalize text-[#1c1b1a]">{response.memory_scope_used}</strong>
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-[#1c1b1a] whitespace-pre-line font-normal">
                  {response.answer}
                </div>

                {response.impact_summary && (
                  <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-[#684d07] flex items-start gap-2">
                    <Flame className="w-4 h-4 text-[#af751b] shrink-0 mt-0.5" />
                    <span><strong>Impact Summary:</strong> {response.impact_summary}</span>
                  </div>
                )}
              </div>

              {/* Verified Sources / Evidence Quotes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#838280] block">
                  Source Citations ({response.sources.length} segments):
                </span>
                <div className="space-y-2">
                  {response.sources.map((src, idx) => (
                    <div key={idx} className="p-3 bg-[#f7f1e8]/60 rounded-lg border border-[#e1dcd3] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#838280]">
                        <span className="font-semibold text-[#1c1b1a]">
                          📁 {src.space_name} &bull; {src.meeting_title}
                        </span>
                        <span>Speaker: <strong>{src.speaker || 'Speaker'}</strong></span>
                      </div>
                      <div className="italic text-[#4a4741] flex items-start gap-1.5 pt-1">
                        <Quote className="w-3 h-3 text-[#af751b] shrink-0 mt-0.5" />
                        <span>&ldquo;{src.quote}&rdquo;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-[11px] text-[#838280]">
          <span>Retrieved exclusively from permitted database records. No hallucinations.</span>
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
