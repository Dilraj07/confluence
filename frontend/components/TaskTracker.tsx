'use client';

import React, { useState } from 'react';
import { Task, Space } from '@/types';
import {
  CheckSquare,
  Clock,
  User,
  Quote,
  Filter,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface TaskTrackerProps {
  tasks: Task[];
  spaces: Space[];
  selectedSpaceId: string | null;
}

export const TaskTracker: React.FC<TaskTrackerProps> = ({
  tasks,
  spaces,
  selectedSpaceId,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTasks = tasks.filter(t => {
    if (selectedSpaceId && t.space_id !== selectedSpaceId) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.assignee_name && t.assignee_name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#838280]">
            Execution Engine
          </span>
          <h1 className="font-serif text-3xl font-normal text-[#1c1b1a]">
            Meeting Commitments & Tasks
          </h1>
          <p className="text-xs text-[#4a4741] mt-1 font-light">
            Every commitment is directly anchored to transcript evidence, an assignee, and delivery milestones.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks or assignees..."
              className="text-xs p-2 pl-8 pr-3 rounded-full border border-[#e1dcd3] bg-white focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            />
            <Search className="w-3.5 h-3.5 text-[#838280] absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center bg-white border border-[#e1dcd3] rounded-full p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full ${statusFilter === 'all' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('todo')}
              className={`px-3 py-1 rounded-full ${statusFilter === 'todo' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              To Do
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-full ${statusFilter === 'in_progress' ? 'bg-[#1c1b1a] text-white font-medium' : 'text-[#4a4741]'}`}
            >
              In Progress
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="card-oura bg-white divide-y divide-[#e1dcd3] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#838280]">
            No commitments matching filter criteria.
          </div>
        ) : (
          filteredTasks.map(t => (
            <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[#f7f1e8]/30 transition-all">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a72de] bg-blue-50 px-2 py-0.5 rounded-full">
                    {t.space_name || 'General Space'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.priority === 'urgent' ? 'bg-red-50 text-[#e33a22]' : 'bg-stone-100 text-[#4a4741]'
                  }`}>
                    {t.priority} Priority
                  </span>
                  {t.meeting_title && (
                    <span className="text-[11px] text-[#838280]">
                      From: {t.meeting_title}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[#1c1b1a]">
                  {t.title}
                </h3>

                {t.description && (
                  <p className="text-xs text-[#4a4741]">{t.description}</p>
                )}

                {t.evidence_quote && (
                  <div className="text-xs italic bg-[#f7f1e8] p-2.5 rounded-lg border border-[#e1dcd3] text-[#4a4741] flex items-start gap-1.5 mt-2">
                    <Quote className="w-3.5 h-3.5 text-[#af751b] shrink-0 mt-0.5" />
                    <span>&ldquo;{t.evidence_quote}&rdquo;</span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
