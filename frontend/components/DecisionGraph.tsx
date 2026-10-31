'use client';

import React, { useState, useMemo } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/types';
import {
  GitBranch,
  Layers,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Filter,
  CheckSquare
} from 'lucide-react';

interface DecisionGraphProps {
  graphData: GraphData;
  onSelectNode?: (node: GraphNode) => void;
}

export const DecisionGraph: React.FC<DecisionGraphProps> = ({ graphData, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoom, setZoom] = useState<number>(1);

  // Position nodes pseudo-organically in layout columns
  const layoutNodes = useMemo(() => {
    const nodes = graphData.nodes.filter(n => {
      if (filterType === 'all') return true;
      if (filterType === 'decisions') return n.type === 'decision';
      if (filterType === 'blockers') return n.type === 'blocker';
      if (filterType === 'spaces') return n.type === 'space';
      return true;
    });

    // Group by type for layered columns
    // Left: Spaces (col 1)
    // Middle-left: Meetings (col 2)
    // Center: Decisions & Tasks (col 3)
    // Right: Blockers & Cross-space effects (col 4)
    const spaces = nodes.filter(n => n.type === 'space');
    const meetings = nodes.filter(n => n.type === 'meeting');
    const decisions = nodes.filter(n => n.type === 'decision');
    const tasks = nodes.filter(n => n.type === 'task');
    const blockers = nodes.filter(n => n.type === 'blocker');

    const positioned: Record<string, { x: number; y: number; node: GraphNode }> = {};

    spaces.forEach((s, idx) => {
      positioned[s.id] = { x: 120, y: 140 + idx * 160, node: s };
    });

    meetings.forEach((m, idx) => {
      positioned[m.id] = { x: 380, y: 100 + idx * 140, node: m };
    });

    decisions.forEach((d, idx) => {
      positioned[d.id] = { x: 680, y: 80 + idx * 150, node: d };
    });

    tasks.forEach((t, idx) => {
      positioned[t.id] = { x: 960, y: 100 + idx * 140, node: t };
    });

    blockers.forEach((b, idx) => {
      positioned[b.id] = { x: 960, y: 340 + idx * 140, node: b };
    });

    return positioned;
  }, [graphData.nodes, filterType]);

  const nodeColor = (type: string, status?: string) => {
    switch (type) {
      case 'space':
        return { bg: '#ffffff', stroke: '#1c1b1a', text: '#1c1b1a', badge: 'bg-stone-100' };
      case 'meeting':
        return { bg: '#ffffff', stroke: '#5c6f5d', text: '#5c6f5d', badge: 'bg-emerald-50' };
      case 'decision':
        if (status === 'superseded') {
          return { bg: '#fbf8f4', stroke: '#af751b', text: '#af751b', badge: 'bg-amber-100' };
        }
        return { bg: '#ffffff', stroke: '#2a72de', text: '#2a72de', badge: 'bg-blue-50' };
      case 'task':
        return { bg: '#ffffff', stroke: '#4a4741', text: '#4a4741', badge: 'bg-stone-100' };
      case 'blocker':
        return { bg: '#ffffff', stroke: '#e33a22', text: '#e33a22', badge: 'bg-red-50' };
      default:
        return { bg: '#ffffff', stroke: '#838280', text: '#838280', badge: 'bg-gray-100' };
    }
  };

  const edgeColor = (type: string) => {
    switch (type) {
      case 'SUPERSEDES':
        return '#af751b'; // Gold
      case 'BLOCKS':
        return '#e33a22'; // Red
      case 'AFFECTS':
        return '#2a72de'; // Blue
      default:
        return '#cccac7'; // Hairline grey
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#838280]">
            Knowledge Graph
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#1c1b1a]">Decision Network & Lineage</h1>
          <p className="text-xs text-[#4a4741] mt-1 font-light">
            Interactive multi-space graph showing canonical decisions, supersessions, cross-team blockers, and commitments.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#e1dcd3] rounded-full p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full ${filterType === 'all' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterType('decisions')}
              className={`px-3 py-1 rounded-full ${filterType === 'decisions' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              Decisions
            </button>
            <button
              onClick={() => setFilterType('blockers')}
              className={`px-3 py-1 rounded-full ${filterType === 'blockers' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              Blockers
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#e1dcd3] rounded-full p-1">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              className="p-1.5 rounded-full hover:bg-stone-100 text-[#4a4741]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium px-1 text-[#838280]">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-1.5 rounded-full hover:bg-stone-100 text-[#4a4741]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 card-oura bg-[#fbf8f4] border border-[#e1dcd3] relative overflow-hidden h-[620px] rounded-xl shadow-inner">
          {/* Legend Pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-[#e1dcd3] px-3.5 py-1.5 rounded-full text-[11px]">
            <span className="flex items-center gap-1.5 text-[#af751b] font-medium">
              <span className="w-2.5 h-0.5 bg-[#af751b]" /> SUPERSEDES
            </span>
            <span className="flex items-center gap-1.5 text-[#e33a22] font-medium">
              <span className="w-2.5 h-0.5 bg-[#e33a22]" /> BLOCKS
            </span>
            <span className="flex items-center gap-1.5 text-[#2a72de] font-medium">
              <span className="w-2.5 h-0.5 bg-[#2a72de]" /> AFFECTS
            </span>
          </div>

          {/* SVG Canvas */}
          <svg
            className="w-full h-full transition-transform"
            viewBox="0 0 1150 650"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#838280" />
              </marker>
              <marker id="arrow-gold" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#af751b" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e33a22" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a72de" />
              </marker>
            </defs>

            {/* Render Edges */}
            {graphData.edges.map(edge => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const isSpecial = ['SUPERSEDES', 'BLOCKS', 'AFFECTS'].includes(edge.type);
              const color = edgeColor(edge.type);
              const marker = edge.type === 'SUPERSEDES' ? 'url(#arrow-gold)' : edge.type === 'BLOCKS' ? 'url(#arrow-red)' : edge.type === 'AFFECTS' ? 'url(#arrow-blue)' : 'url(#arrow)';

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
                  onClick={() => {
                    setSelectedNode(node);
                    if (onSelectNode) onSelectNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 32 : 26}
                    fill={colors.bg}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 3 : 1.8}
                    className="transition-all filter drop-shadow-sm group-hover:scale-110"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.text}
                    className="select-none pointer-events-none uppercase"
                  >
                    {node.type.slice(0, 3)}
                  </text>

                  {/* Node label */}
                  <text
                    textAnchor="middle"
                    dy="44"
                    fontSize="11"
                    fontWeight="500"
                    fill="#1c1b1a"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 24 ? node.label.slice(0, 24) + '...' : node.label}
                  </text>
                  {node.subtext && (
                    <text
                      textAnchor="middle"
                      dy="58"
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

        {/* Right Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4 card-oura p-6 bg-white flex flex-col justify-between h-[620px]">
          {selectedNode ? (
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {selectedNode.type} Details
                </span>
                <span className="text-xs text-[#838280]">{selectedNode.status || 'Active'}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-normal text-[#1c1b1a] leading-tight">
                  {selectedNode.label}
                </h3>
                {selectedNode.subtext && (
                  <p className="text-xs text-[#838280] mt-1">{selectedNode.subtext}</p>
                )}
              </div>

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div className="bg-[#f7f1e8] p-3.5 rounded-lg border border-[#e1dcd3] space-y-2 text-xs">
                  <span className="font-semibold text-[#1c1b1a] block">Metadata & Attributes:</span>
                  {Object.entries(selectedNode.metadata).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[#4a4741]">
                      <span className="capitalize">{k}:</span>
                      <span className="font-medium truncate max-w-[180px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connected edges for selected node */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#1c1b1a] block mb-2">Connected Relationships:</span>
                <div className="space-y-2">
                  {graphData.edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map(e => (
                      <div key={e.id} className="p-2.5 bg-stone-50 rounded-lg text-xs flex items-center justify-between border border-[#e1dcd3]">
                        <span className="font-bold text-[#af751b]">{e.type}</span>
                        <span className="text-[11px] text-[#838280]">{e.label || 'Connection'}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#838280] space-y-2">
              <Info className="w-8 h-8 opacity-40" />
              <h4 className="font-serif text-lg text-[#1c1b1a]">Node Inspector</h4>
              <p className="text-xs max-w-xs">
                Click any node on the graph to inspect its evidence trail, supersessions, and dependencies.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#e1dcd3] text-[11px] text-[#838280]">
            Connections are verified by Postgres foreign keys. Evidence spans are audited.
          </div>
        </div>
      </div>
    </div>
  );
};

