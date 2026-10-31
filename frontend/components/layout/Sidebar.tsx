'use client';

import React from 'react';
import { Space } from '@/types';
import {
  Home,
  Layers,
  Calendar,
  Network,
  GitBranch,
  CheckSquare,
  Sparkles,
  Settings,
  ChevronDown,
  Compass,
  Folder,
  Circle,
  ExternalLink,
  Plus
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string | null) => void;
  onOpenIngest: () => void;
  onOpenAsk: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onOpenIngest,
  onOpenAsk
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'spaces', label: 'Spaces', icon: Layers },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'decisions', label: 'Decision Explorer', icon: GitBranch },
    { id: 'my-work', label: 'My Work', icon: CheckSquare },
    { id: 'ask', label: 'Ask CONFLUENCE', icon: Sparkles, accent: true },
  ];

  return (
    <aside className="w-64 bg-[#fbfaf7] border-r border-[#e1dcd3] flex flex-col justify-between h-screen sticky top-0 select-none">
      {/* Top: Organisation Switcher & Brand */}
      <div className="flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-3.5 border-b border-[#e1dcd3]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e1dcd3] shadow-xs hover:border-[#838280] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#1c1b1a] text-[#f7f1e8] flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                M
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1c1b1a] truncate leading-tight">
                  MeridianPay
                </div>
                <div className="text-[10px] text-[#838280] truncate leading-tight">
                  Smart Routing v2
                </div>
              </div>
            </div>
            <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
              Sync
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1c1b1a] shadow-xs font-semibold border border-[#e1dcd3]'
                    : 'text-[#4a4741] hover:text-[#1c1b1a] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      item.accent
                        ? 'text-[#2a72de]'
                        : isActive
                        ? 'text-[#1c1b1a]'
                        : 'text-[#838280]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.id === 'ask' && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-blue-50 text-[#2a72de] px-1.5 py-0.2 rounded-full">
                    Voice
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Scoped Spaces List */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#838280]">
              Active Spaces
            </span>
            <button
              onClick={() => onSelectView('spaces')}
              className="text-[10px] text-[#2a72de] hover:underline font-semibold"
            >
              All ({spaces.length})
            </button>
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5">
            <button
              onClick={() => onSelectSpace(null)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                selectedSpaceId === null
                  ? 'bg-white font-semibold text-[#1c1b1a] border border-[#e1dcd3]'
                  : 'text-[#4a4741] hover:bg-black/5'
              }`}
            >
              <Circle
                className={`w-2 h-2 ${
                  selectedSpaceId === null ? 'fill-[#2a72de] text-[#2a72de]' : 'text-[#838280]'
                }`}
              />
              <span className="truncate">All Organisation</span>
            </button>

            {spaces.map((s) => {
              const isSelected = selectedSpaceId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSpace(s.id);
                    if (currentView !== 'spaces') {
                      onSelectView('spaces');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    isSelected
                      ? 'bg-white font-semibold text-[#1c1b1a] border border-[#e1dcd3]'
                      : 'text-[#4a4741] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-[#838280] shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <span className="text-[10px] text-[#838280] capitalize shrink-0">
                    {s.space_type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Settings & User Profile */}
      <div className="p-3 border-t border-[#e1dcd3] space-y-1">
        <button
          onClick={() => onSelectView('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentView === 'settings'
              ? 'bg-white text-[#1c1b1a] shadow-xs font-semibold border border-[#e1dcd3]'
              : 'text-[#4a4741] hover:text-[#1c1b1a] hover:bg-black/5'
          }`}
        >
          <Settings className="w-4 h-4 text-[#838280]" />
          <span>Settings</span>
        </button>

        {/* User Card */}
        <div className="pt-2 mt-1 border-t border-[#e1dcd3]/60 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#1c1b1a] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
              MC
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#1c1b1a] truncate leading-tight">
                Maya Chen
              </div>
              <div className="text-[10px] text-[#838280] truncate leading-tight">
                Product Manager
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

