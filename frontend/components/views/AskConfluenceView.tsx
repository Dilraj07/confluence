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
  Layers
} from 'lucide-react';

interface AskConfluenceViewProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  initialQuery?: string;
}

export const AskConfluenceView: React.FC<AskConfluenceViewProps> = ({
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
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is supported natively via Wispr Flow desktop app or modern WebKit browsers.');
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

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Hero Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
            First-Class AI Interface
          </span>
          <span className="text-xs text-[#838280]">
            Permission-Scoped Memory Retrieval
          </span>
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#1c1b1a]">
          Ask CONFLUENCE
        </h2>
        <p className="text-xs text-[#7b776f] font-light max-w-xl">
          Interact with organizational memory using text or Wispr Flow voice dictation. Every statement is verified against transcript segments.
        </p>
      </div>

      {/* Main Search Box Card */}
      <div className="card-oura p-6 bg-white border border-[#e1dcd3] shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#838280]">Scope:</span>
            <div className="flex items-center gap-1 bg-[#fbfaf7] border border-[#e1dcd3] p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScope('local')}
                className={`px-3 py-0.5 rounded ${scope === 'local' ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs' : 'text-[#4a4741]'}`}
              >
                Local Space
              </button>
              <button
                type="button"
                onClick={() => setScope('shared')}
                className={`px-3 py-0.5 rounded ${scope === 'shared' ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs' : 'text-[#4a4741]'}`}
              >
                Shared
              </button>
              <button
                type="button"
                onClick={() => setScope('organization')}
                className={`px-3 py-0.5 rounded ${scope === 'organization' ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs' : 'text-[#4a4741]'}`}
              >
                Full Organisation
              </button>
            </div>
          </div>

          {/* Voice status */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-xs'
                : 'bg-[#fbfaf7] text-[#1c1b1a] border border-[#e1dcd3] hover:bg-stone-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#2a72de]" />
            <span>{isListening ? 'Listening...' : 'Wispr Flow Dictation'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder='Ask any question, command a task, or dictate a memory correction...'
            className="w-full text-xs p-3.5 pr-20 rounded-xl border border-[#e1dcd3] focus:outline-none focus:ring-1 focus:ring-[#2a72de] bg-[#fbfaf7] text-[#1c1b1a]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>

        {/* 3 Interaction Modes */}
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

      {/* Answer & Citations Stream */}
      {loading && (
        <div className="card-oura p-10 text-center text-xs text-[#838280] bg-white border border-[#e1dcd3]">
          <span className="inline-block w-5 h-5 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-semibold text-[#1c1b1a]">Searching organizational memory...</p>
          <p className="text-[11px] text-[#7b776f] mt-0.5">Filtering permitted Spaces and cross-referencing decisions with transcript segments.</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-xs bg-red-50 text-[#e33a22] rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {response && !loading && (
        <div className="space-y-4">
          <div className="card-oura p-6 bg-white border border-[#e1dcd3] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                Verified Memory Response
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

            {/* Action Proposal Card */}
            {response.proposed_action && (
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3 mt-2">
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
                      <span className="truncate max-w-[280px]">{String(v)}</span>
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
          </div>

          {/* Sources and Verbatim Quotes */}
          {response.sources && response.sources.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#838280] block">
                Evidence Citations ({response.sources.length} segments):
              </span>
              <div className="space-y-2">
                {response.sources.map((src, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-[#e1dcd3] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#838280]">
                      <span className="font-semibold text-[#1c1b1a]">
                        📁 {src.space_name} &bull; {src.meeting_title}
                      </span>
                      <span>Speaker: <strong>{src.speaker || 'Speaker'}</strong></span>
                    </div>
                    <div className="italic text-[#4a4741] flex items-start gap-1.5 pt-1">
                      <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
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
  );
};
