'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, AskQueryResponse } from '@/types';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import {
  X,
  Sparkles,
  Send,
  Quote,
  ShieldCheck,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  Mic,
  MicOff,
  Check,
  AlertCircle,
  FileEdit
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
  const [activeVoiceMode, setActiveVoiceMode] = useState<'search' | 'tasks' | 'corrections'>('search');
  const [isListening, setIsListening] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Clean speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Browser speech recognition (falls back if desktop Wispr Flow isn't running)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is supported natively via Wispr Flow desktop app or WebKit browsers (Chrome, Edge, Safari).');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleAsk(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleAsk = async (promptToAsk?: string) => {
    const q = promptToAsk || query;
    if (!q.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setActionConfirmed(false);

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

  const modeAPrompts = [
    'Why is our January platform launch at risk?',
    'What did the backend team decide in its last meeting?',
    'Which unresolved blockers are affecting the platform launch?',
    'What commitments did HR make last week?'
  ];

  const modeBPrompts = [
    'Show me all overdue tasks assigned to me.',
    'Find all blockers related to the January launch.',
    'Create a follow-up task for the API team to resolve the authentication issue.'
  ];

  const modeCPrompts = [
    'The API deadline was tentative, not final.',
    'This discussion belongs to the Backend Space.',
    'The marketing commitment depends on the final launch date.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card-oura bg-white max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Wispr Flow branding */}
        <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c1b1a] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#2a72de]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#838280]">
                  Organisational Intelligence
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded-full font-semibold border border-[#2a72de]/20">
                  <Mic className="w-2.5 h-2.5" /> Dictate with Wispr Flow
                </span>
              </div>
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

        {/* Input Bar with Voice Dictation Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#838280]">Search Scope:</span>
              <div className="flex items-center gap-1 bg-[#ececec] p-1 rounded-full text-xs">
                <button
                  type="button"
                  onClick={() => setScope('local')}
                  className={`px-3 py-0.5 rounded-full ${scope === 'local' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
                >
                  Local
                </button>
                <button
                  type="button"
                  onClick={() => setScope('shared')}
                  className={`px-3 py-0.5 rounded-full ${scope === 'shared' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
                >
                  Shared
                </button>
                <button
                  type="button"
                  onClick={() => setScope('organization')}
                  className={`px-3 py-0.5 rounded-full ${scope === 'organization' ? 'bg-white text-[#1c1b1a] font-semibold shadow-sm' : 'text-[#4a4741]'}`}
                >
                  🌐 Full Organisation
                </button>
              </div>
            </div>

            {/* Live Wispr Flow / Mic indicator */}
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'bg-stone-100 text-[#1c1b1a] hover:bg-stone-200'
              }`}
              title="Click to toggle voice dictation or use desktop Wispr Flow"
            >
              {isListening ? (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder='Speak or type: "Why is our January platform launch at risk?"'
              className="w-full text-sm p-3.5 pl-4 pr-24 rounded-full border border-[#e1dcd3] focus:outline-none focus:ring-2 focus:ring-[#2a72de] bg-[#f7f1e8]/30 shadow-inner"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-bounce' : 'text-[#838280] hover:text-[#1c1b1a]'}`}
                title="Dictate with Wispr Flow / Microphone"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAsk()}
                disabled={loading || !query.trim()}
                className="p-2 rounded-full bg-[#2a72de] text-white hover:bg-[#205bb5] disabled:opacity-40 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Three Voice Modes Pills */}
          <div className="flex items-center gap-1 border-b border-[#e1dcd3] pb-2 text-xs">
            <button
              onClick={() => setActiveVoiceMode('search')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeVoiceMode === 'search' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
              }`}
            >
              A. Organisational Search
            </button>
            <button
              onClick={() => setActiveVoiceMode('tasks')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeVoiceMode === 'tasks' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
              }`}
            >
              B. Voice Task Management
            </button>
            <button
              onClick={() => setActiveVoiceMode('corrections')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeVoiceMode === 'corrections' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
              }`}
            >
              C. Correcting Intelligence
            </button>
          </div>

          {/* Voice Prompt Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(activeVoiceMode === 'search'
              ? modeAPrompts
              : activeVoiceMode === 'tasks'
              ? modeBPrompts
              : modeCPrompts
            ).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                  handleAsk(q);
                }}
                className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all whitespace-nowrap"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading && (
            <div className="card-oura p-8 text-center text-xs text-[#838280] bg-[#f7f1e8]/40">
              <span className="inline-block w-5 h-5 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-medium text-[#1c1b1a]">Interpreting voice input & querying Context Router...</p>
              <p className="text-[11px] mt-1 text-[#838280]">Searching decisions, dependencies, and transcript quotes across permitted Spaces</p>
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
              <div className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {response.mode === 'memory_correction'
                      ? 'Memory Correction Review'
                      : response.mode === 'task_command'
                      ? 'Voice Task Command'
                      : 'Evidence-Backed Answer'}
                  </span>
                  <span className="text-xs text-[#838280]">
                    Scope: <strong className="capitalize text-[#1c1b1a]">{response.memory_scope_used}</strong>
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-[#1c1b1a]">
                  <MarkdownRenderer content={response.answer} />
                </div>

                {response.impact_summary && (
                  <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-[#684d07] flex items-start gap-2">
                    <Flame className="w-4 h-4 text-[#af751b] shrink-0 mt-0.5" />
                    <span><strong>Impact Summary:</strong> {response.impact_summary}</span>
                  </div>
                )}

                {/* Proposed Action Confirmation (For Mode B & Mode C) */}
                {response.proposed_action && (
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3 mt-2">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-[#2a72de]" />
                      <span className="text-xs font-semibold text-[#1c1b1a]">
                        Action Review UI: Proposed State Change
                      </span>
                    </div>
                    <div className="text-xs text-[#4a4741] space-y-1 bg-white p-3 rounded-lg border border-[#e1dcd3]">
                      {Object.entries(response.proposed_action).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="font-medium capitalize">{k.replace('_', ' ')}:</span>
                          <span className="truncate max-w-[280px]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {actionConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Staged in Action Review Drawer
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActionConfirmed(true)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Stage in Review Drawer</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Sources / Evidence Quotes */}
              {response.sources && response.sources.length > 0 && (
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
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-[11px] text-[#838280]">
          <span>Wispr Flow converts speech into text; CONFLUENCE verifies context and enforces approvals.</span>
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
