'use client';

import React, { useState, useMemo } from 'react';
import { GraphData, GraphNode, Decision, Meeting, Space } from '@/types';
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Quote,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface KnowledgeViewProps {
  graphData: GraphData;
  decisions: Decision[];
  meetings: Meeting[];
  spaces: Space[];
  onOpenDecisionTrail: (decision: Decision) => void;
  onOpenMeeting: (meeting: Meeting) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  graphData,
  decisions,
  meetings,
  spaces,
  onOpenDecisionTrail,
  onOpenMeeting
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(1);

  // Position nodes pseudo-organically in columns so it fills the canvas nicely
  const layoutNodes = useMemo(() => {
    const nodes = graphData.nodes.filter(n => {
      if (filterType === 'all') return true;
      if (filterType === 'decisions') return n.type === 'decision';
      if (filterType === 'blockers') return n.type === 'blocker';
      if (filterType === 'spaces') return n.type === 'space';
      return true;
    });

    const spacesList = nodes.filter(n => n.type === 'space');
    const meetingsList = nodes.filter(n => n.type === 'meeting');
    const decisionsList = nodes.filter(n => n.type === 'decision');
    const tasksList = nodes.filter(n => n.type === 'task');
    const blockersList = nodes.filter(n => n.type === 'blocker');

    const positioned: Record<string, { x: number; y: number; node: GraphNode }> = {};

    spacesList.forEach((s, idx) => {
      positioned[s.id] = { x: 140, y: 150 + idx * 170, node: s };
    });

    meetingsList.forEach((m, idx) => {
      positioned[m.id] = { x: 420, y: 110 + idx * 140, node: m };
    });

    decisionsList.forEach((d, idx) => {
      positioned[d.id] = { x: 740, y: 90 + idx * 150, node: d };
    });

    tasksList.forEach((t, idx) => {
      positioned[t.id] = { x: 1040, y: 110 + idx * 140, node: t };
    });

    blockersList.forEach((b, idx) => {
      positioned[b.id] = { x: 1040, y: 350 + idx * 150, node: b };
    });

    return positioned;
  }, [graphData.nodes, filterType]);

  // Find rich metadata for selected node
  const activeDecision = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'decision') return null;
    return decisions.find(d => d.id === selectedNode.id) || null;
  }, [selectedNode, decisions]);

  const activeMeeting = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.type === 'meeting') {
      return meetings.find(m => m.id === selectedNode.id) || null;
    }
    if (activeDecision) {
      return meetings.find(m => m.id === activeDecision.meeting_id) || null;
    }
    return null;
  }, [selectedNode, activeDecision, meetings]);

  const nodeColor = (type: string, status?: string) => {
    switch (type) {
      case 'space':
        return { bg: '#ffffff', stroke: '#1c1b1a', text: '#1c1b1a', fill: '#1c1b1a' };
      case 'meeting':
        return { bg: '#ffffff', stroke: '#5c6f5d', text: '#5c6f5d', fill: '#5c6f5d' };
      case 'decision':
        if (status === 'superseded') {
          return { bg: '#fdfbf7', stroke: '#af751b', text: '#af751b', fill: '#af751b' };
        }
        return { bg: '#ffffff', stroke: '#2a72de', text: '#2a72de', fill: '#2a72de' };
      case 'task':
        return { bg: '#ffffff', stroke: '#4a4741', text: '#4a4741', fill: '#4a4741' };
      case 'blocker':
        return { bg: '#ffffff', stroke: '#e33a22', text: '#e33a22', fill: '#e33a22' };
      default:
        return { bg: '#ffffff', stroke: '#838280', text: '#838280', fill: '#838280' };
    }
  };

  const edgeColor = (type: string) => {
    switch (type) {
      case 'SUPERSEDES':
        return '#af751b';
      case 'BLOCKS':
        return '#e33a22';
      case 'AFFECTS':
        return '#2a72de';
      default:
        return '#d3cebe';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto py-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
            Decision Network & Knowledge Graph
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Interactive organizational graph connecting canonical decisions, supersessions, cross-team blockers, and commitments.
          </p>
        </div>

        {/* Filter Pills & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#e1dcd3] rounded-lg p-1 text-xs shadow-xs">
            {['all', 'decisions', 'blockers', 'spaces'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-md capitalize transition-all ${
                  filterType === f
                    ? 'bg-[#1c1b1a] text-white font-medium'
                    : 'text-[#4a4741] hover:text-[#1c1b1a]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-[#e1dcd3] rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              className="p-1.5 rounded hover:bg-stone-100 text-[#4a4741]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-[#838280]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1.5 rounded hover:bg-stone-100 text-[#4a4741]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 rounded hover:bg-stone-100 text-[#838280]"
              title="Reset Zoom"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas and Contextual Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 card-oura bg-[#fbfaf7] border border-[#e1dcd3] relative h-[650px] overflow-hidden rounded-xl shadow-inner">
          {/* Legend pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-[#e1dcd3] px-3.5 py-1.5 rounded-lg text-[11px] shadow-xs">
            <span className="flex items-center gap-1.5 text-[#af751b] font-medium">
              <span className="w-3 h-0.5 bg-[#af751b]" /> SUPERSEDES
            </span>
            <span className="flex items-center gap-1.5 text-[#e33a22] font-medium">
              <span className="w-3 h-0.5 bg-[#e33a22]" /> BLOCKS
            </span>
            <span className="flex items-center gap-1.5 text-[#2a72de] font-medium">
              <span className="w-3 h-0.5 bg-[#2a72de]" /> AFFECTS
            </span>
          </div>

          <svg
            className="w-full h-full"
            viewBox="0 0 1250 680"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            <defs>
              <marker id="arrow-gold" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#af751b" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e33a22" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a72de" />
              </marker>
              <marker id="arrow-gray" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#838280" />
              </marker>
            </defs>

            {/* Render Edges */}
            {graphData.edges.map((edge) => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const isSpecial = ['SUPERSEDES', 'BLOCKS', 'AFFECTS'].includes(edge.type);
              const color = edgeColor(edge.type);
              const marker =
                edge.type === 'SUPERSEDES'
                  ? 'url(#arrow-gold)'
                  : edge.type === 'BLOCKS'
                  ? 'url(#arrow-red)'
                  : edge.type === 'AFFECTS'
                  ? 'url(#arrow-blue)'
                  : 'url(#arrow-gray)';

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={color}
                    strokeWidth={isSpecial ? 2.5 : 1.2}
                    strokeDasharray={edge.type === 'SUPERSEDES' ? '5 3' : undefined}
                    markerEnd={marker}
                    className="transition-all"
                  />
                  {isSpecial && (
                    <text
                      x={midX}
                      y={midY - 6}
                      fill={color}
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                      className="select-none bg-white font-sans"
                    >
                      {edge.label || edge.type}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {Object.values(layoutNodes).map(({ x, y, node }) => {
              const colors = nodeColor(node.type, node.status);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 30 : 25}
                    fill={colors.bg}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 3 : 1.8}
                    className="transition-all filter drop-shadow-xs group-hover:scale-105"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="10"
                    fontWeight="700"
                    fill={colors.fill}
                    className="select-none pointer-events-none uppercase tracking-wider"
                  >
                    {node.type.slice(0, 3)}
                  </text>

                  {/* Label */}
                  <text
                    textAnchor="middle"
                    dy="42"
                    fontSize="11"
                    fontWeight="500"
                    fill="#1c1b1a"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 28 ? node.label.slice(0, 28) + '...' : node.label}
                  </text>
                  {node.subtext && (
                    <text
                      textAnchor="middle"
                      dy="56"
                      fontSize="9"
                      fill="#838280"
                      className="select-none pointer-events-none"
                    >
                      {node.subtext}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Contextual Inspector Pane (4 cols) */}
        <div className="lg:col-span-4 card-oura p-6 bg-white border border-[#e1dcd3] flex flex-col justify-between h-[650px] shadow-xs">
          {selectedNode ? (
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
                  {selectedNode.type} Node
                </span>
                <span className="text-xs text-[#838280] font-medium capitalize">
                  {selectedNode.status || 'Active'}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-normal text-[#1c1b1a] leading-snug">
                  {selectedNode.label}
                </h3>
                {selectedNode.subtext && (
                  <p className="text-xs text-[#838280] mt-1">{selectedNode.subtext}</p>
                )}
              </div>

              {/* Source Meeting */}
              {activeMeeting && (
                <div
                  onClick={() => onOpenMeeting(activeMeeting)}
                  className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3] hover:border-[#838280] cursor-pointer transition-all space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[#838280] text-[10px] uppercase font-bold">
                    <span>Source Meeting</span>
                    <span>{new Date(activeMeeting.meeting_date).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-[#1c1b1a]">{activeMeeting.title}</div>
                </div>
              )}

              {/* Verified Evidence Quote */}
              {activeDecision && activeDecision.evidence_items && activeDecision.evidence_items.length > 0 && (
                <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/80 space-y-1.5 text-xs text-[#1c1b1a]">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#af751b]">
                    <Quote className="w-3 h-3" />
                    <span>Verified Transcript Evidence</span>
                  </div>
                  <p className="italic text-[#4a4741]">&ldquo;{activeDecision.evidence_items[0].quote}&rdquo;</p>
                  <div className="text-[10px] text-[#838280] pt-0.5">
                    Attributed to: <strong>{activeDecision.evidence_items[0].speaker_name || activeDecision.decided_by}</strong>
                  </div>
                </div>
              )}

              {/* Connected Relationships */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-[#1c1b1a] block">
                  Relationships & Dependencies:
                </span>
                <div className="space-y-2">
                  {graphData.edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((e) => (
                      <div
                        key={e.id}
                        className="p-2.5 bg-[#fbfaf7] rounded-md border border-[#e1dcd3] text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-[#af751b]">{e.type}</span>
                        <span className="text-[11px] text-[#838280]">{e.label || 'Connection'}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Supersession History if Decision */}
              {activeDecision && (
                <button
                  onClick={() => onOpenDecisionTrail(activeDecision)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-[#39221e] transition-all"
                >
                  <GitBranch className="w-3.5 h-3.5 text-[#ddaa61]" />
                  <span>Inspect Full Decision Lineage</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#838280] space-y-2">
              <Info className="w-8 h-8 opacity-40 text-[#838280]" />
              <h4 className="font-serif text-lg text-[#1c1b1a]">Node Inspector</h4>
              <p className="text-xs max-w-xs text-[#7b776f]">
                Select any decision, meeting, blocker or space node on the canvas to inspect evidence, relationships, and supersession lineage.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#e1dcd3] text-[11px] text-[#838280]">
            Database verified • Edges represent explicit relationships, not access permissions.
          </div>
        </div>
      </div>
    </div>
  );
};
