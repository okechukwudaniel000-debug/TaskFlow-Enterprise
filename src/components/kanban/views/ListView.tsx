import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckSquare, Clock, User, Flag, ArrowRight, Folder } from "lucide-react";
import { Task, TaskStatus, TaskPriority, User as UserType, Project } from "../../../types";
import { useMilitaryTheme } from "../../../contexts/MilitaryThemeContext";

interface ListViewProps {
  tasks: Task[];
  users: UserType[];
  projects: Project[];
  onSelectTask: (id: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ tasks, users, projects, onSelectTask }) => {
  const { colors } = useMilitaryTheme();
  // Section collapsible state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const COLUMNS = [
    { id: TaskStatus.BACKLOG, title: "01 // BACKLOG", color: "text-zinc-400 bg-zinc-950/40 border-zinc-800" },
    { id: TaskStatus.TODO, title: "02 // STAGED", color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30" },
    { id: TaskStatus.IN_PROGRESS, title: "03 // IN ACTION", color: "text-yellow-400 bg-yellow-950/40 border-yellow-850/30" },
    { id: TaskStatus.REVIEW, title: "04 // CODE RECON", color: "text-purple-400 bg-purple-950/40 border-purple-900/30" },
    { id: TaskStatus.TESTING, title: "05 // QA TESTING", color: "text-pink-400 bg-pink-950/40 border-pink-900/30" },
    { id: TaskStatus.DONE, title: "06 // CONCLUDED", color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/30" },
  ];

  const toggleSection = (status: TaskStatus) => {
    setCollapsedSections(prev => ({ ...prev, [status]: !prev[status] }));
  };

  // Group tasks
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div id="list-view-container" className="space-y-4 font-mono text-neutral-200 relative z-10">
      {COLUMNS.map(col => {
        const isCollapsed = !!collapsedSections[col.id];
        const list = tasksByStatus[col.id] || [];

        return (
          <div key={col.id} id={`list-status-section-${col.id}`} className={`bg-black/35 border ${colors.border} rounded-sm overflow-hidden shadow-sm`}>
            {/* Section Header */}
            <div 
              onClick={() => toggleSection(col.id)}
              className={`flex items-center justify-between px-4 py-3 bg-black/25 hover:bg-white/[0.01] cursor-pointer select-none transition-colors border-b ${colors.borderMuted}`}
            >
              <div className="flex items-center gap-2">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-[9px] font-bold font-mono bg-neutral-900 border border-white/[0.04] px-1.5 py-0.2 rounded-sm text-zinc-400">
                  {list.length}
                </span>
              </div>
            </div>

            {/* Section Body */}
            {!isCollapsed && (
              <div className="overflow-x-auto scrollbar-thin">
                {list.length === 0 ? (
                  <div className="p-8 text-center text-zinc-600 text-[10px] font-mono flex flex-col items-center justify-center gap-1.5 uppercase">
                    <Folder className="w-4 h-4 text-zinc-700" />
                    <span>[ZONE EMPTY] No tasks located.</span>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${colors.borderMuted} text-[9px] uppercase font-mono tracking-widest text-zinc-500 bg-black/10`}>
                        <th className="py-2.5 px-4 font-bold w-24">TACT_ID</th>
                        <th className="py-2.5 px-4 font-bold">TACTICAL_MEMBER_TASK</th>
                        <th className="py-2.5 px-4 font-bold w-40">SECTOR_DIVISION</th>
                        <th className="py-2.5 px-4 font-bold w-36">LEAD_OP</th>
                        <th className="py-2.5 px-4 font-bold w-28">THREAT_PRIOR</th>
                        <th className="py-2.5 px-4 font-bold w-32">TIMEFRAME</th>
                        <th className="py-2.5 px-4 font-bold w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {list.map(t => {
                        const proj = projects.find(p => p.id === t.projectId);
                        const user = users.find(u => u.id === t.assigneeId);

                        return (
                          <tr 
                            key={t.id} 
                            id={`list-task-row-${t.id}`}
                            onClick={() => onSelectTask(t.id)}
                            className="hover:bg-white/[0.01] cursor-pointer transition-colors text-[11px]"
                          >
                            {/* ID */}
                            <td className="py-3 px-4 font-mono text-[9px] font-bold text-zinc-500">
                              {t.id}
                            </td>
                            {/* Title & Indicators */}
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-mono font-bold text-white tracking-wide uppercase transition-colors leading-relaxed">
                                  {t.title}
                                </span>
                                <div className="flex flex-wrap gap-2.5 items-center">
                                  {/* Subtasks counter */}
                                  {(t.subtasks.length > 0 || t.checklist.length > 0) && (
                                    <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 uppercase">
                                      <CheckSquare className="w-3 h-3 text-zinc-600" />
                                      <span>
                                        {t.subtasks.filter(s => s.isCompleted).length + t.checklist.filter(s => s.isCompleted).length}
                                        /
                                        {t.subtasks.length + t.checklist.length} SECS
                                      </span>
                                    </span>
                                  )}
                                  {/* Tags */}
                                  {t.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[8px] font-mono bg-black/40 border border-white/[0.03] px-1.5 py-0.2 rounded-sm text-zinc-400 uppercase tracking-wider">
                                      {tag}
                                    </span>
                                  ))}
                                  {/* Recurrence setting indicator */}
                                  {t.recurrence && t.recurrence !== "none" && (
                                    <span className="text-[8px] font-mono bg-[#1a221b]/40 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                                      ↻ {t.recurrence}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* Project */}
                            <td className="py-3 px-4 text-zinc-400">
                              {proj ? (
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: proj.color || "#3b82f6" }} />
                                  <span className="truncate max-w-[120px] font-mono font-bold text-zinc-300 uppercase tracking-wide">{proj.name}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-600 font-mono text-[9px] uppercase">No sector</span>
                              )}
                            </td>
                            {/* Assignee */}
                            <td className="py-3 px-4">
                              {user ? (
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-5 h-5 rounded-full object-cover border border-white/[0.04]"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="truncate max-w-[100px] text-zinc-300 font-mono font-bold uppercase">{user.name}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-600 font-mono text-[9px] uppercase">Unassigned</span>
                              )}
                            </td>
                            {/* Priority */}
                            <td className="py-3 px-4">
                              <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                                t.priority === TaskPriority.CRITICAL
                                  ? "bg-red-950/40 text-red-400 border-red-800/40"
                                  : t.priority === TaskPriority.HIGH
                                  ? "bg-amber-950/40 text-amber-400 border-amber-850/40"
                                  : t.priority === TaskPriority.MEDIUM
                                  ? "bg-sky-950/40 text-sky-400 border-sky-850/40"
                                  : "bg-neutral-900 text-zinc-400 border-neutral-800"
                              }`}>
                                {t.priority}
                              </span>
                            </td>
                            {/* Due Date */}
                            <td className="py-3 px-4 text-zinc-400 font-mono text-[10px] uppercase">
                              {t.dueDate ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-600" />
                                  <span>{t.dueDate}</span>
                                </span>
                              ) : (
                                <span className="text-zinc-700">No deadline</span>
                              )}
                            </td>
                            {/* Action chevron */}
                            <td className="py-3 px-4 text-right">
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
