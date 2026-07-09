import React from "react";
import { Users, AlertCircle, Sparkles, LayoutGrid } from "lucide-react";
import { Task, User as UserType } from "../../../types";

interface WorkloadViewProps {
  tasks: Task[];
  users: UserType[];
  onSelectTask: (id: string) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({ tasks, users, onSelectTask }) => {
  const WEEKLY_CAPACITY_HOURS = 40;

  // Calculate workload stats per user
  const workloadData = users.map(user => {
    const assignedTasks = tasks.filter(t => t.assigneeId === user.id && t.status !== "DONE");
    const totalEstHours = assignedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalLoggedHours = assignedTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    
    // Status color code
    let statusColor = "bg-emerald-500/20 text-emerald-400 border-emerald-900/30";
    let barColor = "bg-emerald-500";
    let statusLabel = "Balanced Allocation";

    if (totalEstHours > 40) {
      statusColor = "bg-red-950/20 text-red-400 border-red-900/30 animate-pulse";
      barColor = "bg-red-500";
      statusLabel = "Overallocated (>40h)";
    } else if (totalEstHours > 25) {
      statusColor = "bg-amber-950/20 text-amber-400 border-amber-900/30";
      barColor = "bg-amber-500";
      statusLabel = "At Capacity";
    }

    return {
      user,
      tasks: assignedTasks,
      totalEstHours,
      totalLoggedHours,
      statusLabel,
      statusColor,
      barColor
    };
  });

  return (
    <div id="workload-view-container" className="bg-[#0b0b0b] border border-[#262626] rounded-xl p-4 font-sans text-neutral-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm tracking-tight text-white uppercase">Workspace Workload Planner</h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Capacity threshold: 40 hours / week</span>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {workloadData.map(({ user, tasks: userTasks, totalEstHours, totalLoggedHours, statusLabel, statusColor, barColor }) => {
          const percentage = Math.min(100, (totalEstHours / WEEKLY_CAPACITY_HOURS) * 100);

          return (
            <div 
              key={user.id} 
              id={`workload-user-${user.id}`}
              className="p-4 bg-[#111] rounded-xl border border-[#222] hover:border-[#333] transition-colors flex flex-col md:flex-row gap-5 items-start justify-between"
            >
              {/* User Profile */}
              <div className="flex items-center gap-3 w-full md:w-56 shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover border border-[#262626]"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">{user.role}</p>
                </div>
              </div>

              {/* Allocation Stats & Progress */}
              <div className="flex-1 w-full space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Assigned: <span className="font-bold text-white">{userTasks.length} issues</span></span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">Est: <span className="font-bold text-white">{totalEstHours} hrs</span></span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">Logged: <span className="font-bold text-white">{totalLoggedHours} hrs</span></span>
                  </div>
                  
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#181818] border border-[#222] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Active Tasks Grid */}
              <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-[#262626] pt-3 md:pt-0 md:pl-4">
                <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-2 font-bold">Active Sprint Assignments</p>
                {userTasks.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 italic">No pending tasks for this user.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                    {userTasks.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => onSelectTask(t.id)}
                        className="px-2 py-1 bg-[#151515] hover:bg-[#1a1a1a] border border-[#262626] text-[9px] text-zinc-300 font-medium rounded cursor-pointer truncate max-w-[150px]"
                        title={`${t.id}: ${t.title}`}
                      >
                        {t.id} <span className="text-zinc-500">({t.estimatedHours || 0}h)</span>
                      </div>
                    ))}
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
