'use client';

import React, { useState } from 'react';
import { Task, Space } from '@/types';
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
  Plus,
  ArrowRight,
  ExternalLink,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react';

interface MyWorkViewProps {
  tasks: Task[];
  spaces: Space[];
  selectedSpaceId: string | null;
  onOpenIngest: () => void;
  onOpenMeeting?: (meetingId: string) => void;
  onOpenDecision?: (decisionId: string) => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  tasks,
  spaces,
  selectedSpaceId,
  onOpenIngest,
  onOpenMeeting,
  onOpenDecision
}) => {
  // User scope defaults strictly to 'me' (Maya Chen)
  const [userScope, setUserScope] = useState<'me' | 'all'>('me');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [spaceFilter, setSpaceFilter] = useState<string>(selectedSpaceId || 'all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'this_week' | 'overdue'>('all');

  // Selected Task for Detailed Inspection Drawer/Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const currentUserName = 'Maya Chen';

  const filteredTasks = tasks.filter((t) => {
    // 1. User scope filter (Default to Maya Chen)
    if (userScope === 'me') {
      const isMine = (t.assignee_name && t.assignee_name.toLowerCase().includes('maya')) || !t.assignee_name;
      if (!isMine) return false;
    }

    // 2. Space filter
    if (spaceFilter !== 'all' && t.space_id !== spaceFilter) {
      return false;
    }

    // 3. Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) {
      return false;
    }

    // 4. Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
      return false;
    }

    // 5. Due date filter
    if (dueDateFilter === 'overdue') {
      if (!t.due_date) return false;
      const isPast = new Date(t.due_date).getTime() < Date.now() && t.status !== 'done';
      if (!isPast) return false;
    } else if (dueDateFilter === 'this_week') {
      if (!t.due_date) return false;
      const diffDays = (new Date(t.due_date).getTime() - Date.now()) / (1000 * 3600 * 24);
      if (diffDays < 0 || diffDays > 7) return false;
    }

    // 6. Search term filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.assignee_name && t.assignee_name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.space_name && t.space_name.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const myTaskCount = tasks.filter(t => t.assignee_name && t.assignee_name.toLowerCase().includes('maya')).length;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Title & Scope Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e1dcd3] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#1c1b1a]">
            My Commitments &amp; Execution
          </h2>
          <p className="text-xs text-[#7b776f] mt-0.5 font-light">
            Every commitment is anchored to verified transcript evidence, an assignee, and delivery milestones.
          </p>
        </div>

        {/* User Scope Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#fbfaf7] border border-[#e1dcd3] p-1 rounded-lg text-xs">
            <button
              onClick={() => setUserScope('me')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                userScope === 'me'
                  ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                  : 'text-[#4a4741] hover:text-[#1c1b1a]'
              }`}
            >
              Assigned to Me ({myTaskCount})
            </button>
            <button
              onClick={() => setUserScope('all')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                userScope === 'all'
                  ? 'bg-white text-[#1c1b1a] font-semibold shadow-xs'
                  : 'text-[#4a4741] hover:text-[#1c1b1a]'
              }`}
            >
              All Team Tasks ({tasks.length})
            </button>
          </div>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a72de] text-white hover:bg-[#205bb5] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Meeting</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-oura p-4 bg-white border border-[#e1dcd3] space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search commitments..."
              className="w-full text-xs p-2 pl-8 pr-3 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            />
            <Search className="w-3.5 h-3.5 text-[#838280] absolute left-2.5 top-2.5" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="todo">To Do</option>
              <option value="blocked">Blocked</option>
              <option value="done">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Space Filter */}
          <div>
            <select
              value={spaceFilter}
              onChange={(e) => setSpaceFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            >
              <option value="all">All Spaces</option>
              {spaces.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card-oura bg-white border border-[#e1dcd3] divide-y divide-[#f0ece4] shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#5c6f5d] mx-auto opacity-70" />
            <h4 className="font-serif text-lg text-[#1c1b1a]">No commitments matching filters</h4>
            <p className="text-xs text-[#7b776f] max-w-sm mx-auto font-light">
              {userScope === 'me'
                ? 'You have caught up with all commitments assigned to you!'
                : 'No tasks found matching your filter selection.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-[#fbfaf7] cursor-pointer transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
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
                    <span className="text-[11px] text-[#838280] truncate">
                      From: {t.meeting_title}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-[#1c1b1a]">
                  {t.title}
                </h4>

                {t.description && (
                  <p className="text-xs text-[#7b776f] font-light leading-relaxed">{t.description}</p>
                )}

                {t.evidence_quote && (
                  <div className="text-[11px] italic bg-[#fbfaf7] p-2 rounded border border-[#e1dcd3] text-[#4a4741] flex items-start gap-1.5 mt-1">
                    <Quote className="w-3 h-3 text-[#af751b] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">&ldquo;{t.evidence_quote}&rdquo;</span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                  t.status === 'in_progress'
                    ? 'bg-blue-100 text-[#2a72de]'
                    : t.status === 'blocked'
                    ? 'bg-red-100 text-[#e33a22]'
                    : 'bg-stone-100 text-[#4a4741]'
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-oura bg-white border border-[#e1dcd3] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1dcd3] pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#2a72de]" />
                <h3 className="font-serif text-lg font-normal text-[#1c1b1a]">
                  Task Commitment Detail
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-[#838280] hover:text-[#1c1b1a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2a72de] px-2 py-0.5 rounded">
                  📁 {selectedTask.space_name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-[#4a4741] px-2 py-0.5 rounded">
                  Priority: {selectedTask.priority}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#af751b] px-2 py-0.5 rounded">
                  Status: {selectedTask.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-[#1c1b1a]">{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-[#4a4741] mt-1 leading-relaxed">{selectedTask.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#fbfaf7] rounded-lg border border-[#e1dcd3]">
                <div>
                  <span className="text-[10px] font-semibold text-[#838280] block uppercase">Owner / Assignee</span>
                  <span className="font-medium text-[#1c1b1a]">{selectedTask.assignee_name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#838280] block uppercase">Due Date</span>
                  <span className="font-medium text-[#1c1b1a]">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                  </span>
                </div>
              </div>

              {/* Origin Meeting Link */}
              {selectedTask.meeting_title && (
                <div className="p-3 bg-stone-50 rounded-lg border border-[#e1dcd3] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-[#838280] block uppercase">Originating Meeting</span>
                    <span className="font-medium text-[#1c1b1a]">{selectedTask.meeting_title}</span>
                  </div>
                  {onOpenMeeting && selectedTask.meeting_id && (
                    <button
                      onClick={() => {
                        setSelectedTask(null);
                        onOpenMeeting(selectedTask.meeting_id);
                      }}
                      className="text-[#2a72de] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Verbatim Transcript Evidence */}
              {selectedTask.evidence_quote && (
                <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[#2a72de]">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Verbatim Transcript Evidence</span>
                  </div>
                  <p className="italic text-[#1c1b1a] leading-relaxed">
                    &ldquo;{selectedTask.evidence_quote}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e1dcd3] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#838280]">Anchored to verified meeting turn</span>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1c1b1a] text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
