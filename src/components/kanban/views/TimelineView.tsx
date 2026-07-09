import React, { useMemo } from "react";
import { Clock, Folder, ChevronRight } from "lucide-react";
import { Task, User as UserType, Project } from "../../../types";

interface TimelineViewProps {
  tasks: Task[];
  users: UserType[];
  projects: Project[];
  onSelectTask: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, users, projects, onSelectTask }) => {
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
  // Let's assume a task spans 3 days ending on its due date, or just represents its due date.
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
    <div id="timeline-view-container" className="bg-[#0b0b0b] border border-[#262626] rounded-xl p-4 font-sans text-neutral-200 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#262626]">
        <Clock className="w-5 h-5 text-purple-400" />
        <h3 className="font-bold text-sm tracking-tight text-white uppercase">Sprint Timeline View</h3>
        <span className="text-[10px] text-zinc-500 font-mono italic">(Assuming 3-day project span prior to due date)</span>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px] space-y-2">
          
          {/* Timeline header: Day names and numbers */}
          <div className="grid grid-cols-12 gap-1 border-b border-[#1f1f1f] pb-2 font-mono text-[10px]">
            {/* Task labels header */}
            <div className="col-span-4 font-bold uppercase text-zinc-500 pl-2">Task Details</div>
            {/* Timeline Days */}
            <div className="col-span-8 grid grid-cols-15 gap-1 text-center">
              {timelineDays.map((date, idx) => {
                const isToday = new Date().toISOString().split("T")[0] === formatDateStr(date);
                return (
                  <div 
                    key={idx} 
                    className={`p-1 rounded flex flex-col items-center justify-center ${
                      isToday ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20" : "text-zinc-400"
                    }`}
                  >
                    <span>{date.toLocaleDateString([], { weekday: 'short' }).slice(0, 2)}</span>
                    <span className="text-xs">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline rows */}
          <div className="divide-y divide-[#151515] max-h-[50vh] overflow-y-auto pr-1">
            {tasks.filter(t => t.dueDate).length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-xs flex flex-col items-center justify-center gap-1">
                <Folder className="w-5 h-5 text-zinc-700" />
                <span>No scheduled tasks found to map on timeline.</span>
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
                    className="grid grid-cols-12 gap-1 py-2.5 items-center hover:bg-[#111] cursor-pointer transition-colors"
                  >
                    {/* Task Title & Details */}
                    <div className="col-span-4 min-w-0 pr-3 pl-2 flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-mono font-semibold text-zinc-500 shrink-0">{t.id}</span>
                          {proj && (
                            <span 
                              className="text-[8px] px-1 rounded uppercase tracking-wider font-bold truncate max-w-[80px]"
                              style={{ backgroundColor: `${proj.color}15`, color: proj.color, border: `1px solid ${proj.color}25` }}
                            >
                              {proj.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-white truncate leading-tight" title={t.title}>
                          {t.title}
                        </h4>
                      </div>
                    </div>

                    {/* Timeline bar representing span */}
                    <div className="col-span-8 h-8 relative grid grid-cols-15 gap-1 items-center">
                      {/* Background grids */}
                      <div className="absolute inset-0 grid grid-cols-15 gap-1 pointer-events-none h-full">
                        {timelineDays.map((_, i) => (
                          <div key={i} className="border-r border-[#1a1a1a]/40 h-full" />
                        ))}
                      </div>

                      {pos ? (
                        <div 
                          id={`timeline-bar-${t.id}`}
                          style={{
                            gridColumnStart: pos.startCol,
                            gridColumnEnd: pos.startCol + pos.colSpan
                          }}
                          className={`h-6 rounded-md border text-[9px] font-semibold flex items-center px-2.5 gap-2 select-none shadow-sm transition-all hover:scale-[1.01] ${
                            t.status === "DONE"
                              ? "bg-emerald-950/20 text-emerald-300 border-emerald-900/30"
                              : "bg-blue-950/20 text-blue-300 border-blue-900/30"
                          }`}
                        >
                          {user && (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-3.5 h-3.5 rounded-full object-cover border border-[#262626] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span className="truncate flex-1">{t.title}</span>
                          <span className="text-[8px] text-zinc-400 font-mono whitespace-nowrap">Due: {t.dueDate}</span>
                        </div>
                      ) : (
                        <div className="col-span-15 text-[10px] text-zinc-700 italic pl-4">
                          Scheduled outside this timeline window (Due: {t.dueDate})
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
