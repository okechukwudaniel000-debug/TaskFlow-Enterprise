import React, { useMemo } from "react";
import { Clock, Folder } from "lucide-react";
import { Task, User as UserType, Project } from "../../../types";
import { useMilitaryTheme } from "../../../contexts/MilitaryThemeContext";

interface TimelineViewProps {
  tasks: Task[];
  users: UserType[];
  projects: Project[];
  onSelectTask: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, users, projects, onSelectTask }) => {
  const { colors } = useMilitaryTheme();
  
  // Generate a list of 15 days around today (7 days before, today, 7 days after)
  const timelineDays = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const formatDateStr = (date: Date) => date.toISOString().split("T")[0];

  // Helper to find if task falls on a specific date range or near its due date
  const getTaskPosition = (task: Task, days: Date[]) => {
    if (!task.dueDate) return null;
    const dueIdx = days.findIndex(d => formatDateStr(d) === task.dueDate);
    if (dueIdx === -1) return null;

    // Span back 2 days (i.e. starts 2 days before due date)
    const startIdx = Math.max(0, dueIdx - 2);
    const colSpan = dueIdx - startIdx + 1;

    return {
      startCol: startIdx + 1, // 1-indexed for CSS grid
      colSpan: colSpan
    };
  };

  return (
    <div id="timeline-view-container" className={`bg-black/35 border ${colors.border} rounded-sm p-4 font-mono text-neutral-200 overflow-hidden relative z-10`}>
      <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${colors.borderMuted}`}>
        <Clock className="w-4 h-4 text-emerald-400" />
        <h3 className="font-bold text-xs tracking-widest text-white uppercase">SPRINT TIMELINE METRICS</h3>
        <span className="text-[8px] text-zinc-500 font-mono tracking-wider uppercase">[MODEL: 3-DAY PROJECT TACTICAL SPAN]</span>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[1000px] space-y-2">
          
          {/* Timeline header: Day names and numbers */}
          <div className="grid grid-cols-12 gap-1 border-b border-white/[0.02] pb-2 font-mono text-[9px]">
            {/* Task labels header */}
            <div className="col-span-4 font-bold uppercase tracking-widest text-zinc-500 pl-2">MISSION_TASK_SPEC</div>
            {/* Timeline Days */}
            <div className="col-span-8 grid grid-cols-15 gap-1 text-center font-bold tracking-wider">
              {timelineDays.map((date, idx) => {
                const isToday = new Date().toISOString().split("T")[0] === formatDateStr(date);
                return (
                  <div 
                    key={idx} 
                    className={`p-1 rounded-sm flex flex-col items-center justify-center ${
                      isToday ? "bg-emerald-800/25 text-emerald-300 font-extrabold border border-emerald-600/30" : "text-zinc-500"
                    }`}
                  >
                    <span className="text-[8px]">{date.toLocaleDateString([], { weekday: 'short' }).slice(0, 2).toUpperCase()}</span>
                    <span className="text-[10px]">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline rows */}
          <div className="divide-y divide-white/[0.01] max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
            {tasks.filter(t => t.dueDate).length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-[10px] uppercase font-mono flex flex-col items-center justify-center gap-1.5">
                <Folder className="w-4 h-4 text-zinc-700" />
                <span>[EMPTY] No scheduled tasks mapped on timeline.</span>
              </div>
            ) : (
              tasks.filter(t => t.dueDate).map(t => {
                const pos = getTaskPosition(t, timelineDays);
                const user = users.find(u => u.id === t.assigneeId);
                const proj = projects.find(p => p.id === t.projectId);

                return (
                  <div 
                    key={t.id} 
                    id={`timeline-row-${t.id}`}
                    onClick={() => onSelectTask(t.id)}
                    className="grid grid-cols-12 gap-1 py-2.5 items-center hover:bg-white/[0.01] cursor-pointer transition-colors"
                  >
                    {/* Task Title & Details */}
                    <div className="col-span-4 min-w-0 pr-3 pl-2 flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[8px] font-mono font-bold text-zinc-500 shrink-0">{t.id}</span>
                          {proj && (
                            <span 
                              className="text-[8px] px-1.5 py-0.2 rounded-sm uppercase tracking-widest font-extrabold truncate max-w-[80px]"
                              style={{ backgroundColor: `${proj.color}15`, color: proj.color, border: `1px solid ${proj.color}25` }}
                            >
                              {proj.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-[11px] font-bold text-white uppercase truncate leading-tight tracking-wide" title={t.title}>
                          {t.title}
                        </h4>
                      </div>
                    </div>

                    {/* Timeline bar representing span */}
                    <div className="col-span-8 h-8 relative grid grid-cols-15 gap-1 items-center">
                      {/* Background grids */}
                      <div className="absolute inset-0 grid grid-cols-15 gap-1 pointer-events-none h-full">
                        {timelineDays.map((_, i) => (
                          <div key={i} className="border-r border-white/[0.01] h-full" />
                        ))}
                      </div>

                      {pos ? (
                        <div 
                          id={`timeline-bar-${t.id}`}
                          style={{
                            gridColumnStart: pos.startCol,
                            gridColumnEnd: pos.startCol + pos.colSpan
                          }}
                          className={`h-6 rounded-sm border text-[8px] font-extrabold tracking-wider uppercase flex items-center px-2 py-0.5 gap-2 select-none shadow-sm transition-all hover:scale-[1.01] ${
                            t.status === "DONE"
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                              : "bg-sky-950/40 text-sky-300 border-sky-800/40"
                          }`}
                        >
                          {user && (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-3.5 h-3.5 rounded-full object-cover border border-white/[0.04] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span className="truncate flex-1">{t.title}</span>
                          <span className="text-[7px] text-zinc-400 font-mono whitespace-nowrap">DUE: {t.dueDate}</span>
                        </div>
                      ) : (
                        <div className="col-span-15 text-[9px] text-zinc-600 font-mono italic pl-4 uppercase">
                          OUT OF ACTIVE RANGE (DUE: {t.dueDate})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
