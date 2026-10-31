'use client';

import React, { useState } from 'react';
import { Task, Space, Decision, Meeting } from '@/types';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Quote,
  Calendar,
  Layers,
  Search,
  Filter,
  Plus
} from 'lucide-react';

interface MyWorkViewProps {
  tasks: Task[];
  spaces: Space[];
  selectedSpaceId: string | null;
  onOpenIngest: () => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  tasks,
  spaces,
  selectedSpaceId,
  onOpenIngest
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'assigned_me' | 'upcoming' | 'overdue' | 'blocked' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Current logged in user is simulated as Maya Chen (Product Manager)
  const currentUserName = 'Maya Chen';

  // Extract unique assignees for dropdown
  const assignees = Array.from(new Set(tasks.map(t => t.assignee_name).filter(Boolean))) as string[];

  const filteredTasks = tasks.filter((t) => {
    if (selectedSpaceId && t.space_id !== selectedSpaceId) return false;

    if (selectedAssignee !== 'all' && t.assignee_name !== selectedAssignee) {
      return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.assignee_name && t.assignee_name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterTab === 'assigned_me') {
      return (t.assignee_name && t.assignee_name.includes('Maya')) || !t.assignee_name;
    }
    if (filterTab === 'upcoming') {
      return t.status === 'todo' || t.status === 'in_progress';
    }
    if (filterTab === 'blocked') {
      return t.status === 'blocked' || t.priority === 'urgent';
    }
    if (filterTab === 'completed') {
      return t.status === 'done';
    }
    if (filterTab === 'overdue') {
      // Check if due_date is in past
      if (!t.due_date) return false;
      return new Date(t.due_date).getTime() < Date.now() && t.status !== 'done';
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
            My Commitments & Execution Tracker
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Every commitment is directly anchored to transcript evidence, an assignee, and delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="text-xs p-2 pl-8 pr-3 rounded-lg border border-[#e1dcd3] bg-white focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            />
            <Search className="w-3.5 h-3.5 text-[#838280] absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs p-2 rounded-lg border border-[#e1dcd3] bg-white text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
          >
            <option value="all">All Assignees ({tasks.length})</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a} ({tasks.filter(t => t.assignee_name === a).length})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Meeting</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1 border-b border-[#e1dcd3] pb-2 text-xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Tasks', count: tasks.length },
          { id: 'assigned_me', label: 'Assigned to Me (Maya)', count: tasks.filter(t => t.assignee_name && t.assignee_name.includes('Maya')).length },
          { id: 'upcoming', label: 'Upcoming', count: tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length },
          { id: 'blocked', label: 'High Priority / Blocked', count: tasks.filter(t => t.status === 'blocked' || t.priority === 'urgent').length },
          { id: 'overdue', label: 'Overdue', count: tasks.filter(t => t.due_date && new Date(t.due_date).getTime() < Date.now() && t.status !== 'done').length },
          { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'done').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-[#1c1b1a] text-white font-semibold'
                : 'text-[#4a4741] hover:bg-black/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-[#838280]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks Execution List */}
      <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#e1dcd3] shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#5c6f5d] mx-auto opacity-70" />
            <h4 className="font-serif text-lg text-[#1c1b1a]">No tasks in this view</h4>
            <p className="text-xs text-[#7b776f] max-w-sm mx-auto font-light">
              You are all caught up! New commitments extracted from meeting transcripts will appear here upon approval.
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[#fbfaf7] transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded">
                    📁 {t.space_name || 'Space'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    t.priority === 'urgent' ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                  }`}>
                    {t.priority}
                  </span>
                  {t.meeting_title && (
                    <span className="text-[11px] text-[#838280]">
                      From: {t.meeting_title}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-[#1c1b1a]">
                  {t.title}
                </h4>

                {t.description && (
                  <p className="text-xs text-[#7b776f] font-light">{t.description}</p>
                )}

                {t.evidence_quote && (
                  <div className="text-[11px] italic bg-[#fbfaf7] p-2.5 rounded border border-[#e1dcd3] text-[#4a4741] flex items-start gap-1.5 mt-1">
                    <Quote className="w-3 h-3 text-[#af751b] shrink-0 mt-0.5" />
                    <span>&ldquo;{t.evidence_quote}&rdquo;</span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                  t.status === 'in_progress' ? 'bg-blue-100 text-[#2a72de]' : 'bg-stone-100 text-[#4a4741]'
                }`}>
                  {t.status}
                </span>

                <div className="text-right text-[11px] text-[#838280]">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{t.assignee_name || 'Unassigned'}</span>
                  </div>
                  {t.due_date && (
                    <div className="flex items-center gap-1 mt-0.5 text-stone-600 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>Due {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

