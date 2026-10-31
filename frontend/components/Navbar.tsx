'use client';

import React from 'react';
import { Space } from '@/types';
import {
  Compass,
  Layers,
  Search,
  Plus,
  RefreshCw,
  GitBranch,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string | null) => void;
  onOpenIngest: () => void;
  onOpenAsk: () => void;
  onResetSeed: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onOpenIngest,
  onOpenAsk,
  onResetSeed,
  isSeeding
}) => {
  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <header className="sticky top-0 z-40 bg-[#f7f1e8]/90 backdrop-blur-md border-b border-[#e1dcd3] px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Organization Context */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('command')}>
            <div className="w-8 h-8 rounded-full bg-[#1c1b1a] flex items-center justify-center text-[#f7f1e8]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-2xl font-normal tracking-tight text-[#1c1b1a]">CONFLUENCE</span>
              <span className="ml-2 text-[10px] tracking-widest uppercase font-semibold text-[#838280] border border-[#e1dcd3] px-1.5 py-0.5 rounded-full">
                Memory Network
              </span>
            </div>
          </div>

          {/* Space Selector Pill */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#e1dcd3]">
            <span className="text-xs font-medium text-[#838280]">Space:</span>
            <div className="relative inline-block">
              <select
                aria-label="Filter by Space"
                value={selectedSpaceId || 'all'}
                onChange={(e) => onSelectSpace(e.target.value === 'all' ? null : e.target.value)}
                className="bg-white border border-[#e1dcd3] text-[#1c1b1a] text-xs font-medium rounded-full px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#2a72de] shadow-sm cursor-pointer"
              >
                <option value="all">🌐 All Spaces (Organisational)</option>
                {spaces.map(s => (
                  <option key={s.id} value={s.id}>
                    📁 {s.name} ({s.space_type})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#838280]">
                <Layers className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs (Pill group) */}
        <nav className="hidden lg:flex items-center bg-[#ececec]/80 p-1 rounded-full border border-[#e1dcd3]">
          <button
            onClick={() => onSelectTab('command')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              currentTab === 'command'
                ? 'bg-white text-[#1c1b1a] shadow-sm font-semibold'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            Command Centre
          </button>
          <button
            onClick={() => onSelectTab('spaces')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              currentTab === 'spaces'
                ? 'bg-white text-[#1c1b1a] shadow-sm font-semibold'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            Spaces & Meetings
          </button>
          <button
            onClick={() => onSelectTab('graph')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              currentTab === 'graph'
                ? 'bg-white text-[#1c1b1a] shadow-sm font-semibold'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            Decision Network
          </button>
          <button
            onClick={() => onSelectTab('tasks')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              currentTab === 'tasks'
                ? 'bg-white text-[#1c1b1a] shadow-sm font-semibold'
                : 'text-[#4a4741] hover:text-[#1c1b1a]'
            }`}
          >
            Execution & Tasks
          </button>
        </nav>

        {/* Actions Group */}
        <div className="flex items-center gap-2.5">
          {/* Ask CONFLUENCE Query Button */}
          <button
            onClick={onOpenAsk}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#e1dcd3] text-[#1c1b1a] hover:bg-[#f7f1e8] hover:border-[#838280] shadow-sm transition-all"
            title="Ask Organizational Memory"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2a72de]" />
            <span className="hidden sm:inline">Ask CONFLUENCE</span>
          </button>

          {/* Ingest Meeting Button (Oura primary action blue) */}
          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Meeting</span>
          </button>

          {/* Reset/Seed Demo Button */}
          <button
            onClick={onResetSeed}
            disabled={isSeeding}
            title="Reset to hackathon demo scenario"
            className="p-1.5 rounded-full text-[#838280] hover:text-[#1c1b1a] hover:bg-white border border-transparent hover:border-[#e1dcd3] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-[#2a72de]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
