import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckSquare, Clock, User, Flag, ArrowRight, Folder } from "lucide-react";
import { Task, TaskStatus, TaskPriority, User as UserType, Project } from "../../../types";

interface ListViewProps {
  tasks: Task[];
  users: UserType[];
  projects: Project[];
  onSelectTask: (id: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ tasks, users, projects, onSelectTask }) => {
  // Section collapsible state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const COLUMNS = [
    { id: TaskStatus.BACKLOG, title: "Backlog", color: "text-zinc-400 bg-zinc-500/10 border-zinc-800" },
    { id: TaskStatus.TODO, title: "To Do", color: "text-blue-400 bg-blue-500/10 border-blue-900/30" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "text-amber-400 bg-amber-500/10 border-amber-900/30" },
    { id: TaskStatus.REVIEW, title: "Code Review", color: "text-purple-400 bg-purple-500/10 border-purple-900/30" },
    { id: TaskStatus.TESTING, title: "QA Testing", color: "text-pink-400 bg-pink-500/10 border-pink-900/30" },
    { id: TaskStatus.DONE, title: "Done", color: "text-emerald-400 bg-emerald-500/10 border-emerald-900/30" },
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
    <div id="list-view-container" className="space-y-4 font-sans text-neutral-200">
      {COLUMNS.map(col => {
        const isCollapsed = !!collapsedSections[col.id];
        const list = tasksByStatus[col.id] || [];

        return (
          <div key={col.id} id={`list-status-section-${col.id}`} className="bg-[#0b0b0b] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
            {/* Section Header */}
            <div 
              onClick={() => toggleSection(col.id)}
              className="flex items-center justify-between px-4 py-3 bg-[#111111] hover:bg-[#161616] cursor-pointer select-none transition-colors border-b border-[#262626]"
            >
              <div className="flex items-center gap-2">
                <button className="text-zinc-500 hover:text-white transition-colors">
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-[10px] font-bold font-mono bg-neutral-800 border border-neutral-700 px-1.5 py-0.2 rounded text-zinc-400">
                  {list.length}
                </span>
              </div>
            </div>

            {/* Section Body */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                {list.length === 0 ? (
                  <div className="p-8 text-center text-zinc-600 text-xs flex flex-col items-center justify-center gap-1">
                    <Folder className="w-5 h-5 text-zinc-700" />
                    <span>No tasks found in this status.</span>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#262626] text-[10px] uppercase font-mono tracking-wider text-zinc-500 bg-[#0c0c0c]">
                        <th className="py-2.5 px-4 font-semibold w-24">ID</th>
                        <th className="py-2.5 px-4 font-semibold">Title & Indicators</th>
                        <th className="py-2.5 px-4 font-semibold w-40">Project</th>
                        <th className="py-2.5 px-4 font-semibold w-36">Assignee</th>
                        <th className="py-2.5 px-4 font-semibold w-28">Priority</th>
                        <th className="py-2.5 px-4 font-semibold w-32">Due Date</th>
                        <th className="py-2.5 px-4 font-semibold w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {list.map(t => {
                        const proj = projects.find(p => p.id === t.projectId);
                        const user = users.find(u => u.id === t.assigneeId);

                        return (
                          <tr 
                            key={t.id} 
                            id={`list-task-row-${t.id}`}
                            onClick={() => onSelectTask(t.id)}
                            className="hover:bg-[#151515]/60 cursor-pointer transition-colors text-xs"
                          >
                            {/* ID */}
                            <td className="py-3 px-4 font-mono text-[10px] font-semibold text-zinc-500">
                              {t.id}
                            </td>
                            {/* Title & Indicators */}
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors leading-relaxed">
                                  {t.title}
                                </span>
                                <div className="flex flex-wrap gap-2.5 items-center">
                                  {/* Subtasks counter */}
                                  {(t.subtasks.length > 0 || t.checklist.length > 0) && (
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                      <CheckSquare className="w-3 h-3 text-zinc-600" />
                                      <span>
                                        {t.subtasks.filter(s => s.isCompleted).length + t.checklist.filter(s => s.isCompleted).length}
                                        /
                                        {t.subtasks.length + t.checklist.length} tasks
                                      </span>
                                    </span>
                                  )}
                                  {/* Tags */}
                                  {t.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[9px] font-mono bg-[#161616] border border-[#262626] px-1.5 py-0.2 rounded text-zinc-400">
                                      {tag}
                                    </span>
                                  ))}
                                  {/* Recurrence setting indicator */}
                                  {t.recurrence && t.recurrence !== "none" && (
                                    <span className="text-[9px] font-mono bg-blue-950/20 text-blue-400 border border-blue-900/30 px-1.5 py-0.2 rounded uppercase">
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
                                  <span className="truncate max-w-[120px] font-medium text-zinc-300">{proj.name}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-600 font-mono text-[10px]">No project</span>
                              )}
                            </td>
                            {/* Assignee */}
                            <td className="py-3 px-4">
                              {user ? (
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-5 h-5 rounded-full object-cover border border-[#262626]"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="truncate max-w-[100px] text-zinc-300 font-medium">{user.name}</span>
                                </div>
                              ) : (
                                <span className="text-zinc-600 font-mono text-[10px]">Unassigned</span>
                              )}
                            </td>
                            {/* Priority */}
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                t.priority === TaskPriority.CRITICAL
                                  ? "bg-red-950/20 text-red-400 border-red-900/30"
                                  : t.priority === TaskPriority.HIGH
                                  ? "bg-amber-950/20 text-amber-400 border-amber-900/30"
                                  : t.priority === TaskPriority.MEDIUM
                                  ? "bg-blue-950/20 text-blue-400 border-blue-900/30"
                                  : "bg-neutral-800 text-zinc-400 border-neutral-750"
                              }`}>
                                {t.priority}
                              </span>
                            </td>
                            {/* Due Date */}
                            <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                              {t.dueDate ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-600" />
                                  <span>{t.dueDate}</span>
                                </span>
                              ) : (
                                <span className="text-zinc-700">No due date</span>
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
