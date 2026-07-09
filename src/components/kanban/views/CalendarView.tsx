import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Task, TaskPriority, User as UserType, TaskStatus } from "../../../types";

interface CalendarViewProps {
  tasks: Task[];
  users: UserType[];
  onSelectTask: (id: string) => void;
  onOpenCreateTask: (status: TaskStatus, date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, users, onSelectTask, onOpenCreateTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get start of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month labels
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
    <div id="calendar-view-container" className="bg-[#0b0b0b] border border-[#262626] rounded-xl p-4 font-sans text-neutral-200">
      {/* Calendar Header Nav */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-sm tracking-tight text-white uppercase font-sans">
            {MONTHS[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 bg-[#151515] hover:bg-[#1a1a1a] border border-[#262626] rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1.5 bg-[#151515] hover:bg-[#1a1a1a] border border-[#262626] rounded-md text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 bg-[#151515] hover:bg-[#1a1a1a] border border-[#262626] rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase font-bold text-zinc-500 pb-2 border-b border-[#1e1e1e]">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1.5 mt-2 h-[55vh] min-h-[350px]">
        {days.map((date, idx) => {
          if (!date) {
            return (
              <div key={`empty-${idx}`} className="bg-[#0b0b0b]/20 border border-transparent rounded-lg opacity-25" />
            );
          }

          const dayTasks = getTasksForDate(date);
          const isToday = new Date().toISOString().split("T")[0] === date.toISOString().split("T")[0];
          const dateStr = date.toISOString().split("T")[0];

          return (
            <div 
              key={dateStr}
              id={`calendar-day-${dateStr}`}
              className={`bg-[#111111]/80 border border-[#232323] hover:border-[#333] p-1.5 rounded-lg flex flex-col justify-between transition-colors min-h-0 relative group`}
            >
              {/* Day Number and Add Task Button */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-bold ${
                  isToday 
                    ? "bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-sans" 
                    : "text-zinc-400"
                }`}>
                  {date.getDate()}
                </span>
                
                {/* Create Task specifically on this date */}
                <button 
                  onClick={() => onOpenCreateTask(TaskStatus.TODO, dateStr)}
                  title="Create issue on this date"
                  className="opacity-0 group-hover:opacity-100 p-0.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
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
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium border cursor-pointer select-none truncate flex items-center justify-between gap-1 transition-colors ${
                        t.priority === TaskPriority.CRITICAL 
                          ? "bg-red-950/20 text-red-300 border-red-900/30 hover:bg-red-950/40" 
                          : t.priority === TaskPriority.HIGH 
                          ? "bg-amber-950/20 text-amber-300 border-amber-900/30 hover:bg-amber-950/40"
                          : t.priority === TaskPriority.MEDIUM
                          ? "bg-blue-950/20 text-blue-300 border-blue-900/30 hover:bg-blue-950/40"
                          : "bg-[#181818] text-zinc-300 border-[#2a2a2a] hover:bg-[#202020]"
                      }`}
                      title={t.title}
                    >
                      <span className="truncate flex-1">{t.title}</span>
                      {user && (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-3 h-3 rounded-full object-cover border border-[#262626] shrink-0"
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
