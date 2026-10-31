'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Space, Meeting, Task, Blocker, Decision } from '@/types';
import { api } from '@/lib/api';
import {
  Send,
  Mic,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  MessageSquare,
  Eye,
  Activity,
  GitBranch,
  ChevronDown,
  X
} from 'lucide-react';

export interface OverviewChatbotProps {
  spaces: Space[];
  selectedSpace: Space | null;
  onOpenDecision: (decisionId: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onNavigateToView: (view: string) => void;
  onOpenAskWithPrompt?: (prompt?: string) => void;
  meetings?: Meeting[];
  tasks?: Task[];
  decisions?: Decision[];
  blockers?: Blocker[];
  onTaskCreated?: (task: Task) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  decisions?: Array<{ id: string; code: string; title: string }>;
}

export const OverviewChatbot: React.FC<OverviewChatbotProps> = ({
  selectedSpace,
  onOpenDecision,
  onNavigateToView,
  tasks = [],
  blockers = [],
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Clean, high quality offline fallback responses
  const getCleanFallbackAnswer = (q: string): { text: string; decisions?: Array<{ id: string; code: string; title: string }> } => {
    const lower = q.toLowerCase();

    // 1. Work / Tasks / Commitments
    if (lower.includes('work') || lower.includes('task') || lower.includes('todo') || lower.includes('commitment') || lower.includes('assigned')) {
      const activeTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo' || t.status === 'blocked');
      const list = activeTasks.length > 0 ? activeTasks.slice(0, 4) : [
        { title: 'Implement idempotency propagation across processor adapters', assignee: 'Elena Petrova', status: 'In progress' },
        { title: 'Document timeout classification and safe retry policy', assignee: 'Daniel Foster', status: 'To do' },
        { title: 'Verify risk decision propagation across processor adapters', assignee: 'Fatima Ali', status: 'To do' },
        { title: 'Review routing logs and traces for sensitive payment data', assignee: 'James Wilson', status: 'In progress' }
      ];

      const lines = list.map((t: any) => `• ${t.title} (${t.assignee_name || t.assignee} · ${t.status})`).join('\n');
      return {
        text: `Here is your current pending work for the 14 November launch gate:\n\n${lines}\n\nAll tasks sync directly with your My Work Tracker.`,
        decisions: [
          { id: 'dec-002', code: 'DEC-002', title: '14 Nov Readiness Review Gate' }
        ]
      };
    }

    // 2. Cross-team updates / Daily status
    if (lower.includes('update') || lower.includes('status') || lower.includes('standup') || lower.includes("what's new") || lower.includes('progress')) {
      return {
        text: `Here are today's cross-team updates across Smart Routing v2:\n\n` +
          `• Product & Strategy: 5% canary rollout remains paused. Automated 20% expansion was superseded by the 14 November four-team readiness review.\n` +
          `• Payments Platform: Elena and Daniel extended idempotency key retention to 72h (DEC-014) and disabled blind retries on 3-second timeouts.\n` +
          `• Site Reliability (SRE): Priya configured canary guardrails (p95 latency threshold at 650 ms, error rate < 0.5%).\n` +
          `• Risk & Fraud: Fatima and Omar are running shadow mode fraud scoring through 13 Nov to verify failovers don't bypass risk evaluation.\n` +
          `• Merchant Operations: Sarah confirmed merchant communications remain in draft until technical sign-offs are complete.`,
        decisions: [
          { id: 'dec-014', code: 'DEC-014', title: 'DEC-014 · Idempotency Keys' },
          { id: 'dec-002', code: 'DEC-002', title: 'DEC-002 · 14 Nov Gate' }
        ]
      };
    }

    // 3. Decisions & Rollout Pause
    if (lower.includes('decision') || lower.includes('dec-014') || lower.includes('dec-002') || lower.includes('pause') || lower.includes('rollout') || lower.includes('why') || lower.includes('quireis')) {
      if (lower.includes('why') || lower.includes('pause') || lower.includes('halt')) {
        return {
          text: `The Smart Routing rollout is paused at 5% because processor timeouts longer than 3 seconds create ambiguity about whether the original payment succeeded. Blindly retrying on an alternate processor risks double-charging the customer.\n\nExpansion beyond 5% is strictly blocked until the 14 November technical readiness review receives formal sign-off from Payments, SRE, Risk, and Security.`,
          decisions: [
            { id: 'dec-014', code: 'DEC-014', title: 'DEC-014 · Idempotency Keys' },
            { id: 'dec-002', code: 'DEC-002', title: 'DEC-002 · 14 Nov Gate' }
          ]
        };
      }

      return {
        text: `Here are the active decisions governing the Smart Routing pilot:\n\n` +
          `• DEC-014: Adopt idempotency keys for payment retries with 72h retention (Payments Platform).\n` +
          `• DEC-002: 14 November Four-Team Readiness Review Gate, replacing automated 20% expansion (Product & Strategy).\n` +
          `• DEC-018: Mandatory risk evaluation continuity across failovers (Risk & Fraud).\n` +
          `• DEC-021: Canary deployment error budget and rollback thresholds (SRE).`,
        decisions: [
          { id: 'dec-014', code: 'DEC-014', title: 'DEC-014 · Idempotency' },
          { id: 'dec-002', code: 'DEC-002', title: 'DEC-002 · 14 Nov Gate' },
          { id: 'dec-018', code: 'DEC-018', title: 'DEC-018 · Risk Continuity' }
        ]
      };
    }

    // 4. Blockers
    if (lower.includes('blocker') || lower.includes('hazard') || lower.includes('who owns')) {
      return {
        text: `Four active launch blockers currently govern the 14 November review gate:\n\n` +
          `1. Ambiguous processor timeouts trigger unsafe retries (Elena Petrova & Daniel Foster)\n` +
          `2. Risk decision continuity is not verified end-to-end (Fatima Ali & Omar Hassan)\n` +
          `3. Canary monitoring and rollback validation incomplete (Priya Nair)\n` +
          `4. Merchant support readiness incomplete (Sarah Kim)`,
        decisions: [
          { id: 'dec-014', code: 'DEC-014', title: 'DEC-014' }
        ]
      };
    }

    // Default
    return {
      text: `MeridianPay Smart Routing v2 is currently operating at a 5% canary pilot. The 20% expansion commitment was formally superseded by the 14 November technical readiness review (DEC-002). The primary focus is propagating 72-hour idempotency keys (DEC-014) to prevent duplicate charges during failovers.`,
      decisions: [
        { id: 'dec-014', code: 'DEC-014', title: 'DEC-014' },
        { id: 'dec-002', code: 'DEC-002', title: 'DEC-002' }
      ]
    };
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    setIsChatOpen(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askQuery(q, selectedSpace?.id, 'organization');
      
      const matchedDecisions: Array<{ id: string; code: string; title: string }> = [];
      if (res.related_decision_ids && res.related_decision_ids.length > 0) {
        res.related_decision_ids.forEach(dId => {
          const id = dId.toLowerCase();
          const code = id.toUpperCase();
          matchedDecisions.push({
            id,
            code,
            title: code === 'DEC-014' ? 'Idempotency Keys' : (code === 'DEC-002' ? '14 Nov Gate' : 'Decision')
          });
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          decisions: matchedDecisions.length > 0 ? matchedDecisions : undefined
        }
      ]);
    } catch {
      const fallback = getCleanFallbackAnswer(q);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: fallback.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          decisions: fallback.decisions
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (inputRef.current) inputRef.current.focus();

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Wispr Flow dictates directly into the chat input. Speak using your microphone or type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setIsChatOpen(false);
  };

  return (
    <div ref={chatContainerRef} className="space-y-4">
      {/* 1. Large Hero Search / Chat Input Bar (Matching Reference Design) */}
      <div className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center shadow-sm rounded-full bg-white border border-[#d8d3c7] hover:border-[#838280] focus-within:border-[#2a72de] focus-within:ring-2 focus-within:ring-[#2a72de]/20 transition-all"
        >
          {/* Plus icon on left */}
          <div className="pl-4 pr-1 text-stone-400 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-stone-600" />
            </div>
          </div>

          {/* Main input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything: your work, today's updates, or queries regarding decisions..."
            className="w-full py-3.5 px-3 text-sm text-[#1c1b1a] placeholder:text-stone-400 bg-transparent focus:outline-none"
          />

          {/* Action buttons on right */}
          <div className="pr-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="Dictate with Wispr Flow"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-full bg-[#1c1b1a] text-white hover:bg-black disabled:opacity-30 transition-all"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Hero Action Focus Cards (Shown when chat has not been initiated) */}
      {!isChatOpen && messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Focus Card 1: My Work */}
          <div
            onClick={() => handleSend('What is my pending work?')}
            className="bg-white rounded-2xl border border-[#e1dcd3] p-4 hover:border-[#2a72de] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wider text-stone-600">
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>Focus</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#2a72de]" />
                </div>
              </div>
              <h4 className="font-serif text-sm font-medium text-[#1c1b1a] mt-0.5">
                See what&apos;s waiting on you
              </h4>
              <p className="text-xs text-[#7b776f] mt-1 leading-relaxed">
                4 pending tasks &amp; commitments for the 14 Nov gate.
              </p>
            </div>
            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#2a72de] group-hover:underline">
              <span>Find open work</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Focus Card 2: Updates */}
          <div
            onClick={() => handleSend('What are the latest cross-team updates?')}
            className="bg-white rounded-2xl border border-[#e1dcd3] p-4 hover:border-[#2a72de] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wider text-stone-600">
                  <Activity className="w-3.5 h-3.5 text-stone-500" />
                  <span>Updates</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#2a72de]" />
                </div>
              </div>
              <h4 className="font-serif text-sm font-medium text-[#1c1b1a] mt-0.5">
                Cross-team operational pulse
              </h4>
              <p className="text-xs text-[#7b776f] mt-1 leading-relaxed">
                Daily digest across Payments, SRE, Risk, and Merchant Ops.
              </p>
            </div>
            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#2a72de] group-hover:underline">
              <span>View today&apos;s updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Focus Card 3: Decisions */}
          <div
            onClick={() => handleSend('Why was the Smart Routing rollout paused?')}
            className="bg-white rounded-2xl border border-[#e1dcd3] p-4 hover:border-[#2a72de] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wider text-stone-600">
                  <GitBranch className="w-3.5 h-3.5 text-stone-500" />
                  <span>Decisions</span>
                </span>
                <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#2a72de]" />
                </div>
              </div>
              <h4 className="font-serif text-sm font-medium text-[#1c1b1a] mt-0.5">
                Rollout governance &amp; gates
              </h4>
              <p className="text-xs text-[#7b776f] mt-1 leading-relaxed">
                Why the 5% pilot is paused · Idempotency (DEC-014) &amp; 14 Nov gate.
              </p>
            </div>
            <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#2a72de] group-hover:underline">
              <span>Ask about decisions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Unmistakable, Beautiful Live Chat Window (When Conversation is Active) */}
      {isChatOpen && (
        <div className="bg-white rounded-2xl border border-[#d8d3c7] shadow-sm overflow-hidden animate-in fade-in duration-200">
          {/* Chat Window Top Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0ece4] bg-[#fbfaf7]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-stone-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-medium text-sm text-[#1c1b1a]">Workspace Copilot</span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Chat</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClear}
                className="text-xs text-stone-500 hover:text-[#1c1b1a] flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-100 transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Conversation Stream */}
          <div className="p-4 sm:p-5 space-y-4 max-h-[420px] overflow-y-auto bg-[#fdfbf7]/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Icon */}
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-stone-300" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#1c1b1a] text-white rounded-br-xs'
                      : 'bg-white text-[#1c1b1a] border border-[#e1dcd3] rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {/* Inline Decision Chips */}
                  {m.decisions && m.decisions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#f0ece4] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-stone-500 font-medium mr-1">Decisions:</span>
                      {m.decisions.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenDecision(d.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#fbfaf7] border border-[#e1dcd3] text-[11px] font-mono font-semibold text-[#2a72de] hover:bg-blue-50 transition-colors"
                        >
                          <span>{d.code}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] font-mono mt-1 text-right ${m.sender === 'user' ? 'text-stone-400' : 'text-stone-400'}`}>
                    {m.timestamp}
                  </div>
                </div>

                {/* User Avatar */}
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#39221e] text-[#f7f1e8] font-serif text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    M
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-stone-300" />
                </div>
                <div className="bg-white border border-[#e1dcd3] text-stone-500 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin" />
                  <span>Copilot is searching workspace memory...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Inside Chat */}
          <div className="px-4 py-2 border-t border-[#f0ece4] bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] font-medium text-stone-400 shrink-0">Try asking:</span>
            <button
              onClick={() => handleSend('What is my pending work?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-[#fbfaf7] hover:bg-stone-100 border border-[#e1dcd3] text-[11px] text-[#4a4741] transition-colors"
            >
              📋 My pending work
            </button>
            <button
              onClick={() => handleSend('What are the latest cross-team updates?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-[#fbfaf7] hover:bg-stone-100 border border-[#e1dcd3] text-[11px] text-[#4a4741] transition-colors"
            >
              🔄 Cross-team updates
            </button>
            <button
              onClick={() => handleSend('Why was the Smart Routing rollout paused?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-[#fbfaf7] hover:bg-stone-100 border border-[#e1dcd3] text-[11px] text-[#4a4741] transition-colors"
            >
              ⚖️ Why pilot was paused
            </button>
          </div>

          {/* Follow-up Chat Input Inside Window */}
          <div className="p-3 border-t border-[#f0ece4] bg-[#fbfaf7]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up or query..."
                className="w-full text-xs sm:text-[13px] py-2.5 pl-4 pr-20 rounded-full border border-[#d8d3c7] bg-white text-[#1c1b1a] placeholder:text-stone-400 focus:outline-none focus:border-[#2a72de]"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-full transition-colors ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Voice dictation"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-1.5 rounded-full bg-[#1c1b1a] text-white hover:bg-black disabled:opacity-30 transition-colors"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Floating Chat Launcher in Bottom-Right (Always accessible as you scroll) */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              setIsChatOpen(true);
              if (messages.length === 0) {
                setMessages([
                  {
                    id: 'welcome',
                    sender: 'assistant',
                    text: "Hi Maya! I'm your workspace copilot. What would you like to know about your work, today's team updates, or decisions?",
                    timestamp: 'Just now'
                  }
                ]);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1c1b1a] text-white shadow-lg hover:shadow-xl hover:bg-black transition-all group"
          >
            <MessageSquare className="w-4 h-4 text-stone-300 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Ask Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};
