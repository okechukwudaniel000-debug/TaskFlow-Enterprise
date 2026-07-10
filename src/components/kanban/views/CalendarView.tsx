import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Task, TaskPriority, User as UserType, TaskStatus } from "../../../types";
import { useMilitaryTheme } from "../../../contexts/MilitaryThemeContext";

interface CalendarViewProps {
  tasks: Task[];
  users: UserType[];
  onSelectTask: (id: string) => void;
  onOpenCreateTask: (status: TaskStatus, date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, users, onSelectTask, onOpenCreateTask }) => {
  const { colors } = useMilitaryTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get start of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month labels
  const MONTHS = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid days
  const days = [];
  // Padding for empty days at start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  // Group tasks by date string (YYYY-MM-DD)
  const getTasksForDate = (date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    return tasks.filter(t => t.dueDate === dStr);
  };

  return (
    <div id="calendar-view-container" className={`bg-black/35 border ${colors.border} rounded-sm p-4 font-mono text-neutral-200 relative z-10`}>
      {/* Calendar Header Nav */}
      <div className={`flex items-center justify-between mb-4 pb-3 border-b ${colors.borderMuted}`}>
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-xs tracking-widest text-white uppercase">
            {MONTHS[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className={`p-1.5 bg-black/40 hover:bg-white/[0.01] border ${colors.border} rounded-sm text-zinc-400 hover:text-white transition-colors cursor-pointer`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className={`px-3 py-1.5 bg-black/40 hover:bg-white/[0.01] border ${colors.border} rounded-sm text-[9px] font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors cursor-pointer`}
          >
            TODAY
          </button>
          <button 
            onClick={nextMonth}
            className={`p-1.5 bg-black/40 hover:bg-white/[0.01] border ${colors.border} rounded-sm text-zinc-400 hover:text-white transition-colors cursor-pointer`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Days of week labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase font-bold text-zinc-500 pb-2 border-b border-white/[0.02]">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1.5 mt-2 h-[55vh] min-h-[350px]">
        {days.map((date, idx) => {
          if (!date) {
            return (
              <div key={`empty-${idx}`} className="bg-black/5 border border-transparent rounded-sm opacity-20" />
            );
          }

          const dayTasks = getTasksForDate(date);
          const isToday = new Date().toISOString().split("T")[0] === date.toISOString().split("T")[0];
          const dateStr = date.toISOString().split("T")[0];

          return (
            <div 
              key={dateStr}
              id={`calendar-day-${dateStr}`}
              className={`bg-black/35 border ${
                isToday ? "border-emerald-700 bg-emerald-950/15" : "border-white/[0.03]"
              } hover:border-neutral-500 p-1.5 rounded-sm flex flex-col justify-between transition-colors min-h-0 relative group`}
            >
              {/* Day Number and Add Task Button */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-mono font-bold ${
                  isToday 
                    ? "bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded-sm" 
                    : "text-zinc-500"
                }`}>
                  {date.getDate()}
                </span>
                
                {/* Create Task specifically on this date */}
                <button 
                  onClick={() => onOpenCreateTask(TaskStatus.TODO, dateStr)}
                  title="Create issue on this date"
                  className="opacity-0 group-hover:opacity-100 p-0.5 bg-neutral-900 hover:bg-neutral-800 border border-white/[0.04] rounded-sm text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[85px] scrollbar-none">
                {dayTasks.map(t => {
                  const user = users.find(u => u.id === t.assigneeId);
                  
                  return (
                    <div 
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(t.id);
                      }}
                      className={`px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase border cursor-pointer select-none truncate flex items-center justify-between gap-1 transition-colors ${
                        t.priority === TaskPriority.CRITICAL 
                          ? "bg-red-950/40 text-red-300 border-red-800/40 hover:bg-red-950/60" 
                          : t.priority === TaskPriority.HIGH 
                          ? "bg-amber-950/40 text-amber-300 border-amber-850/40 hover:bg-amber-950/60"
                          : t.priority === TaskPriority.MEDIUM
                          ? "bg-sky-950/40 text-sky-300 border-sky-800/40 hover:bg-sky-950/60"
                          : "bg-neutral-900 text-zinc-400 border-neutral-800 hover:bg-neutral-800"
                      }`}
                      title={t.title}
                    >
                      <span className="truncate flex-1 tracking-wide">{t.title}</span>
                      {user && (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-3.5 h-3.5 rounded-full object-cover border border-white/[0.04] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
