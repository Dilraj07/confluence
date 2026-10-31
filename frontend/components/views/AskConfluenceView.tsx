'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, AskQueryResponse } from '@/types';
import { api } from '@/lib/api';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
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
  AlertCircle,
  GitBranch,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

interface AskConfluenceViewProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  initialQuery?: string;
  onOpenMeeting?: (meetingId: string) => void;
  onOpenDecision?: (decisionId: string) => void;
  onNavigateToView?: (view: string) => void;
}

export const AskConfluenceView: React.FC<AskConfluenceViewProps> = ({
  spaces,
  selectedSpaceId,
  initialQuery = '',
  onOpenMeeting,
  onOpenDecision,
  onNavigateToView
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
  const [citationsExpanded, setCitationsExpanded] = useState(true);
  const [reasoningExpanded, setReasoningExpanded] = useState(true);

  // Staged action execution state
  const [actionConfirmed, setActionConfirmed] = useState(false);
  const [actionExecuting, setActionExecuting] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);

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
      setActionResult(null);

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

  const handleApproveAction = async () => {
    if (!response?.proposed_action) return;
    try {
      setActionExecuting(true);
      const res = await api.executeAction(response.proposed_action.type, response.proposed_action);
      setActionExecuting(false);
      setActionConfirmed(true);
      setActionResult(res.message);
    } catch (e: any) {
      setActionExecuting(false);
      setActionResult(`Execution failed: ${e.message}`);
    }
  };

  const modeAPrompts = [
    'Why was the Smart Routing rollout paused?',
    'What changed from the original rollout plan?',
    'What must happen before we can expand to 20%?',
    'Which teams still have launch blockers, and who owns each action?',
    'Can Merchant Operations confirm the pilot expansion date?',
    'What did Priya Nair say about canary latency thresholds?',
    'Who is working on idempotency keys?'
  ];

  const modeBPrompts = [
    'Show me all overdue tasks assigned to me.',
    'Find all blockers affecting the 14 November readiness review.',
    'Create a follow-up task for Daniel Foster to complete the 3-second timeout reconciliation.',
    'Review all pending commitments for the Payments Platform team.',
    'Create a follow-up task for Daniel Foster to verify idempotent failover retry logic.',
    'Create a follow-up task for Elena Petrova to document idempotency header propagation.'
  ];

  const modeCPrompts = [
    'The 20% pilot expansion was superseded, not approved.',
    'Risk team sign-off requires shadow mode data through 13 November.',
    'Merchant communications must remain on hold until the 14 November gate.',
    'The 3-second processor timeout creates duplicate transaction risk.',
    'The API deadline was tentative, not final.'
  ];

  const getFollowUpQuestions = () => {
    if (!response) return [];
    const text = (response.query + ' ' + response.answer).toLowerCase();
    if (text.includes('pause') || text.includes('timeout') || text.includes('duplicate')) {
      return [
        'What changed from the original rollout plan?',
        'What must happen before we can expand to 20%?',
        'Show the supersession history of the pilot expansion decision.',
        'Who is working on idempotency keys?'
      ];
    }
    if (text.includes('blocker') || text.includes('gate') || text.includes('14 november') || text.includes('readiness')) {
      return [
        'Which teams still have launch blockers, and who owns each action?',
        'Can Merchant Operations confirm the pilot expansion date?',
        'What did Priya Nair commit to regarding the SRE circuit-breaker testing?',
        'What did Priya Nair say about canary latency thresholds?'
      ];
    }
    return [
      'Why was the Smart Routing rollout paused?',
      'What must happen before we can expand to 20%?',
      'Which teams still have launch blockers, and who owns each action?'
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
            Agentic AI Organizational Memory
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
          Multi-hop reasoning across meetings, decisions, commitments, and blockers. Speak naturally via Wispr Flow or type below.
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
                className={`px-3 py-1 rounded transition-all ${scope === 'local'
                  ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                  : 'text-[#4a4741] hover:text-[#1c1b1a]'
                  }`}
              >
                {activeSpace ? `${activeSpace.name} (Local)` : 'Local Space'}
              </button>
              <button
                type="button"
                onClick={() => setScope('shared')}
                className={`px-3 py-1 rounded transition-all ${scope === 'shared'
                  ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                  : 'text-[#4a4741] hover:text-[#1c1b1a]'
                  }`}
              >
                Shared
              </button>
              <button
                type="button"
                onClick={() => setScope('organization')}
                className={`px-3 py-1 rounded transition-all ${scope === 'organization'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-[#fbfaf7] text-[#1c1b1a] border border-[#e1dcd3] hover:bg-stone-100'
              }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>{isListening ? 'Listening...' : 'Dictate with Wispr Flow'}</span>
            <span>{isListening ? 'Listening with Wispr Flow...' : 'Dictate with Wispr Flow'}</span>
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
            placeholder='Ask: "Why was the Smart Routing rollout paused?" or dictate command via Wispr Flow...'
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
            className={`px-3 py-1 rounded-md font-medium transition-all ${activeVoiceMode === 'search' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
              }`}
          >
            A. Organisational Search
          </button>
          <button
            onClick={() => setActiveVoiceMode('tasks')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${activeVoiceMode === 'tasks' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
              }`}
          >
            B. Task Management
          </button>
          <button
            onClick={() => setActiveVoiceMode('corrections')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${activeVoiceMode === 'corrections' ? 'bg-[#1c1b1a] text-white font-semibold' : 'text-[#838280] hover:text-[#1c1b1a]'
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
          <p className="font-semibold text-[#1c1b1a]">Agentic reasoning across organizational memory...</p>
          <p className="text-[11px] text-[#7b776f]">Routing context, traversing supersession lineage, and retrieving transcript citations.</p>
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
              <div className="text-xs md:text-sm leading-relaxed text-[#1c1b1a]">
                <MarkdownRenderer content={response.answer} />
              </div>
            </div>

            {/* Linked Canonical Decisions Drill-Down */}
            {response.related_decision_ids && response.related_decision_ids.length > 0 && (
              <div className="pt-3 border-t border-[#f0ece4] flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-semibold text-[#838280] flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-[#2a72de]" />
                  Linked Canonical Decisions:
                </span>
                {response.related_decision_ids.map((dId, idx) => {
                  const lower = dId.toLowerCase();
                  let label = `DEC-00${idx + 1}`;
                  if (lower.includes('dec-014') || lower.includes('57635a88') || lower.includes('95f6e618') || lower.includes('13f9afbe') || lower.includes('7b7efdd3') || lower.includes('idempotenc')) {
                    label = 'DEC-014 · Idempotency Keys';
                  } else if (lower.includes('dec-002') || lower.includes('924abc59') || lower.includes('a9d24a57') || lower.includes('9ca57a3b') || lower.includes('14 nov') || lower.includes('gate') || lower.includes('e4c9dfff') || lower.includes('review')) {
                    label = 'DEC-002 · 14 Nov Gate';
                  } else if (lower.includes('dec-018') || lower.includes('1fc05fe9') || lower.includes('fraud') || lower.includes('risk')) {
                    label = 'DEC-018 · Risk Evaluation';
                  } else if (lower.includes('dec-021') || lower.includes('75e6bcb1') || lower.includes('canary') || lower.includes('sre') || lower.includes('latency')) {
                    label = 'DEC-021 · SRE Guardrails';
                  } else if (dId.startsWith('DEC-')) {
                    label = dId;
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenDecision && onOpenDecision(dId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f7f1e8] hover:bg-[#ece5d8] border border-[#e1dcd3] font-mono text-[11px] text-[#2a72de] font-semibold transition-colors shadow-xs"
                      title="Click to view complete decision trace and lineage"
                    >
                      <span>{label}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  );
                })}
              </div>
            )}

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

                {actionResult && (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {actionResult}
                    </span>
                    {onNavigateToView && (
                      <button
                        type="button"
                        onClick={() => onNavigateToView('my-work')}
                        className="text-[#2a72de] font-semibold underline hover:text-[#205bb5] ml-2 shrink-0"
                      >
                        View in My Work &rarr;
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  {actionConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded">
                      <Check className="w-3.5 h-3.5" /> Action Persisted &amp; Audited
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={actionExecuting}
                      onClick={handleApproveAction}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] disabled:opacity-50 transition-all shadow-xs"
                    >
                      {actionExecuting ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Persisting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve &amp; Persist Action</span>
                        </>
                      )}
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
          {/* 5. Autonomous Agent Reasoning Trail */}
          {response.reasoning_steps && response.reasoning_steps.length > 0 && (
            <div className="card-oura bg-white border border-[#e1dcd3] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setReasoningExpanded(!reasoningExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#fbfaf7] transition-colors text-xs font-semibold text-[#1c1b1a]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2a72de]" />
                  <span>Agent Reasoning Trail ({response.reasoning_steps.length} Steps)</span>
                  <span className="text-[10px] font-mono bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded border border-blue-100">
                    Multi-Hop Verified
                  </span>
                </div>
                {reasoningExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#838280]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#838280]" />
                )}
              </button>

              {reasoningExpanded && (
                <div className="p-4 border-t border-[#f0ece4] bg-[#fdfbf7] space-y-3">
                  {response.reasoning_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-[#2a72de] flex items-center justify-center font-mono text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#1c1b1a]">{step.step}</span>
                        <p className="text-[11px] text-[#4a4741] font-light leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Collapsible Evidence Citations & Deep Linking */}
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
