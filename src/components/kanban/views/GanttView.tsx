import React, { useState } from "react";
import { ListCollapse, AlertTriangle, Link2, Plus, Trash2, HelpCircle } from "lucide-react";
import { Task, User as UserType } from "../../../types";

interface GanttViewProps {
  tasks: Task[];
  users: UserType[];
  onSelectTask: (id: string) => void;
  onUpdateDependencies: (taskId: string, dependencies: string[]) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({ tasks, users, onSelectTask, onUpdateDependencies }) => {
  const [selectedTaskForDep, setSelectedTaskForDep] = useState<string | null>(null);
  const [newDepId, setNewDepId] = useState("");

  // Check if a task has dependency conflicts
  // A conflict exists if Task A depends on Task B, but Task A's due date is BEFORE Task B's due date
  const checkDependencyConflict = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return null;
    if (!task.dueDate) return null;

    const taskDate = new Date(task.dueDate);
    const conflicts: string[] = [];

    task.dependencies.forEach(depId => {
      const prerequisite = tasks.find(t => t.id === depId);
      if (prerequisite && prerequisite.dueDate) {
        const prereqDate = new Date(prerequisite.dueDate);
        if (taskDate < prereqDate) {
          conflicts.push(`${prerequisite.id} (Due ${prerequisite.dueDate})`);
        }
      }
    });

    return conflicts.length > 0 ? conflicts : null;
  };

  const handleAddDependency = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepId) return;

    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask) {
      const existingDeps = currentTask.dependencies || [];
      if (!existingDeps.includes(newDepId) && newDepId !== taskId) {
        const updated = [...existingDeps, newDepId];
        onUpdateDependencies(taskId, updated);
      }
    }
    setNewDepId("");
  };

  const handleRemoveDependency = (taskId: string, depIdToRemove: string) => {
    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask) {
      const existingDeps = currentTask.dependencies || [];
      const updated = existingDeps.filter(d => d !== depIdToRemove);
      onUpdateDependencies(taskId, updated);
    }
  };

  return (
    <div id="gantt-view-container" className="bg-[#0b0b0b] border border-[#262626] rounded-xl p-4 font-sans text-neutral-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <ListCollapse className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm tracking-tight text-white uppercase">Gantt Dependency Engine</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-time conflict validation active</span>
        </div>
      </div>

      {/* Gantt Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-[#1f1f1f] text-[10px] uppercase font-mono tracking-wider text-zinc-500 bg-[#0c0c0c]">
              <th className="py-2 px-3">Issue ID & Title</th>
              <th className="py-2 px-3 w-32">Assignee</th>
              <th className="py-2 px-3 w-32">Due Date</th>
              <th className="py-2 px-3 w-64">Dependencies & Prerequisites</th>
              <th className="py-2 px-3 w-44">Timeline Spanning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151515]">
            {tasks.map(t => {
              const user = users.find(u => u.id === t.assigneeId);
              const conflicts = checkDependencyConflict(t);
              const deps = t.dependencies || [];

              return (
                <tr 
                  key={t.id} 
                  id={`gantt-row-${t.id}`}
                  className="hover:bg-[#121212] transition-colors text-xs"
                >
                  {/* Title & Click selection */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-500">{t.id}</span>
                        <span 
                          onClick={() => onSelectTask(t.id)}
                          className="font-semibold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {t.title}
                        </span>
                      </div>
                      
                      {/* Conflict Alert message */}
                      {conflicts && (
                        <div className="flex items-center gap-1.5 text-[9px] text-amber-400 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded w-fit font-mono mt-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Scheduling Conflict: Pre-requisites {conflicts.join(", ")} expire after this task's due date.</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-3">
                    {user ? (
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-4.5 h-4.5 rounded-full object-cover border border-[#262626]"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate max-w-[80px] text-zinc-400 font-medium">{user.name}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">None</span>
                    )}
                  </td>

                  {/* Due date */}
                  <td className="py-3.5 px-3 text-zinc-400 font-mono text-[10px]">
                    {t.dueDate || "No due date"}
                  </td>

                  {/* Dependencies Column */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-1.5">
                      {/* List dependencies */}
                      {deps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {deps.map(depId => (
                            <span 
                              key={depId} 
                              className="inline-flex items-center gap-1 text-[9px] font-mono bg-[#161616] hover:bg-[#202020] border border-[#262626] px-2 py-0.5 rounded text-indigo-300"
                            >
                              <Link2 className="w-2.5 h-2.5 text-zinc-500" />
                              <span>{depId}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDependency(t.id, depId);
                                }}
                                className="text-zinc-500 hover:text-red-400 font-bold ml-0.5 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Manage/Add Dependency */}
                      {selectedTaskForDep === t.id ? (
                        <form 
                          onSubmit={(e) => {
                            handleAddDependency(t.id, e);
                            setSelectedTaskForDep(null);
                          }}
                          className="flex items-center gap-1.5 mt-1"
                        >
                          <select
                            value={newDepId}
                            onChange={(e) => setNewDepId(e.target.value)}
                            className="bg-[#151515] border border-zinc-800 text-[10px] text-zinc-300 rounded p-1 outline-none"
                            required
                          >
                            <option value="">Select prerequisite...</option>
                            {tasks
                              .filter(tk => tk.id !== t.id && !deps.includes(tk.id))
                              .map(tk => (
                                <option key={tk.id} value={tk.id}>{tk.id} - {tk.title.slice(0, 30)}...</option>
                              ))}
                          </select>
                          <button 
                            type="submit"
                            className="px-1.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] cursor-pointer"
                          >
                            Link
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSelectedTaskForDep(null)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300"
                          >
                            Close
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskForDep(t.id);
                          }}
                          className="text-[9px] text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link Prerequisite</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Visual Duration representation */}
                  <td className="py-3.5 px-3">
                    <div className="w-full bg-[#161616] border border-[#222] h-4 rounded overflow-hidden relative" title={`Estimated: ${t.estimatedHours || 0} hrs`}>
                      <div 
                        className={`h-full rounded transition-all ${
                          t.status === "DONE" 
                            ? "bg-emerald-500/30" 
                            : t.status === "IN_PROGRESS" 
                            ? "bg-amber-500/30"
                            : "bg-indigo-500/20"
                        }`}
                        style={{
                          width: t.status === "DONE" ? "100%" : t.status === "IN_PROGRESS" ? "60%" : "20%"
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-zinc-500">
                        {t.status === "DONE" ? "100%" : t.status === "IN_PROGRESS" ? "60%" : "EST"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
