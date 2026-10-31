'use client';

import React from 'react';
import { Space } from '@/types';
import {
  Sparkles,
  Plus,
  Mic,
  ChevronRight,
  Layers,
  Search
} from 'lucide-react';

interface HeaderProps {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
  selectedSpace: Space | null;
  onOpenIngest: () => void;
  onOpenAsk: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  title,
  subtitle,
  selectedSpace,
  onOpenIngest,
  onOpenAsk
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#e1dcd3] px-6 py-4 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Breadcrumbs & Title */}
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] text-[#838280] mb-0.5">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === breadcrumbs.length - 1 ? 'text-[#1c1b1a] font-medium' : 'hover:text-[#1c1b1a]'}>
                {crumb.label}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#cccac7]" />
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-normal text-[#1c1b1a] tracking-tight">
            {title}
          </h1>

          {selectedSpace && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f7f1e8] text-[#1c1b1a] border border-[#e1dcd3]">
              <Layers className="w-3 h-3 text-[#2a72de]" />
              <span>{selectedSpace.name} Space</span>
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            {subtitle}
          </p>
        )}
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Voice / Text Search Button */}
        <button
          onClick={onOpenAsk}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#f7f1e8] border border-[#e1dcd3] text-[#1c1b1a] hover:bg-[#ece6db] hover:border-[#838280] transition-all shadow-xs"
          title="Search or dictate with Wispr Flow"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2a72de]" />
          <span>Ask CONFLUENCE</span>
          <span className="text-[10px] bg-white border border-[#e1dcd3] px-1.5 py-0.2 rounded text-[#838280] font-mono">
            ⌘K
          </span>
        </button>

        {/* Ingest Meeting Action */}
        <button
          onClick={onOpenIngest}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Meeting</span>
        </button>
      </div>
    </header>
  );
};

