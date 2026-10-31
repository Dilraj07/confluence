'use client';

import React, { useState, useEffect } from 'react';
import { Space, Meeting, Decision, Task, Blocker, MetricsSummary, GraphData } from '@/types';
import { api } from '@/lib/api';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

import { OverviewView } from '@/components/views/OverviewView';
import { SpacesView } from '@/components/views/SpacesView';
import { MeetingsView } from '@/components/views/MeetingsView';
import { KnowledgeView } from '@/components/views/KnowledgeView';
import { DecisionDetailView } from '@/components/views/DecisionDetailView';
import { MyWorkView } from '@/components/views/MyWorkView';
import { AskConfluenceView } from '@/components/views/AskConfluenceView';
import { SettingsView } from '@/components/views/SettingsView';
import { MeetingDetailView } from '@/components/views/MeetingDetailView';

import { IngestMeetingModal } from '@/components/IngestMeetingModal';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { AskConfluenceModal } from '@/components/AskConfluenceModal';
import { MeetingDetailModal } from '@/components/MeetingDetailModal';
import { DecisionTrailModal } from '@/components/DecisionTrailModal';

export default function WorkspacePage() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Modals & Active Records state
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');
  const [reviewMeetingId, setReviewMeetingId] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [activeDecisionId, setActiveDecisionId] = useState<string>('dec-014');
  const [activeMeetingDetail, setActiveMeetingDetail] = useState<Meeting | null>(null);
  const [activeDecisionTrail, setActiveDecisionTrail] = useState<Decision | null>(null);

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || null;

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        spacesRes,
        meetingsRes,
        decisionsRes,
        tasksRes,
        blockersRes,
        metricsRes,
        graphRes
      ] = await Promise.all([
        api.getSpaces().catch(() => []),
        api.getMeetings(selectedSpaceId || undefined).catch(() => []),
        api.getDecisions(selectedSpaceId || undefined).catch(() => []),
        api.getTasks(selectedSpaceId || undefined).catch(() => []),
        api.getBlockers(selectedSpaceId || undefined).catch(() => []),
        api.getMetrics(selectedSpaceId || undefined).catch(() => null),
        api.getGraph(selectedSpaceId || undefined).catch(() => ({ nodes: [], edges: [] })),
      ]);

      setSpaces(spacesRes);
      setMeetings(meetingsRes);
      setDecisions(decisionsRes);
      setTasks(tasksRes);
      setBlockers(blockersRes);
      setMetrics(metricsRes);
      setGraphData(graphRes);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSpaceId]);

  // Global ⌘K / Ctrl+K keyboard shortcut to open Ask CONFLUENCE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentView('ask');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetSeed = async () => {
    try {
      setIsSeeding(true);
      await api.seedDemo();
      await loadData();
      setIsSeeding(false);
    } catch {
      setIsSeeding(false);
    }
  };

  const handleOpenAskWithPrompt = (prompt?: string) => {
    if (prompt) {
      setAskInitialQuery(prompt);
    }
    setCurrentView('ask');
  };

  const handleOpenDecision = (decisionId: string) => {
    setActiveDecisionId(decisionId);
    setCurrentView('decision-detail');
  };

  // Compute breadcrumbs and title based on current view
  const getViewMeta = () => {
    switch (currentView) {
      case 'overview':
      case 'home':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Overview' }],
          title: 'Overview',
          subtitle: 'Prioritised attention, important organisational changes, and pending actions.'
        };
      case 'spaces':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Spaces' }, { label: selectedSpace?.name || 'All Spaces' }],
          title: selectedSpace ? `${selectedSpace.name} Space` : 'Spaces',
          subtitle: selectedSpace?.description || 'Scoped organizational memory for teams and projects.'
        };
      case 'meetings':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Meetings' }],
          title: 'Meetings',
          subtitle: 'Searchable meeting repository with verbatim turn-by-turn evidence citations.'
        };
      case 'meeting-detail':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Meetings' }, { label: 'Meeting Detail' }],
          title: 'Meeting Detail',
          subtitle: 'Discussions, decisions, actions, blockers, and turn-by-turn searchable transcript.'
        };
      case 'decisions':
      case 'knowledge':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Decision Explorer' }],
          title: 'Decision Explorer',
          subtitle: 'Trace decisions, understand their evolution, and investigate their impact.'
        };
      case 'decision-detail':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Decision Explorer' }, { label: 'Decision Detail' }],
          title: 'Decision Detail',
          subtitle: 'Single canonical record answering origin, evidence, version history, and downstream impact.'
        };
      case 'my-work':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'My Work' }],
          title: 'My Work',
          subtitle: 'Personalized commitments and execution tracking for Maya Chen.'
        };
      case 'ask':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Ask CONFLUENCE' }],
          title: 'Ask CONFLUENCE',
          subtitle: 'Conversational search with cited evidence and Wispr Flow voice integration.'
        };
      case 'settings':
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'Settings' }],
          title: 'Settings',
          subtitle: 'Workspace profile, space sensitivity permissions, and scenario reset.'
        };
      default:
        return {
          breadcrumbs: [{ label: 'MeridianPay' }, { label: 'CONFLUENCE' }],
          title: 'Workspace',
          subtitle: ''
        };
    }
  };

  const viewMeta = getViewMeta();

  return (
    <div className="flex h-screen bg-[#f7f1e8] text-[#1c1b1a] overflow-hidden font-sans">
      {/* 1. Persistent Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={(sId) => setSelectedSpaceId(sId)}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenAsk={() => setCurrentView('ask')}
      />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Contextual Top Header */}
        <Header
          breadcrumbs={viewMeta.breadcrumbs}
          title={viewMeta.title}
          subtitle={viewMeta.subtitle}
          selectedSpace={selectedSpace}
          onOpenIngest={() => setIsIngestOpen(true)}
          onOpenAsk={() => setCurrentView('ask')}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-6 py-2">
          {loading && !metrics ? (
            <div className="max-w-md mx-auto my-32 card-oura p-8 text-center bg-white border border-[#e1dcd3]">
              <span className="inline-block w-6 h-6 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-3" />
              <h3 className="font-serif text-xl text-[#1c1b1a]">Connecting to Workspace Memory</h3>
              <p className="text-xs text-[#838280] mt-1 font-light">Loading canonical records and decision networks...</p>
            </div>
          ) : (
            <>
              {(currentView === 'overview' || currentView === 'home') && (
                <OverviewView
                  decisions={decisions}
                  meetings={meetings}
                  tasks={tasks}
                  blockers={blockers}
                  spaces={spaces}
                  selectedSpace={selectedSpace}
                  onOpenDecision={handleOpenDecision}
                  onOpenMeeting={(m) => {
                    setActiveMeetingId(m.id);
                    setCurrentView('meeting-detail');
                  }}
                  onNavigateToView={(v) => setCurrentView(v)}
                  onOpenAskWithPrompt={handleOpenAskWithPrompt}
                />
              )}

              {currentView === 'spaces' && (
                <SpacesView
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  onSelectSpace={(sId) => setSelectedSpaceId(sId)}
                  meetings={meetings}
                  decisions={decisions}
                  tasks={tasks}
                  blockers={blockers}
                  onOpenMeeting={(m) => {
                    setActiveMeetingId(m.id);
                    setCurrentView('meeting-detail');
                  }}
                  onOpenDecision={handleOpenDecision}
                  onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                  onOpenCandidates={(mId) => setReviewMeetingId(mId)}
                  onOpenIngest={() => setIsIngestOpen(true)}
                />
              )}

              {currentView === 'meetings' && (
                <MeetingsView
                  meetings={meetings}
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  onOpenMeeting={(m) => {
                    setActiveMeetingId(m.id);
                    setCurrentView('meeting-detail');
                  }}
                  onOpenCandidates={(mId) => setReviewMeetingId(mId)}
                  onOpenIngest={() => setIsIngestOpen(true)}
                />
              )}

              {currentView === 'meeting-detail' && activeMeetingId && (
                <MeetingDetailView
                  meetingId={activeMeetingId}
                  onBack={() => setCurrentView('meetings')}
                  onOpenDecision={handleOpenDecision}
                  onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                  onOpenCandidates={(mId) => setReviewMeetingId(mId)}
                  onOpenConnectedMeeting={(connId) => setActiveMeetingId(connId)}
                  onAskAboutMeeting={(prompt) => {
                    setAskInitialQuery(prompt);
                    setCurrentView('ask');
                  }}
                />
              )}

              {(currentView === 'decisions' || currentView === 'knowledge') && (
                <KnowledgeView
                  graphData={graphData}
                  decisions={decisions}
                  meetings={meetings}
                  spaces={spaces}
                  onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                  onOpenMeeting={(m) => {
                    setActiveMeetingId(m.id);
                    setCurrentView('meeting-detail');
                  }}
                  onOpenDecisionDetail={handleOpenDecision}
                />
              )}

              {currentView === 'decision-detail' && (
                <DecisionDetailView
                  decisionId={activeDecisionId}
                  onBack={() => setCurrentView('decisions')}
                  onOpenMeeting={(mId) => {
                    setActiveMeetingId(mId);
                    setCurrentView('meeting-detail');
                  }}
                  onNavigateToView={(v) => setCurrentView(v)}
                />
              )}

              {currentView === 'my-work' && (
                <MyWorkView
                  tasks={tasks}
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  onOpenIngest={() => setIsIngestOpen(true)}
                  onOpenMeeting={(mId) => {
                    setActiveMeetingId(mId);
                    setCurrentView('meeting-detail');
                  }}
                  onOpenDecision={handleOpenDecision}
                />
              )}

              {currentView === 'ask' && (
                <AskConfluenceView
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  initialQuery={askInitialQuery}
                  onOpenMeeting={(meetingId) => {
                    setActiveMeetingId(meetingId);
                    setCurrentView('meeting-detail');
                  }}
                  onOpenDecision={handleOpenDecision}
                  onNavigateToView={(v) => {
                    loadData();
                    setCurrentView(v);
                  }}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  spaces={spaces}
                  onResetSeed={handleResetSeed}
                  isSeeding={isSeeding}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Global Action & Review Modals */}
      <IngestMeetingModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onIngestSuccess={(mId) => {
          loadData();
          setReviewMeetingId(mId);
        }}
      />

      {reviewMeetingId && (
        <CandidateReviewModal
          isOpen={!!reviewMeetingId}
          onClose={() => setReviewMeetingId(null)}
          meetingId={reviewMeetingId}
          onApproved={() => loadData()}
        />
      )}

      <AskConfluenceModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        initialQuery={askInitialQuery}
      />

      <MeetingDetailModal
        isOpen={!!activeMeetingDetail}
        onClose={() => setActiveMeetingDetail(null)}
        meeting={activeMeetingDetail}
      />

      <DecisionTrailModal
        isOpen={!!activeDecisionTrail}
        onClose={() => setActiveDecisionTrail(null)}
        decision={activeDecisionTrail}
        allDecisions={decisions}
      />
    </div>
  );
}
