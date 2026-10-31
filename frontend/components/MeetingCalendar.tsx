'use client';

import React, { useState, useMemo } from 'react';
import { Meeting, Space } from '@/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  GitBranch,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Filter,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MeetingCalendarProps {
  meetings: Meeting[];
  spaces: Space[];
  selectedSpaceId: string | null;
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenCandidates?: (meetingId: string) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  meetings,
  spaces,
  selectedSpaceId,
  onOpenMeeting,
  onOpenCandidates
}) => {
  // Mode: 'oct' (October 2026 / Today), 'nov' (November 2026 / Launch Gate), or 'both' (Dual Month)
  const [monthMode, setMonthMode] = useState<'oct' | 'nov' | 'both'>('oct');
  // Free browsing date for prev/next
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 31)); // Default: October 31, 2026 (Today)
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-10-31'); // Default: Oct 31 today
  const [spaceFilter, setSpaceFilter] = useState<string>(selectedSpaceId || 'all');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter meetings by space
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (spaceFilter !== 'all' && m.primary_space_id !== spaceFilter) return false;
      return true;
    });
  }, [meetings, spaceFilter]);

  // Group meetings by date string (YYYY-MM-DD)
  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    filteredMeetings.forEach(m => {
      if (!m.meeting_date) return;
      let key = '';
      if (m.meeting_date.length >= 10 && m.meeting_date.charAt(4) === '-' && m.meeting_date.charAt(7) === '-') {
        key = m.meeting_date.slice(0, 10);
      } else {
        const d = new Date(m.meeting_date);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [filteredMeetings]);

  // Calendar builder helper
  const buildMonthGrid = (y: number, m: number) => {
    const firstDayOfMonth = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      dateKey: string;
      isWeekend: boolean;
      year: number;
      month: number;
    }> = [];

    // Leading padding days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = m === 0 ? 11 : m - 1;
      const prevYear = m === 0 ? y - 1 : y;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, isCurrentMonth: false, dateKey, isWeekend: false, year: prevYear, month: prevMonth });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(y, m, day).getDay();
      days.push({
        day,
        isCurrentMonth: true,
        dateKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        year: y,
        month: m
      });
    }

    // Trailing padding days for next month
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalCells - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = m === 11 ? 0 : m + 1;
      const nextYear = m === 11 ? y + 1 : y;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, isCurrentMonth: false, dateKey, isWeekend: false, year: nextYear, month: nextMonth });
    }

    return days;
  };

  // Precomputed month grids
  const oct2026Days = useMemo(() => buildMonthGrid(2026, 9), []);
  const nov2026Days = useMemo(() => buildMonthGrid(2026, 10), []);

  // Free browse month grid
  const browseDays = useMemo(() => {
    return buildMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Selected day meetings
  const selectedDayMeetings = selectedDateKey ? (meetingsByDate[selectedDateKey] || []) : [];

  const handleSelectOct = () => {
    setMonthMode('oct');
    setCurrentDate(new Date(2026, 9, 31));
    setSelectedDateKey('2026-10-31');
  };

  const handleSelectNov = () => {
    setMonthMode('nov');
    setCurrentDate(new Date(2026, 10, 14));
    setSelectedDateKey('2026-11-14');
  };

  const handleSelectBoth = () => {
    setMonthMode('both');
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper space color mapping
  const getSpaceBadgeColor = (spaceName?: string) => {
    const s = (spaceName || '').toLowerCase();
    if (s.includes('payment')) return 'bg-blue-50 text-[#2a72de] border-blue-200';
    if (s.includes('sre') || s.includes('reliab')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s.includes('risk') || s.includes('fraud')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('security') || s.includes('complian')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s.includes('merchant')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-stone-50 text-stone-700 border-stone-200';
  };

  // Render a specific month grid component
  const renderMonthGridComponent = (y: number, m: number, days: ReturnType<typeof buildMonthGrid>, compact = false) => {
    const mName = monthNames[m];
    return (
      <div className="bg-white rounded-2xl border border-[#e1dcd3] shadow-xs overflow-hidden">
        {/* Month Sub-header */}
        <div className="p-4 border-b border-[#f0ece4] bg-[#fcfbf9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-lg font-medium text-[#1c1b1a]">
              {mName} {y}
            </h4>
            {m === 9 && y === 2026 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Current Month (Today: Oct 31)
              </span>
            )}
            {m === 10 && y === 2026 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#e33a22] border border-red-200">
                1 Upcoming Review Gate (Nov 14)
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-stone-500">
            {days.filter(d => d.isCurrentMonth && (meetingsByDate[d.dateKey] || []).length > 0).length} active days
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#f0ece4] bg-[#fbfaf7] text-center">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`py-2 text-[11px] font-semibold tracking-wider uppercase ${
                idx === 0 || idx === 6 ? 'text-stone-400' : 'text-stone-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#f0ece4]">
          {days.map((cd, index) => {
            const meets = meetingsByDate[cd.dateKey] || [];
            const isSelected = selectedDateKey === cd.dateKey;
            const hasMeetings = meets.length > 0;
            const isToday = cd.dateKey === '2026-10-31';
            const isLaunchReviewGate = cd.dateKey === '2026-11-14';
            const isNov10Gate = cd.dateKey === '2026-11-10';

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDateKey(cd.dateKey);
                }}
                className={`p-2 transition-all flex flex-col justify-between cursor-pointer ${
                  compact ? 'min-h-[90px]' : 'min-h-[115px]'
                } ${
                  !cd.isCurrentMonth
                    ? 'bg-stone-50/50 text-stone-300 pointer-events-none'
                    : isSelected
                    ? 'bg-blue-50/50 ring-2 ring-inset ring-[#2a72de]'
                    : isToday
                    ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                    : hasMeetings
                    ? 'bg-white hover:bg-stone-50'
                    : 'bg-white hover:bg-stone-50/60'
                }`}
              >
                {/* Cell Header: Day Number + Special Badges */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-medium ${
                      isSelected
                        ? 'bg-[#2a72de] text-white shadow-xs'
                        : isToday
                        ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-200'
                        : isLaunchReviewGate
                        ? 'bg-[#e33a22] text-white font-bold ring-2 ring-red-200'
                        : hasMeetings
                        ? 'font-bold text-[#1c1b1a]'
                        : 'text-stone-500'
                    }`}
                  >
                    {cd.day}
                  </span>

                  {/* Special Date Badges */}
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-1 rounded flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Today
                    </span>
                  )}

                  {isLaunchReviewGate && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#e33a22] bg-red-100 border border-red-300 px-1 rounded">
                      Gate
                    </span>
                  )}

                  {isNov10Gate && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 px-1 rounded">
                      Gate
                    </span>
                  )}

                  {hasMeetings && !isToday && !isLaunchReviewGate && !isNov10Gate && (
                    <span className="text-[9px] font-mono text-stone-400">
                      {meets.length} meet{meets.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Meeting Cards Inside Cell */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {meets.slice(0, compact ? 1 : 2).map((m) => {
                    const timeStr = m.meeting_date
                      ? new Date(m.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const isGate = m.title.toLowerCase().includes('gate') || m.title.toLowerCase().includes('decision');

                    return (
                      <div
                        key={m.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMeeting(m);
                        }}
                        className={`p-1.5 rounded-md border text-[10px] leading-tight transition-all cursor-pointer truncate group ${
                          isToday
                            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
                            : isGate
                            ? 'bg-amber-50/80 border-amber-300 text-[#684d07] hover:bg-amber-100'
                            : 'bg-[#fbfaf7] border-[#e1dcd3] hover:border-[#2a72de] hover:bg-blue-50 text-[#1c1b1a]'
                        }`}
                        title={`${m.title} (${m.primary_space_name || 'Space'}) - Click to inspect transcript`}
                      >
                        <div className="flex items-center gap-1 font-mono text-[9px] text-stone-500">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>{timeStr}</span>
                        </div>
                        <div className="font-medium truncate group-hover:text-[#2a72de]">
                          {m.title}
                        </div>
                      </div>
                    );
                  })}

                  {meets.length > (compact ? 1 : 2) && (
                    <div className="text-[9px] text-stone-400 font-mono text-center pt-0.5">
                      +{meets.length - (compact ? 1 : 2)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Calendar Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e1dcd3] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1c1b1a] text-white flex items-center justify-center shadow-xs">
            <CalendarDays className="w-5 h-5 text-stone-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-normal text-[#1c1b1a]">
                Meeting Repository &amp; Calendar
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#2a72de] border border-blue-200">
                {filteredMeetings.length} Meetings
              </span>
            </div>
            <p className="text-xs text-[#7b776f] mt-0.5 font-light">
              Timeline covering today (Oct 31 architecture review) through the 14 Nov launch readiness gate.
            </p>
          </div>
        </div>

        {/* Month Selector Tabs & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Month Switcher Segmented Pills */}
          <div className="flex items-center rounded-xl border border-[#e1dcd3] bg-[#fbfaf7] p-1 shadow-2xs">
            <button
              onClick={handleSelectOct}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                monthMode === 'oct'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold border border-emerald-200'
                  : 'text-stone-600 hover:text-[#1c1b1a]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Oct 2026 (Today)</span>
            </button>

            <button
              onClick={handleSelectNov}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                monthMode === 'nov'
                  ? 'bg-white text-[#e33a22] shadow-xs font-semibold border border-red-200'
                  : 'text-stone-600 hover:text-[#1c1b1a]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#e33a22]" />
              <span>Nov 2026 (Upcoming Gate)</span>
            </button>

            <button
              onClick={handleSelectBoth}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                monthMode === 'both'
                  ? 'bg-white text-[#2a72de] shadow-xs font-semibold border border-blue-200'
                  : 'text-stone-600 hover:text-[#1c1b1a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#2a72de]" />
              <span>Both Months</span>
            </button>
          </div>

          {/* Space Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-[#838280]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={spaceFilter}
              onChange={(e) => setSpaceFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-[#e1dcd3] bg-[#fbfaf7] text-[#1c1b1a] focus:outline-none focus:ring-1 focus:ring-[#2a72de]"
            >
              <option value="all">All Spaces</option>
              {spaces.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Month Prev/Next Buttons (For Free Navigation) */}
          {monthMode !== 'both' && (
            <div className="flex items-center rounded-lg border border-[#e1dcd3] overflow-hidden bg-[#fbfaf7]">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono font-medium text-stone-700">
                {monthNames[currentDate.getMonth()].slice(0, 3)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-stone-200 text-stone-600 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Calendar Display Grid(s) */}
      {monthMode === 'oct' && (
        renderMonthGridComponent(2026, 9, oct2026Days)
      )}

      {monthMode === 'nov' && (
        renderMonthGridComponent(2026, 10, nov2026Days)
      )}

      {monthMode === 'both' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              {renderMonthGridComponent(2026, 9, oct2026Days, true)}
            </div>
            <div>
              {renderMonthGridComponent(2026, 10, nov2026Days, true)}
            </div>
          </div>
        </div>
      )}

      {/* 3. Selected Day Schedule & Agenda Detail */}
      <div className="bg-white rounded-2xl border border-[#e1dcd3] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ece4] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fbfaf7] border border-[#e1dcd3] flex items-center justify-center text-[#1c1b1a]">
              <CalendarIcon className="w-4 h-4 text-[#2a72de]" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-medium text-[#1c1b1a]">
                Selected Date: {selectedDateKey || 'None'}
              </h4>
              <p className="text-xs text-[#7b776f]">
                {selectedDayMeetings.length === 0
                  ? 'No meetings scheduled for this date.'
                  : `${selectedDayMeetings.length} meeting${selectedDayMeetings.length > 1 ? 's' : ''} on this day`}
              </p>
            </div>
          </div>

          {/* Specific Status Banners for Selected Date */}
          {selectedDateKey === '2026-10-31' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Today&apos;s Active Ingestion &bull; 31 Oct 2026</span>
            </div>
          )}

          {selectedDateKey === '2026-11-14' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#e33a22] font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Mandatory 4-Team Launch Gate Review (DEC-002)</span>
            </div>
          )}

          {selectedDateKey === '2026-11-10' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Rollout Paused Decision Meeting</span>
            </div>
          )}
        </div>

        {/* Selected Meetings List */}
        {selectedDayMeetings.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-[#fbfaf7] rounded-xl border border-dashed border-[#e1dcd3]">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p>No meeting transcripts or reviews recorded on {selectedDateKey}.</p>
            <p className="text-[11px] text-stone-400 mt-1">Select dates like Oct 31 (Today), or Nov 02, 03, 04, 05, 06, 09, 10, 11, or 14 to inspect meetings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayMeetings.map((m) => {
              const badgeClass = getSpaceBadgeColor(m.primary_space_name);
              const isToday = m.meeting_date && m.meeting_date.includes('2026-10-31');
              const isLaunchGate = m.meeting_date && m.meeting_date.includes('2026-11-14');

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isToday
                      ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
                      : isLaunchGate
                      ? 'border-red-300 bg-red-50/20 hover:bg-red-50/40'
                      : 'border-[#e1dcd3] bg-[#fbfaf7] hover:border-[#2a72de] hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                        📁 {m.primary_space_name || 'Project'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(m.meeting_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Today&apos;s Session
                        </span>
                      )}
                      {isLaunchGate && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#e33a22] border border-red-300">
                          Mandatory Launch Gate Review
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenCandidates && (
                        <button
                          onClick={() => onOpenCandidates(m.id)}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-[#1c1b1a] transition-colors"
                        >
                          Candidates
                        </button>
                      )}
                      <button
                        onClick={() => onOpenMeeting(m)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#1c1b1a] text-white hover:bg-black transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Transcript</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-serif text-base font-medium text-[#1c1b1a]">
                      {m.title}
                    </h5>
                    {m.raw_transcript_text && (
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {m.raw_transcript_text.slice(0, 180)}...
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#f0ece4] flex flex-wrap items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#2a72de]" />
                      <strong>{m.segment_count || 12}</strong> Segments
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-[#0f766e]" />
                      <strong>{m.decision_count || 2}</strong> Decisions
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" />
                      <strong>{m.task_count || 2}</strong> Action Items
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
