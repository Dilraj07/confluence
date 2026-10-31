'use client';

import React, { useState, useMemo } from 'react';
import { GraphData, Decision, Meeting, Space } from '@/types';
import {
  GitBranch,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  User,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ChevronRight,
  ExternalLink,
  Target,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  MessageSquare,
  AlertCircle,
  Check,
  X,
  History,
  Network,
  Compass
} from 'lucide-react';

import { CANONICAL_DECISIONS, DecisionIntelligenceRecord } from '@/lib/decisionIntelligence';

interface KnowledgeViewProps {
  graphData: GraphData;
  decisions: Decision[];
  meetings: Meeting[];
  spaces: Space[];
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenDecisionDetail?: (decisionId: string) => void;
  initialSubView?: 'timeline' | 'explorer' | 'detail' | 'lineage' | 'impact';
  initialDecisionId?: string;
}

const CANONICAL_DECISION_INTELLIGENCE: DecisionIntelligenceRecord[] = CANONICAL_DECISIONS;

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  graphData,
  decisions,
  meetings,
  spaces,
  onOpenDecisionTrail,
  onOpenMeeting,
  onOpenDecisionDetail,
  initialSubView = 'timeline',
  initialDecisionId = 'dec-014'
}) => {
  // 5 Views: timeline (default), explorer, detail, lineage, impact
  const [activeSubView, setActiveSubView] = useState<'timeline' | 'explorer' | 'detail' | 'lineage' | 'impact'>(initialSubView);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>(initialDecisionId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedLineageNode, setSelectedLineageNode] = useState<any | null>(null);

  // Quick Action Modal states
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'revision' | 'followup' | 'contradiction' | 'clarification' | null;
    title: string;
  }>({ isOpen: false, type: null, title: '' });
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Active decision intelligence record
  const currentDecision = useMemo(() => {
    return CANONICAL_DECISION_INTELLIGENCE.find(d => d.id === selectedDecisionId) || CANONICAL_DECISION_INTELLIGENCE[0];
  }, [selectedDecisionId]);

  // Filtered decisions for the Explorer table
  const filteredDecisions = useMemo(() => {
    return CANONICAL_DECISION_INTELLIGENCE.filter(d => {
      // Status filter
      if (statusFilter === 'active' && d.status !== 'active') return false;
      if (statusFilter === 'revised' && d.status !== 'revised') return false;
      if (statusFilter === 'superseded' && d.status !== 'superseded') return false;
      if (statusFilter === 'blocked' && d.status !== 'blocked') return false;
      if (statusFilter === 'high_impact' && d.impactLevel !== 'high' && d.impactLevel !== 'critical') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          d.code.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.shortTitle.toLowerCase().includes(q) ||
          d.owner.toLowerCase().includes(q) ||
          d.space.toLowerCase().includes(q) ||
          d.originMeeting.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [statusFilter, searchQuery]);

  const handleSelectDecision = (decId: string, targetView: 'detail' | 'timeline' | 'lineage' | 'impact' = 'detail') => {
    setSelectedDecisionId(decId);
    setActiveSubView(targetView);
  };

  const handleOpenOriginMeeting = () => {
    const meeting = meetings.find(m => m.title.toLowerCase().includes(currentDecision.originMeeting.toLowerCase().slice(0, 10)));
    if (meeting) {
      onOpenMeeting(meeting);
    } else if (meetings[0]) {
      onOpenMeeting(meetings[0]);
    }
  };

  const handleTriggerAction = (type: 'revision' | 'followup' | 'contradiction' | 'clarification', title: string) => {
    setActionModal({ isOpen: true, type, title });
  };

  const handleConfirmAction = () => {
    const actionLabel = actionModal.title;
    setActionModal({ isOpen: false, type: null, title: '' });
    setActionSuccessToast(`${actionLabel} successfully logged and dispatched for human review.`);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* 1. Header & High-Level Organizational Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e1dcd3] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
              DECISION INTELLIGENCE &amp; TRACEABILITY
            </span>
            <span className="text-xs text-[#838280]">
              MeridianPay / Organisation-wide decision history
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#1c1b1a] mt-1">
            Decision Intelligence
          </h1>
          <p className="text-xs text-[#7b776f] font-light mt-0.5 max-w-2xl">
            Trace decisions from original incident, follow architectural evolution through approvals and revisions, and inspect cross-team downstream impact.
          </p>
        </div>

        {/* 3 Executive Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#e1dcd3] px-3.5 py-2 rounded-xl text-center shadow-xs">
            <span className="text-lg font-serif font-normal text-[#1c1b1a] block leading-none">24</span>
            <span className="text-[10px] uppercase font-semibold text-[#838280]">Active decisions</span>
          </div>
          <div className="bg-white border border-[#e1dcd3] px-3.5 py-2 rounded-xl text-center shadow-xs">
            <span className="text-lg font-serif font-normal text-[#af751b] block leading-none">6</span>
            <span className="text-[10px] uppercase font-semibold text-[#af751b]">Changed decisions</span>
          </div>
          <div className="bg-white border border-[#e1dcd3] px-3.5 py-2 rounded-xl text-center shadow-xs">
            <span className="text-lg font-serif font-normal text-[#e33a22] block leading-none">3</span>
            <span className="text-[10px] uppercase font-semibold text-[#e33a22]">Impact alerts</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'explorer', label: 'Decision Explorer', icon: Compass },
            { id: 'detail', label: 'Decision Detail', icon: FileText, badge: currentDecision.code },
            { id: 'timeline', label: 'Decision Timeline', icon: History },
            { id: 'lineage', label: 'Lineage Graph', icon: GitBranch },
            { id: 'impact', label: 'Impact & Dependencies', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#1c1b1a] text-white font-semibold shadow-xs'
                    : 'text-[#4a4741] hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2a72de]' : 'text-[#838280]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-[#838280]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Decision Context Switcher when in detail/timeline/lineage/impact */}
        {activeSubView !== 'explorer' && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[#838280]">Inspecting:</span>
            <select
              value={selectedDecisionId}
              onChange={(e) => setSelectedDecisionId(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#e1dcd3] rounded-lg px-2.5 py-1 text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            >
              {CANONICAL_DECISION_INTELLIGENCE.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.shortTitle} ({d.statusLabel})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {actionSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW A: DECISION EXPLORER (DEFAULT VIEW) */}
      {activeSubView === 'explorer' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="card-oura p-4 bg-white border border-[#e1dcd3] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search decisions, incidents, meetings, owners, or topics..."
                  className="w-full text-xs p-2.5 pl-9 pr-3 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                />
                <Search className="w-3.5 h-3.5 text-[#838280] absolute left-3 top-3" />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All decisions' },
                  { id: 'active', label: 'Active' },
                  { id: 'revised', label: 'Revised' },
                  { id: 'superseded', label: 'Superseded' },
                  { id: 'blocked', label: 'Blocked' },
                  { id: 'high_impact', label: 'High impact' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      statusFilter === f.id
                        ? 'bg-[#1c1b1a] text-white font-semibold'
                        : 'bg-[#fbfaf7] text-[#4a4741] border border-[#e1dcd3] hover:bg-stone-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decisions Requiring Attention Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#e33a22]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Decisions requiring attention
                </h3>
              </div>
              <span className="text-xs text-[#838280]">Key Smart Routing v2 inflection points</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: DEC-014 */}
              <div className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#2a72de] transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1c1b1a]">DEC-014 · Payment idempotency</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#af751b] border border-amber-200">
                      Revised
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4741] leading-relaxed">
                    Extend idempotency key retention after QA identified delayed retries outside the original window.
                  </p>
                  <div className="text-[11px] text-[#838280] pt-1">
                    Origin: <strong>Routing Reliability Review · 24 Oct</strong>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f0ece4] mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#838280] text-[11px]">4 linked meetings &bull; 3 affected teams</span>
                  <button
                    onClick={() => handleSelectDecision('dec-014', 'detail')}
                    className="flex items-center gap-1 text-[#2a72de] font-semibold hover:underline"
                  >
                    <span>Trace decision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: DEC-009 */}
              <div className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#2a72de] transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1c1b1a]">DEC-009 · Retry strategy</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-[#4a4741] border border-stone-200">
                      Superseded
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4741] leading-relaxed">
                    Retry with exponential backoff was retained as a retry policy, but no longer treated as sufficient protection against duplicate execution.
                  </p>
                  <div className="text-[11px] text-[#838280] pt-1">
                    Origin: <strong>Payment Incident Review · 18 Oct</strong>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f0ece4] mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#838280] text-[11px]">2 linked meetings &bull; 2 affected teams</span>
                  <button
                    onClick={() => handleSelectDecision('dec-009', 'detail')}
                    className="flex items-center gap-1 text-[#2a72de] font-semibold hover:underline"
                  >
                    <span>Trace decision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: DEC-018 */}
              <div className="card-oura p-5 bg-white border border-[#e1dcd3] hover:border-[#2a72de] transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#1c1b1a]">DEC-018 · Merchant key propagation</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-[#e33a22] border border-red-200">
                      Blocked
                    </span>
                  </div>
                  <p className="text-xs text-[#4a4741] leading-relaxed">
                    Merchant integration changes are needed before end-to-end idempotency can be validated in production.
                  </p>
                  <div className="text-[11px] text-[#838280] pt-1">
                    Origin: <strong>Merchant Integration Sync · 27 Oct</strong>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f0ece4] mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#838280] text-[11px]">2 affected workstreams &bull; 1 blocker</span>
                  <button
                    onClick={() => handleSelectDecision('dec-018', 'detail')}
                    className="flex items-center gap-1 text-[#2a72de] font-semibold hover:underline"
                  >
                    <span>Trace decision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Canonical Decision Master Table */}
          <div className="card-oura bg-white border border-[#e1dcd3] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e1dcd3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Canonical Decision Directory
                </h3>
              </div>
              <span className="text-xs text-[#838280]">
                Showing {filteredDecisions.length} decisions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#fbfaf7] border-b border-[#e1dcd3] text-[11px] font-semibold text-[#838280] uppercase tracking-wider">
                    <th className="py-3 px-4">Decision ID &amp; Title</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Origin Meeting &amp; Date</th>
                    <th className="py-3 px-3">Responsible Owner</th>
                    <th className="py-3 px-3 text-center">Linked Meetings</th>
                    <th className="py-3 px-3 text-center">Impact</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece4]">
                  {filteredDecisions.map((dec) => {
                    const statusStyles: Record<string, string> = {
                      active: 'bg-blue-50 text-[#2a72de] border-blue-200',
                      revised: 'bg-amber-50 text-[#af751b] border-amber-200',
                      superseded: 'bg-stone-100 text-[#4a4741] border-stone-200',
                      blocked: 'bg-red-50 text-[#e33a22] border-red-200',
                      under_review: 'bg-purple-50 text-purple-700 border-purple-200'
                    };

                    const impactStyles: Record<string, string> = {
                      critical: 'text-[#e33a22] font-bold',
                      high: 'text-[#af751b] font-semibold',
                      medium: 'text-[#4a4741]',
                      low: 'text-[#838280]'
                    };

                    return (
                      <tr
                        key={dec.id}
                        onClick={() => handleSelectDecision(dec.id, 'detail')}
                        className="hover:bg-[#fbfaf7] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-[#1c1b1a] text-[11px]">
                            {dec.code}
                          </div>
                          <div className="font-semibold text-[#1c1b1a] mt-0.5">
                            {dec.shortTitle}
                          </div>
                          <div className="text-[11px] text-[#838280] truncate max-w-md font-light">
                            {dec.title}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusStyles[dec.status] || 'bg-stone-50'}`}>
                            {dec.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#1c1b1a]">{dec.originMeeting}</div>
                          <div className="text-[11px] text-[#838280]">{dec.originDate}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[#1c1b1a] font-medium">{dec.owner}</div>
                          <div className="text-[11px] text-[#838280]">{dec.space}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-[#4a4741] text-[11px] font-semibold">
                            {dec.linkedMeetingsCount} meetings
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[11px] uppercase ${impactStyles[dec.impactLevel]}`}>
                            {dec.impactLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDecision(dec.id, 'detail');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-stone-100 hover:bg-[#1c1b1a] hover:text-white transition-all text-[11px] font-semibold"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: DECISION DETAIL (THE DEEP-DIVE WORKSPACE) */}
      {activeSubView === 'detail' && (
        <div className="space-y-6">
          {/* Back button & Action Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSubView('explorer')}
              className="flex items-center gap-1.5 text-xs text-[#838280] hover:text-[#1c1b1a] font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>&larr; Back to Decision Explorer</span>
            </button>

            {/* Sub-View Jump Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubView('timeline')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1dcd3] bg-white text-xs font-semibold hover:border-[#1c1b1a] transition-all shadow-xs"
              >
                <History className="w-3.5 h-3.5 text-[#2a72de]" />
                <span>View Timeline</span>
              </button>
              <button
                onClick={() => setActiveSubView('lineage')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1dcd3] bg-white text-xs font-semibold hover:border-[#1c1b1a] transition-all shadow-xs"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#2a72de]" />
                <span>View Lineage Graph</span>
              </button>
              <button
                onClick={() => setActiveSubView('impact')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1dcd3] bg-white text-xs font-semibold hover:border-[#1c1b1a] transition-all shadow-xs"
              >
                <Target className="w-3.5 h-3.5 text-[#e33a22]" />
                <span>Impact Analysis</span>
              </button>
            </div>
          </div>

          {/* Master Detail Card */}
          <div className="card-oura p-7 bg-white border border-[#e1dcd3] space-y-6 shadow-xs">
            {/* Title & Metadata Top Banner */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#f0ece4] pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#1c1b1a] bg-stone-100 px-2 py-0.5 rounded">
                    {currentDecision.code} · MERIDIANPAY
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#af751b] border border-amber-200">
                    {currentDecision.statusLabel}
                  </span>
                  <span className="text-xs text-[#838280]">
                    {currentDecision.decisionType}
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-normal text-[#1c1b1a]">
                  {currentDecision.title}
                </h2>
                <p className="text-xs text-[#7b776f] font-light">
                  {currentDecision.space} &bull; Owner: <strong>{currentDecision.owner}</strong> ({currentDecision.ownerRole})
                </p>
              </div>

              {/* Quick Date & Scope Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#fbfaf7] p-3 rounded-xl border border-[#e1dcd3]">
                <div>
                  <span className="text-[#838280] text-[10px] uppercase font-semibold block">First proposed</span>
                  <span className="font-semibold text-[#1c1b1a]">{currentDecision.firstProposedDate}</span>
                </div>
                <div>
                  <span className="text-[#838280] text-[10px] uppercase font-semibold block">Last revised</span>
                  <span className="font-semibold text-[#af751b]">{currentDecision.lastRevisedDate}</span>
                </div>
                <div>
                  <span className="text-[#838280] text-[10px] uppercase font-semibold block">Originating meeting</span>
                  <span className="font-semibold text-[#1c1b1a] truncate block max-w-[130px]">{currentDecision.originMeeting}</span>
                </div>
                <div>
                  <span className="text-[#838280] text-[10px] uppercase font-semibold block">Linked meetings</span>
                  <span className="font-semibold text-[#2a72de]">{currentDecision.linkedMeetingsCount} meetings</span>
                </div>
              </div>
            </div>

            {/* Decision Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#838280]">
                Decision summary
              </h4>
              <p className="text-sm text-[#1c1b1a] leading-relaxed font-normal bg-[#fdfbf7] p-4 rounded-xl border border-[#e1dcd3]">
                {currentDecision.summary}
              </p>
            </div>

            {/* Why was this decision made & Supporting Evidence */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#838280]">
                Why was this decision made?
              </h4>
              <p className="text-xs text-[#4a4741] leading-relaxed">
                {currentDecision.problemRationale}
              </p>

              {/* Exact Evidence Citation Box */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#2a72de]">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Supporting evidence · Transcript segment {currentDecision.evidence.segmentId}</span>
                  </div>
                  <button
                    onClick={handleOpenOriginMeeting}
                    className="text-[11px] font-semibold text-[#2a72de] hover:underline flex items-center gap-1"
                  >
                    <span>Open source meeting</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <blockquote className="text-xs text-[#1c1b1a] italic leading-relaxed pl-3 border-l-2 border-[#2a72de]">
                  &ldquo;{currentDecision.evidence.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 text-[11px] text-[#838280] pt-1">
                  <span><strong>{currentDecision.evidence.speaker}</strong> ({currentDecision.evidence.speakerRole})</span>
                  <span>&bull;</span>
                  <span>{currentDecision.evidence.meetingName}</span>
                  <span>&bull;</span>
                  <span>{currentDecision.evidence.meetingDate} · {currentDecision.evidence.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Decision History / Evolutionary Journey */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#838280]">
                  Decision history &amp; evolutionary journey
                </h4>
                <span className="text-[11px] text-[#838280]">
                  {currentDecision.history.length} auditable milestones
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e1dcd3]">
                {currentDecision.history.map((h) => (
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

            {/* What does this decision affect? */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#838280]">
                What does this decision affect?
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDecision.affectedWorkstreams.map((ws, idx) => (
                  <div key={idx} className="p-3.5 bg-[#fbfaf7] rounded-xl border border-[#e1dcd3] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1c1b1a]">📁 {ws.team}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        ws.status === 'Blocked' ? 'bg-red-100 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                      }`}>
                        {ws.status}
                      </span>
                    </div>
                    <p className="text-[#7b776f] font-light leading-relaxed">{ws.impact}</p>
                  </div>
                ))}
              </div>

              {/* Downstream Milestone Banner */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1b1a]">{currentDecision.downstreamMilestone.name}</span>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-[#af751b] px-2 py-0.2 rounded">
                      {currentDecision.downstreamMilestone.status}
                    </span>
                  </div>
                  <p className="text-[#4a4741]">
                    {currentDecision.downstreamMilestone.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubView('impact')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-all shrink-0 shadow-xs"
                >
                  Simulate Impact
                </button>
              </div>
            </div>

            {/* Action Tools / Follow-up Workflows */}
            <div className="pt-4 border-t border-[#f0ece4] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-[#838280]">
                {currentDecision.linkedMeetingsCount} evidence sources &bull; {currentDecision.affectedTeamsCount} linked teams &bull; {currentDecision.openDependenciesCount} open dependency
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerAction('revision', 'Propose Decision Revision')}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1b1a] text-white font-semibold hover:bg-[#39221e] transition-all shadow-xs"
                >
                  Propose Decision Revision
                </button>
                <button
                  onClick={() => handleTriggerAction('followup', 'Assign Follow-up Commitment')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#e1dcd3] text-[#1c1b1a] font-semibold hover:bg-stone-50 transition-all shadow-xs"
                >
                  Assign Follow-up
                </button>
                <button
                  onClick={() => handleTriggerAction('contradiction', 'Flag Inconsistency / Contradiction')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#e1dcd3] text-[#e33a22] font-semibold hover:bg-red-50 transition-all shadow-xs"
                >
                  Flag Contradiction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: DECISION TIMELINE */}
      {activeSubView === 'timeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1c1b1a] bg-stone-100 px-2 py-0.5 rounded">
                  {currentDecision.code}
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1c1b1a]">
                  Decision Timeline &amp; Evolution
                </h3>
              </div>
              <p className="text-xs text-[#7b776f] font-light mt-0.5">
                What happened, in what order, and what changed? Chronological sequence of meaningful events for {currentDecision.shortTitle}.
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('detail')}
              className="text-xs text-[#2a72de] font-semibold hover:underline"
            >
              Back to Decision Detail &rarr;
            </button>
          </div>

          {/* Timeline Cards */}
          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e1dcd3]">
            {currentDecision.history.map((ev) => (
              <div key={ev.step} className="card-oura p-5 bg-white border border-[#e1dcd3] space-y-2 relative shadow-xs">
                <span className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-white border-4 border-[#2a72de]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#2a72de]">{ev.step}.</span>
                    <span className="font-serif text-base font-normal text-[#1c1b1a]">{ev.phase}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded border ${ev.statusBadgeColor}`}>
                      {ev.statusBadge}
                    </span>
                  </div>
                  <span className="text-xs text-[#838280] font-medium">{ev.date} 2026</span>
                </div>

                <h4 className="text-xs font-semibold text-[#1c1b1a]">
                  {ev.title}
                </h4>

                <p className="text-xs text-[#4a4741] leading-relaxed">
                  {ev.description}
                </p>

                <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-[#838280]">
                  <span>Originating forum: <strong>{ev.meeting}</strong> &bull; Evidence: <strong>Segment {ev.evidenceId}</strong></span>
                  <button
                    onClick={handleOpenOriginMeeting}
                    className="text-[#2a72de] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Inspect transcript turn</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW D: IMPACT & DEPENDENCY ANALYSIS */}
      {activeSubView === 'impact' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1dcd3] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1c1b1a] bg-stone-100 px-2 py-0.5 rounded">
                  {currentDecision.code}
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1c1b1a]">
                  Impact &amp; Dependency Analysis
                </h3>
              </div>
              <p className="text-xs text-[#7b776f] font-light mt-0.5">
                If {currentDecision.shortTitle} changes, what else is affected? Focused dependency map distinguishing prerequisites, effects, supersessions, and mitigations.
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('detail')}
              className="text-xs text-[#2a72de] font-semibold hover:underline self-start sm:self-auto"
            >
              Back to Decision Detail &rarr;
            </button>
          </div>

          {/* Selected Decision Target Box */}
          <div className="card-oura p-5 bg-white border border-[#e1dcd3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
                SELECTED DECISION ROOT
              </span>
              <h4 className="font-serif text-xl font-normal text-[#1c1b1a] mt-1">
                {currentDecision.title}
              </h4>
              <p className="text-xs text-[#838280]">
                {currentDecision.code} &bull; Status: <strong>{currentDecision.statusLabel}</strong> &bull; Space: {currentDecision.space}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-[#af751b] border border-amber-200">
                {currentDecision.downstreamMilestone.status}
              </span>
            </div>
          </div>

          {/* Categorized Impact Relationships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDecision.dependencies.map((dep, idx) => {
              const typeBadges: Record<string, { bg: string; text: string }> = {
                'Depends on': { bg: 'bg-red-50 border-red-200', text: 'text-[#e33a22]' },
                'Affects': { bg: 'bg-blue-50 border-blue-200', text: 'text-[#2a72de]' },
                'Supersedes': { bg: 'bg-amber-50 border-amber-200', text: 'text-[#af751b]' },
                'Contradicts': { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
                'Evidence for': { bg: 'bg-stone-50 border-stone-200', text: 'text-[#4a4741]' },
                'Mitigates': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
              };

              const badge = typeBadges[dep.type] || { bg: 'bg-stone-50 border-stone-200', text: 'text-[#4a4741]' };

              return (
                <div key={idx} className="card-oura p-4 bg-white border border-[#e1dcd3] space-y-2 shadow-xs hover:border-[#2a72de] transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg} ${badge.text}`}>
                      {dep.type}
                    </span>
                    <span className="text-[11px] text-[#838280]">Team: <strong>{dep.team}</strong></span>
                  </div>

                  <h5 className="text-xs font-semibold text-[#1c1b1a]">
                    {dep.target}
                  </h5>

                  <p className="text-xs text-[#7b776f] font-light leading-relaxed">
                    {dep.relationshipReason}
                  </p>

                  <div className="pt-2 border-t border-[#f0ece4] flex items-center justify-between text-[11px] text-[#838280]">
                    <span>Established in: <strong>{dep.establishedInMeeting}</strong></span>
                    <span className="text-[#2a72de] font-semibold cursor-pointer hover:underline">Inspect link</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW E: FOCUSED LINEAGE GRAPH */}
      {activeSubView === 'lineage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e1dcd3] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1c1b1a] bg-stone-100 px-2 py-0.5 rounded">
                  {currentDecision.code}
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#1c1b1a]">
                  Focused Decision Lineage
                </h3>
              </div>
              <p className="text-xs text-[#7b776f] font-light mt-0.5">
                Directed graph: Origin on left &rarr; Initial Proposal &rarr; Approved Decision in center &rarr; Revisions &rarr; Downstream Outcomes on right.
              </p>
            </div>

            {/* Zoom & Fit Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-[#e1dcd3] rounded-lg p-1 text-xs shadow-xs">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                  className="p-1 hover:bg-stone-100 rounded text-[#4a4741]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] text-[#838280]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                  className="p-1 hover:bg-stone-100 rounded text-[#4a4741]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:bg-stone-100 rounded text-[#4a4741] border-l border-[#e1dcd3] ml-1 pl-1.5"
                  title="Reset Zoom"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setActiveSubView('detail')}
                className="text-xs text-[#2a72de] font-semibold hover:underline"
              >
                Back to Detail &rarr;
              </button>
            </div>
          </div>

          {/* Visual Directed Graph Canvas Container */}
          <div className="card-oura bg-white border border-[#e1dcd3] p-6 shadow-xs relative overflow-x-auto min-h-[460px]">
            {/* Color Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#838280] mb-6 pb-3 border-b border-[#f0ece4]">
              <span className="font-semibold text-[#1c1b1a]">Graph Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Incident / Origin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Initial Proposal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2a72de] ring-2 ring-blue-300" />
                <span>Selected Decision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Revision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Verified Downstream Outcome</span>
              </div>
            </div>

            {/* Directed Columns Grid */}
            <div
              className="flex items-center justify-between gap-6 min-w-[900px] transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            >
              {currentDecision.lineageNodes.map((n, idx) => {
                const isSelected = selectedLineageNode?.id === n.id || (n.type === 'decision' && !selectedLineageNode);
                return (
                  <React.Fragment key={n.id}>
                    {/* Node Card */}
                    <div
                      onClick={() => setSelectedLineageNode(n)}
                      className={`w-48 p-4 rounded-xl border bg-white shadow-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2a72de] ring-2 ring-blue-500/20 shadow-sm translate-y-[-2px]'
                          : 'border-[#e1dcd3] hover:border-[#838280]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${n.badgeColor}`}>
                          {n.badge}
                        </span>
                        <span className="text-[10px] text-[#838280]">{n.date}</span>
                      </div>
                      <h5 className="font-serif text-sm font-normal text-[#1c1b1a] mt-1">
                        {n.title}
                      </h5>
                      <p className="text-[11px] text-[#838280] mt-1 line-clamp-2">
                        {n.sub}
                      </p>
                    </div>

                    {/* Edge Connector */}
                    {idx < currentDecision.lineageNodes.length - 1 && (
                      <div className="flex flex-col items-center justify-center shrink-0 w-16">
                        <span className="text-[9px] font-mono font-bold text-[#838280] uppercase tracking-tighter mb-1 text-center">
                          {currentDecision.lineageEdges[idx]?.label || 'LINKS TO'}
                        </span>
                        <div className="flex items-center w-full">
                          <div className="h-0.5 bg-[#e1dcd3] flex-1" />
                          <ArrowRight className="w-3.5 h-3.5 text-[#2a72de] shrink-0" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Persistent Right-Side Node Inspector */}
            {selectedLineageNode && (
              <div className="mt-8 p-4 bg-[#fbfaf7] rounded-xl border border-[#e1dcd3] flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1b1a]">{selectedLineageNode.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-blue-50 text-[#2a72de]">
                      {selectedLineageNode.badge}
                    </span>
                  </div>
                  <p className="text-[#838280]">{selectedLineageNode.sub} &bull; Recorded date: {selectedLineageNode.date}</p>
                </div>
                <button
                  onClick={() => setSelectedLineageNode(null)}
                  className="text-xs text-[#838280] hover:text-[#1c1b1a]"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK ACTION MODAL (Revision, Follow-up, Contradiction) */}
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
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, title: '' })}
                className="text-[#838280] hover:text-[#1c1b1a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#7b776f]">
                Target decision: <strong>{currentDecision.code} · {currentDecision.shortTitle}</strong>
              </p>

              <div>
                <label className="font-semibold text-[#1c1b1a] block mb-1">
                  Proposed Description or Rationale:
                </label>
                <textarea
                  rows={3}
                  defaultValue={
                    actionModal.type === 'revision'
                      ? 'Propose extending idempotency key retention window to 72 hours based on delayed processor webhook findings.'
                      : actionModal.type === 'followup'
                      ? 'Assign Daniel Foster to verify Stripe SDK idempotency header propagation by 12 November.'
                      : 'Flag contradiction between exponential backoff retries and non-idempotent timeout failover routes.'
                  }
                  className="w-full p-2.5 text-xs rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1c1b1a] block mb-1">
                  Assignee / Reviewer:
                </label>
                <select className="w-full p-2 text-xs rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a]">
                  <option>Maya Chen (Product Manager)</option>
                  <option>Daniel Foster (Payments Lead)</option>
                  <option>Elena Petrova (Staff Backend Architect)</option>
                  <option>Priya Nair (SRE Lead)</option>
                  <option>Sarah Kim (Merchant Ops Lead)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-[11px] leading-relaxed">
                <strong>Human-in-the-Loop Governance</strong>: This action will be staged as a formal proposal requiring authorized reviewer confirmation before updating canonical database records.
              </div>
            </div>

            <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, title: '' })}
                className="px-3.5 py-1.5 rounded-lg border border-[#e1dcd3] text-[#4a4741] hover:bg-stone-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-1.5 rounded-lg bg-[#1c1b1a] text-white font-semibold hover:bg-[#39221e] shadow-xs"
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
