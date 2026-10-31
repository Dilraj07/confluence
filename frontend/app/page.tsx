'use client';

import React, { useState, useEffect } from 'react';
import { Space, Meeting, Decision, Task, Blocker, MetricsSummary, GraphData } from '@/types';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { CommandCentre } from '@/components/CommandCentre';
import { SpaceView } from '@/components/SpaceView';
import { DecisionGraph } from '@/components/DecisionGraph';
import { TaskTracker } from '@/components/TaskTracker';
import { IngestMeetingModal } from '@/components/IngestMeetingModal';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { AskConfluenceModal } from '@/components/AskConfluenceModal';
import { MeetingDetailModal } from '@/components/MeetingDetailModal';
import { DecisionTrailModal } from '@/components/DecisionTrailModal';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('command');
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
  const [isAskOpen, setIsAskOpen] = useState<boolean>(false);
  const [askInitialQuery, setAskInitialQuery] = useState<string>('');
  const [reviewMeetingId, setReviewMeetingId] = useState<string | null>(null);
  const [activeMeetingDetail, setActiveMeetingDetail] = useState<Meeting | null>(null);
  const [activeDecisionTrail, setActiveDecisionTrail] = useState<Decision | null>(null);

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

  const handleOpenAskWithQuery = (prompt: string) => {
    setAskInitialQuery(prompt);
    setIsAskOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#1c1b1a] flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={setSelectedSpaceId}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenAsk={() => {
          setAskInitialQuery('');
          setIsAskOpen(true);
        }}
        onResetSeed={handleResetSeed}
        isSeeding={isSeeding}
      />

      <main className="flex-1 px-4 md:px-6">
        {loading && !metrics ? (
          <div className="max-w-xl mx-auto my-24 card-oura p-10 text-center bg-white">
            <span className="inline-block w-6 h-6 border-2 border-[#2a72de] border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="font-serif text-2xl text-[#1c1b1a]">Connecting to Organisational Memory</h2>
            <p className="text-xs text-[#838280] mt-1.5 font-light">
              Loading spaces, decision networks, and verified citations...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'command' && (
              <CommandCentre
                metrics={metrics}
                decisions={decisions}
                tasks={tasks}
                blockers={blockers}
                spaces={spaces}
                selectedSpaceId={selectedSpaceId}
                onOpenDecisionTrail={(d) => setActiveDecisionTrail(d)}
                onOpenAskLaunchRisk={() =>
                  handleOpenAskWithQuery('What is putting the Platform Launch at risk?')
                }
                onReviewPending={() => {
                  const meetingWithPending = meetings[0]?.id;
                  if (meetingWithPending) setReviewMeetingId(meetingWithPending);
                }}
              />
            )}

            {currentTab === 'spaces' && (
              <SpaceView
                spaces={spaces}
                selectedSpaceId={selectedSpaceId}
                onSelectSpace={(id) => setSelectedSpaceId(id)}
                meetings={meetings}
                decisions={decisions}
                tasks={tasks}
                blockers={blockers}
                onOpenMeeting={(m) => setActiveMeetingDetail(m)}
                onOpenCandidates={(mId) => setReviewMeetingId(mId)}
                onOpenIngest={() => setIsIngestOpen(true)}
              />
            )}

            {currentTab === 'graph' && (
              <DecisionGraph
                graphData={graphData}
                onSelectNode={(node) => {
                  if (node.type === 'decision') {
                    const dec = decisions.find(d => d.id === node.id);
                    if (dec) setActiveDecisionTrail(dec);
                  }
                }}
              />
            )}

            {currentTab === 'tasks' && (
              <TaskTracker
                tasks={tasks}
                spaces={spaces}
                selectedSpaceId={selectedSpaceId}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
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
        isOpen={isAskOpen}
        onClose={() => setIsAskOpen(false)}
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
