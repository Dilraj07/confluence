'use client';

import React, { useState, useEffect } from 'react';
import { Space, Meeting, Decision, Task, Blocker, MetricsSummary, GraphData } from '@/types';
import { api } from '@/lib/api';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

import { HomeView } from '@/components/views/HomeView';
import { SpacesView } from '@/components/views/SpacesView';
import { MeetingsView } from '@/components/views/MeetingsView';
import { KnowledgeView } from '@/components/views/KnowledgeView';
import { MyWorkView } from '@/components/views/MyWorkView';
import { AskConfluenceView } from '@/components/views/AskConfluenceView';
import { SettingsView } from '@/components/views/SettingsView';

import { IngestMeetingModal } from '@/components/IngestMeetingModal';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { AskConfluenceModal } from '@/components/AskConfluenceModal';
import { MeetingDetailModal } from '@/components/MeetingDetailModal';
import { DecisionTrailModal } from '@/components/DecisionTrailModal';

export default function WorkspacePage() {
  const [currentView, setCurrentView] = useState<string>('home');
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

  // Modals state
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');
  const [reviewMeetingId, setReviewMeetingId] = useState<string | null>(null);
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
      setCurrentView('ask');
    } else {
      setIsAskModalOpen(true);
    }
  };

  // Compute breadcrumbs and title based on current view
  const getViewMeta = () => {
    switch (currentView) {
      case 'home':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Workspace Home' }],
          title: 'Workspace Overview',
          subtitle: 'Connected organizational context, decisions, commitments, and blockers.'
        };
      case 'spaces':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Spaces' }, { label: selectedSpace?.name || 'All Spaces' }],
          title: selectedSpace ? `${selectedSpace.name} Space` : 'Collaborative Spaces',
          subtitle: selectedSpace?.description || 'Scoped organizational memory for teams and projects.'
        };
      case 'meetings':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Meetings' }],
          title: 'Meetings & Transcripts',
          subtitle: 'Turn-by-turn transcript logs with stable evidence segment citations.'
        };
      case 'knowledge':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Knowledge Graph' }],
          title: 'Decision Network',
          subtitle: 'Interactive map of decisions, commitments, blockers, and cross-team dependencies.'
        };
      case 'my-work':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'My Work' }],
          title: 'Execution & Commitments',
          subtitle: 'Track commitments, assigned tasks, and delivery milestones directly tied to meetings.'
        };
      case 'ask':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Ask CONFLUENCE' }],
          title: 'Ask CONFLUENCE',
          subtitle: 'Natural language and Wispr Flow voice search across organizational memory.'
        };
      case 'settings':
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'Settings' }],
          title: 'Settings & Administration',
          subtitle: 'Workspace profile, space sensitivity permissions, and scenario reset.'
        };
      default:
        return {
          breadcrumbs: [{ label: 'Acme Cloud' }, { label: 'CONFLUENCE' }],
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
        onOpenAsk={() => setIsAskModalOpen(true)}
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
          onOpenAsk={() => setIsAskModalOpen(true)}
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
              {currentView === 'home' && (
                <HomeView
                  decisions={decisions}
                  meetings={meetings}
                  tasks={tasks}
                  blockers={blockers}
                  spaces={spaces}
                  selectedSpace={selectedSpace}
                  onOpenAskWithPrompt={handleOpenAskWithPrompt}
                  onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                  onOpenMeeting={(m) => setActiveMeetingDetail(m)}
                  onReviewPending={() => {
                    const firstMeeting = meetings[0]?.id;
                    if (firstMeeting) setReviewMeetingId(firstMeeting);
                  }}
                  onNavigateToView={(v) => setCurrentView(v)}
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
                  onOpenMeeting={(m) => setActiveMeetingDetail(m)}
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
                  onOpenMeeting={(m) => setActiveMeetingDetail(m)}
                  onOpenCandidates={(mId) => setReviewMeetingId(mId)}
                  onOpenIngest={() => setIsIngestOpen(true)}
                />
              )}

              {currentView === 'knowledge' && (
                <KnowledgeView
                  graphData={graphData}
                  decisions={decisions}
                  meetings={meetings}
                  spaces={spaces}
                  onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                  onOpenMeeting={(m) => setActiveMeetingDetail(m)}
                />
              )}

              {currentView === 'my-work' && (
                <MyWorkView
                  tasks={tasks}
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  onOpenIngest={() => setIsIngestOpen(true)}
                />
              )}

              {currentView === 'ask' && (
                <AskConfluenceView
                  spaces={spaces}
                  selectedSpaceId={selectedSpaceId}
                  initialQuery={askInitialQuery}
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
