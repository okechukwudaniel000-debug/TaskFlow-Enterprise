/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, Calendar, 
  Layers, Pin, ArrowUpRight, MessageSquare, Bell, Sparkles
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority, Task } from "../../types";

interface DashboardOverviewProps {
  onNavigateToView: (view: string) => void;
  onSelectTask: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onNavigateToView, 
  onSelectTask 
}) => {
  const { 
    currentUser, tasks, projects, notifications, 
    markNotificationAsRead, markAllNotificationsAsRead 
  } = useTaskFlow();

  // 1. Filter metrics specific to current logged-in user
  const userTasks = useMemo(() => {
    return tasks.filter(t => t.assigneeId === currentUser?.id && !t.isArchived);
  }, [tasks, currentUser]);

  const assignedCount = userTasks.length;

  const inProgressCount = useMemo(() => {
    return userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  }, [userTasks]);

  const completedCount = useMemo(() => {
    return userTasks.filter(t => t.status === TaskStatus.DONE).length;
  }, [userTasks]);

  const overdueTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return userTasks.filter(t => t.status !== TaskStatus.DONE && t.dueDate && t.dueDate < todayStr);
  }, [userTasks]);

  const upcomingTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return userTasks
      .filter(t => t.status !== TaskStatus.DONE && t.dueDate && t.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [userTasks]);

  // Favorite Projects progress
  const favoriteProjects = useMemo(() => {
    return projects.filter(p => p.isFavorite && !p.isArchived);
  }, [projects]);

  // Feed: Combined Activity logs and Comments across user tasks
  const recentFeed = useMemo(() => {
    const feedItems: Array<{
      id: string;
      type: "comment" | "activity";
      title: string;
      details: string;
      time: string;
      taskTitle: string;
      taskId: string;
    }> = [];

    tasks.forEach(t => {
      // Add comments
      t.comments.forEach(c => {
        feedItems.push({
          id: c.id,
          type: "comment",
          title: "New Comment",
          details: c.content,
          time: c.createdAt,
          taskTitle: t.title,
          taskId: t.id
        });
      });

      // Add major activity
      t.activityTimeline.slice(-3).forEach(act => {
        feedItems.push({
          id: act.id,
          type: "activity",
          title: "Audit Update",
          details: act.details,
          time: act.createdAt,
          taskTitle: t.title,
          taskId: t.id
        });
      });
    });

    return feedItems
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [tasks]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden bg-[#151515] border border-[#262626] rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" />
            <span>TaskFlow Enterprise Suite Live</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Welcome back, {currentUser?.name || "Daniel"}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            You currently have <span className="text-blue-400 font-semibold">{assignedCount} active sprint tasks</span> assigned to your profile. Let's plan, track, and ship today!
          </p>
        </div>

        <div className="flex gap-3 shrink-0 relative">
          <button
            onClick={() => onNavigateToView("board")}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all duration-200 cursor-pointer"
          >
            Go to Sprint Board
          </button>
          <button
            onClick={() => onNavigateToView("projects")}
            className="px-3 py-1.5 rounded-md bg-[#1a1a1a] hover:bg-[#222] text-zinc-300 border border-[#262626] font-medium text-xs transition-all duration-200 cursor-pointer"
          >
            Explore Projects
          </button>
        </div>
      </div>

      {/* Grid: Statistical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm flex items-center justify-between hover:bg-[#1a1a1a] hover:border-[#333] transition-all duration-150">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Assigned Sprint Issues</p>
            <p className="text-2xl font-bold text-white">{assignedCount}</p>
            <p className="text-[10px] text-zinc-400">Total backlog allocated</p>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm flex items-center justify-between hover:bg-[#1a1a1a] hover:border-[#333] transition-all duration-150">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Tasks In Progress</p>
            <p className="text-2xl font-bold text-white">{inProgressCount}</p>
            <p className="text-[10px] text-yellow-500">Active coding execution</p>
          </div>
          <div className="w-10 h-10 bg-yellow-500/10 rounded-md flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Issues */}
        <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm flex items-center justify-between hover:bg-[#1a1a1a] hover:border-[#333] transition-all duration-150">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Overdue Bottlenecks</p>
            <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
            <p className="text-[10px] text-red-400">Requires immediate priority</p>
          </div>
          <div className="w-10 h-10 bg-red-500/10 rounded-md flex items-center justify-center text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Done Completed */}
        <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm flex items-center justify-between hover:bg-[#1a1a1a] hover:border-[#333] transition-all duration-150">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Completed Tickets</p>
            <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
            <p className="text-[10px] text-emerald-500">Closed & shipped in sprint</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Tasks, Deadlines, Pinned Projects (8 columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Overdue Alert list if any */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Critical Bottleneck Alert ({overdueTasks.length})</h3>
              </div>
              <div className="space-y-2">
                {overdueTasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onSelectTask(t.id)}
                    className="bg-[#0b0b0b] border border-[#262626] hover:border-red-900/40 rounded-md p-3 flex justify-between items-center gap-4 cursor-pointer hover:bg-[#1a1a1a] transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {t.id} • Overdue since: {t.dueDate}</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-mono bg-red-900/20 text-red-300 border border-red-900/30 px-2 py-0.5 rounded shrink-0">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Up Next / Upcoming Deadlines */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                My Active Tasks & Up Next
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Sorted by Due Date</span>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 border border-dashed border-[#262626] rounded-xl">
                  <p className="text-xs">Great job! No upcoming pending tasks.</p>
                </div>
              ) : (
                upcomingTasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onSelectTask(t.id)}
                    className="flex justify-between items-center p-3 bg-[#0b0b0b] border border-[#262626] rounded-md hover:border-[#333] transition-all cursor-pointer hover:bg-[#1a1a1a]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate leading-snug">{t.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono mt-1">
                        <span>ID: {t.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-500" /> {t.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        t.priority === TaskPriority.CRITICAL 
                          ? "bg-red-950/20 text-red-400 border-red-900/30" 
                          : t.priority === TaskPriority.HIGH 
                          ? "bg-amber-950/20 text-amber-400 border-amber-900/30"
                          : "bg-neutral-800 text-zinc-400 border-neutral-750"
                      }`}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] bg-blue-950/20 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded font-mono uppercase">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Favorite Projects Tracker */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Pinned Projects Track</h3>
              </div>
              <button 
                onClick={() => onNavigateToView("projects")} 
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                All Projects
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProjects.length === 0 ? (
                <p className="text-xs text-zinc-500 italic col-span-2">No projects pinned to dashboard favorites yet. Toggle stars in Catalog!</p>
              ) : (
                favoriteProjects.map(proj => (
                  <div 
                    key={proj.id} 
                    className="p-4 bg-[#0b0b0b] border border-[#262626] rounded-md hover:border-[#333] transition-all flex flex-col justify-between h-[120px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <span 
                          className="w-2 h-2 rounded-full inline-block mr-2" 
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="text-xs font-semibold text-white truncate">{proj.name}</span>
                        <p className="text-[10px] text-zinc-500 truncate mt-1">{proj.description}</p>
                      </div>
                      <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 bg-[#1a1a1a] px-1.5 rounded border border-[#262626]">
                        {proj.template}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-zinc-500">Progress metrics</span>
                        <span className="text-white font-semibold">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-500" 
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Notifications, Activity and Comments Feed (4 columns) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Unread Notifications Feed widget */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400 shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notifications</h3>
              </div>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllNotificationsAsRead}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No notifications on record.</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-md border text-xs relative ${
                      n.isRead 
                        ? "bg-[#0b0b0b] border-[#262626] text-zinc-400" 
                        : "bg-[#161d2f]/30 border-blue-900/20 text-white"
                     }`}
                  >
                    {!n.isRead && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    <p className="font-semibold pr-4 text-white">{n.title}</p>
                    <p className="text-zinc-400 mt-1 text-[11px]">{n.description}</p>
                    <div className="flex justify-between items-center mt-2.5 font-mono text-[9px] text-zinc-500">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {!n.isRead && (
                        <button 
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Combined Workspace Activity feed log */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-500" /> Workspace Activity Feed
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {recentFeed.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No recent comments or updates detected.</p>
              ) : (
                recentFeed.map(feed => (
                  <div 
                    key={feed.id} 
                    onClick={() => onSelectTask(feed.taskId)}
                    className="p-3 bg-[#0b0b0b] border border-[#262626] hover:border-[#333] transition-all rounded-md text-xs space-y-2 cursor-pointer hover:bg-[#1a1a1a]"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span className="uppercase text-zinc-400 font-medium">{feed.title}</span>
                      <span>{new Date(feed.time).toLocaleDateString()}</span>
                    </div>
                    <p className="text-zinc-300 italic text-[11px]">
                      "{feed.details}"
                    </p>
                    <p className="text-[10px] font-mono text-blue-400 truncate mt-1">
                      Ticket: {feed.taskTitle}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
