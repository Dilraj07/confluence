'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, AskQueryResponse } from '@/types';
import {
  Sparkles,
  Send,
  Mic,
  Quote,
  Flame,
  Check,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AskConfluenceViewProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  initialQuery?: string;
  onOpenMeeting?: (meetingId: string) => void;
}

export const AskConfluenceView: React.FC<AskConfluenceViewProps> = ({
  spaces,
  selectedSpaceId,
  initialQuery = '',
  onOpenMeeting
}) => {
  const activeSpace = spaces.find(s => s.id === selectedSpaceId) || null;

  // Align scope strictly with selectedSpaceId
  const [scope, setScope] = useState<'local' | 'shared' | 'organization'>(
    selectedSpaceId ? 'local' : 'organization'
  );
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVoiceMode, setActiveVoiceMode] = useState<'search' | 'tasks' | 'corrections'>('search');
  const [isListening, setIsListening] = useState(false);
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const [citationsExpanded, setCitationsExpanded] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update scope when selectedSpaceId changes
  useEffect(() => {
    if (selectedSpaceId) {
      setScope('local');
    }
  }, [selectedSpaceId]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // In Wispr Flow, users dictate externally into any focused input field.
      // So simply focusing the textarea and alerting is the standard workflow.
      alert('Wispr Flow dictates directly into the focused input field. Your cursor is active: speak using Wispr Flow shortcut or type.');
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
        throw new Error('Failed to retrieve intelligence from organizational memory');
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

  const getFollowUpQuestions = () => {
    if (!response) return [];
    const text = (response.query + ' ' + response.answer).toLowerCase();
    if (text.includes('launch') || text.includes('risk')) {
      return [
        'What did Elena Rostova commit to regarding database partitioning?',
        'Who is responsible for resolving the HR hiring shortfall?',
        'Show me the full supersession history of the Redis decision.'
      ];
    }
    if (text.includes('backend') || text.includes('partition')) {
      return [
        'How does table partitioning affect the March 15 launch?',
        'What was the original kickoff architecture before Redis was superseded?',
        'Are there any active blockers logged in the Backend Space?'
      ];
    }
    return [
      'Show me all active commitments in this Space.',
      'Which cross-space dependencies are at risk?'
    ];
  };

  const formatScopeDisplay = (scopeKey: string) => {
    if (scopeKey === 'local' && activeSpace) {
      return `Local Space (${activeSpace.name})`;
    }
    if (scopeKey === 'local') {
      return 'Local Space';
    }
    if (scopeKey === 'shared') {
      return 'Shared Cross-Space';
    }
    return 'Full Organisation';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* 1. Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
            Organizational AI Intelligence
          </span>
          <span className="text-xs text-[#838280]">
            {activeSpace ? `Scoped to ${activeSpace.name} Space` : 'Full Organisation Knowledge'}
          </span>
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#1c1b1a]">
          Ask CONFLUENCE
        </h2>
        <p className="text-xs text-[#7b776f] font-light max-w-xl">
          Query cross-team decisions, trace dependencies, and dictate commands with Wispr Flow. Every statement cites verified transcript segments.
        </p>
      </div>

      {/* 2. Main Search & Prompt Input Box */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] shadow-xs space-y-4">
        {/* Scope Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#838280]">Retrieval Scope:</span>
            <div className="flex items-center gap-1 bg-[#fbfaf7] border border-[#e1dcd3] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScope('local')}
                className={`px-3 py-1 rounded transition-all ${
                  scope === 'local'
                    ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                    : 'text-[#4a4741] hover:text-[#1c1b1a]'
                }`}
              >
                {activeSpace ? `${activeSpace.name} (Local)` : 'Local Space'}
              </button>
              <button
                type="button"
                onClick={() => setScope('shared')}
                className={`px-3 py-1 rounded transition-all ${
                  scope === 'shared'
                    ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                    : 'text-[#4a4741] hover:text-[#1c1b1a]'
                }`}
              >
                Shared
              </button>
              <button
                type="button"
                onClick={() => setScope('organization')}
                className={`px-3 py-1 rounded transition-all ${
                  scope === 'organization'
                    ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                    : 'text-[#4a4741] hover:text-[#1c1b1a]'
                }`}
              >
                Full Organisation
              </button>
            </div>
          </div>

          {/* Wispr Flow Dictation Status */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-[#fbfaf7] text-[#1c1b1a] border border-[#e1dcd3] hover:bg-stone-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>{isListening ? 'Listening...' : 'Dictate with Wispr Flow'}</span>
          </button>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder='Ask: "Why is our January platform launch at risk?" or dictate via Wispr Flow...'
            className="w-full text-xs p-3.5 pr-20 rounded-xl border border-[#e1dcd3] focus:outline-none focus:ring-1 focus:ring-[#2a72de] bg-[#fbfaf7] text-[#1c1b1a] leading-relaxed"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>

        {/* 3 Interaction Modes (Search, Tasks, Corrections) */}
        <div className="flex items-center gap-2 border-b border-[#e1dcd3] pb-2 text-xs">
          <button
            onClick={() => setActiveVoiceMode('search')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeVoiceMode === 'search' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
            }`}
          >
            A. Organisational Search
          </button>
          <button
            onClick={() => setActiveVoiceMode('tasks')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeVoiceMode === 'tasks' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
            }`}
          >
            B. Task Management
          </button>
          <button
            onClick={() => setActiveVoiceMode('corrections')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeVoiceMode === 'corrections' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
            }`}
          >
            C. Correcting Intelligence
          </button>
        </div>

        {/* Sample queries */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-[#838280]">
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
              className="shrink-0 px-2.5 py-1 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all whitespace-nowrap"
            >
              &ldquo;{q}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* 3. Loading State */}
      {loading && (
        <div className="card-oura p-10 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3] space-y-2">
          <span className="inline-block w-5 h-5 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-1" />
          <p className="font-semibold text-[#1c1b1a]">Searching organizational memory...</p>
          <p className="text-[11px] text-[#7b776f]">Cross-referencing decision supersessions and transcript evidence segments.</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 text-xs bg-red-50 text-[#e33a22] rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* 4. Structured Evidence-Backed Response */}
      {response && !loading && (
        <div className="space-y-4">
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-5 shadow-xs">
            {/* Scope & Verified Status */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Memory Fact
                </span>
                <span className="text-[11px] text-[#838280]">
                  Confidence: <strong>{Math.round(response.confidence * 100)}%</strong>
                </span>
              </div>
              <span className="text-xs text-[#838280]">
                Scope Used: <strong className="text-[#1c1b1a]">{formatScopeDisplay(response.memory_scope_used)}</strong>
              </span>
            </div>

            {/* Answer Typography */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#838280]">
                Synthesized Answer &bull; Grounded in Canonical Records
              </span>
              <div className="text-xs md:text-sm leading-relaxed text-[#1c1b1a] whitespace-pre-line font-normal space-y-2">
                {response.answer}
              </div>
            </div>

            {/* Inferred Risks / Impact Summary */}
            {response.impact_summary && (
              <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-[#684d07] flex items-start gap-2.5">
                <Flame className="w-4 h-4 text-[#af751b] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#1c1b1a]">Inferred Dependency &amp; Timeline Risk:</span>
                  <p className="text-[#4a4741]">{response.impact_summary}</p>
                </div>
              </div>
            )}

            {/* Proposed Action Approval Card */}
            {response.proposed_action && (
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-[#2a72de]" />
                  <span className="text-xs font-semibold text-[#1c1b1a]">
                    Action Review UI: Proposed Memory Modification
                  </span>
                </div>
                <div className="text-xs text-[#4a4741] space-y-1 bg-white p-3 rounded-md border border-[#e1dcd3]">
                  {Object.entries(response.proposed_action).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="font-medium capitalize">{k.replace('_', ' ')}:</span>
                      <span className="truncate max-w-[280px] font-mono text-[11px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {actionConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded">
                      <Check className="w-3.5 h-3.5" /> Action Staged for Reviewer Approval
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActionConfirmed(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Stage in Action Drawer</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Follow-Up Query Suggestions */}
            <div className="pt-3 border-t border-[#f0ece4] space-y-2">
              <span className="text-[11px] font-semibold text-[#838280] block">
                Suggested Follow-up Questions:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {getFollowUpQuestions().map((fq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(fq);
                      handleAsk(fq);
                    }}
                    className="px-3 py-1 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] hover:border-[#838280] text-[#1c1b1a] transition-all text-left"
                  >
                    &ldquo;{fq}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Collapsible Evidence Citations & Deep Linking */}
          {response.sources && response.sources.length > 0 && (
            <div className="card-oura bg-white border border-[#e1dcd3] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setCitationsExpanded(!citationsExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#fbfaf7] transition-colors text-xs font-semibold text-[#1c1b1a]"
              >
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-[#af751b]" />
                  <span>
                    Evidence Citations ({response.sources.length} Verified Segments)
                  </span>
                </div>
                {citationsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#838280]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#838280]" />
                )}
              </button>

              {citationsExpanded && (
                <div className="divide-y divide-[#f0ece4] border-t border-[#f0ece4]">
                  {response.sources.map((src, idx) => (
                    <div key={idx} className="p-4 space-y-2 hover:bg-[#fdfbf7] transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1c1b1a]">
                            📁 {src.space_name} &bull; {src.meeting_title}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#838280]">
                          Speaker: <strong>{src.speaker || 'Speaker'}</strong>
                        </span>
                      </div>

                      <div className="italic text-xs text-[#4a4741] bg-[#fbfaf7] p-2.5 rounded border border-[#e1dcd3] flex items-start gap-2">
                        <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                        <span>&ldquo;{src.quote}&rdquo;</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#838280] pt-1">
                        <span className="font-mono">Segment ID: {src.segment_id}</span>
                        {src.meeting_id && onOpenMeeting && (
                          <button
                            type="button"
                            onClick={() => onOpenMeeting(src.meeting_id!)}
                            className="flex items-center gap-1 text-[#2a72de] font-semibold hover:underline"
                          >
                            <span>Jump to Transcript Segment</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
