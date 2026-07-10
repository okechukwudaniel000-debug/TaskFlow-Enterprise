/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, Calendar, 
  Layers, Pin, ArrowUpRight, MessageSquare, Bell, Sparkles, Shield, Radar, AlertCircle
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority, Task } from "../../types";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS, SHADOWS, TYPOGRAPHY } from "../../utils/themeTokens";

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

  const { colors } = useMilitaryTheme();

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
          title: "COMMS INTERCEPT",
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
          title: "AUDIT LOG ENTRY",
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
    <div className="space-y-6 relative z-10">
      
      {/* Welcome Banner Card (HUD Display) */}
      <div className={`relative overflow-hidden ${colors.bgCard} border ${colors.border} ${RADIUS.md} p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${SHADOWS.tactical} backdrop-blur-md`}>
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Subtle decorative crosshairs */}
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/10" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-white/10" />

        <div className="space-y-3 relative">
          <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 w-max rounded-sm">
            <Radar className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>COMMAND SECURE SUITE // ENCRYPTED COMMS ACTIVE</span>
          </div>
          <h2 className="text-lg md:text-xl font-mono font-bold tracking-wider text-white uppercase">
            OPERATOR SECURE SESSION: {currentUser?.name || "Officer"}
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl font-sans leading-relaxed">
            Your telemetry profile is synced. You have <span className="text-emerald-400 font-bold font-mono">[{assignedCount}] allocated sprint missions</span>. Stand by for status coordinates and tactical updates.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0 relative font-mono text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => onNavigateToView("board")}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-emerald-100 rounded-sm cursor-pointer shadow transition-all duration-150 active:scale-95"
          >
            Tactical Kanban
          </button>
          <button
            onClick={() => onNavigateToView("projects")}
            className={`px-4 py-2 bg-black/45 hover:bg-white/[0.02] text-zinc-300 border ${colors.border} rounded-sm cursor-pointer transition-all duration-150 active:scale-95`}
          >
            Mission Folders
          </button>
        </div>
      </div>

      {/* Grid: Statistical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md flex items-center justify-between hover:bg-white/[0.01] hover:border-neutral-500 transition-all duration-150 group`}>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Assigned Operations</p>
            <p className="text-2xl font-mono font-extrabold text-white">[{assignedCount}]</p>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Active Sector Alloc</p>
          </div>
          <div className={`w-10 h-10 ${colors.accentBg} ${RADIUS.sm} border ${colors.border} flex items-center justify-center ${colors.accent} transition-transform group-hover:scale-105`}>
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* In Progress */}
        <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md flex items-center justify-between hover:bg-white/[0.01] hover:border-neutral-500 transition-all duration-150 group`}>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Active Deployment</p>
            <p className="text-2xl font-mono font-extrabold text-white">[{inProgressCount}]</p>
            <p className="text-[9px] font-mono text-yellow-500 uppercase tracking-wider">In-progress execution</p>
          </div>
          <div className="w-10 h-10 bg-yellow-950/40 rounded-sm border border-yellow-800/40 flex items-center justify-center text-yellow-500 transition-transform group-hover:scale-105">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Overdue Issues */}
        <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md flex items-center justify-between hover:bg-white/[0.01] hover:border-neutral-500 transition-all duration-150 group`}>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Strategic Bottlenecks</p>
            <p className="text-2xl font-mono font-extrabold text-red-500">[{overdueTasks.length}]</p>
            <p className="text-[9px] font-mono text-red-400 uppercase tracking-wider">Breached deadline limits</p>
          </div>
          <div className="w-10 h-10 bg-red-950/40 rounded-sm border border-red-800/40 flex items-center justify-center text-red-400 transition-transform group-hover:scale-105">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Done Completed */}
        <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md flex items-center justify-between hover:bg-white/[0.01] hover:border-neutral-500 transition-all duration-150 group`}>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Missions Concluded</p>
            <p className="text-2xl font-mono font-extrabold text-[#76df91]">[{completedCount}]</p>
            <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Concluded & archived</p>
          </div>
          <div className="w-10 h-10 bg-emerald-950/40 rounded-sm border border-emerald-850 flex items-center justify-center text-[#76df91] transition-transform group-hover:scale-105">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Tasks, Deadlines, Pinned Projects (8 columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Overdue Alert list if any */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-950/10 border border-red-900/30 rounded-sm p-4.5 space-y-3 shadow-md">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono">CRITICAL THREAT BOTTLENECK ALERT ({overdueTasks.length})</h3>
              </div>
              <div className="space-y-2">
                {overdueTasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onSelectTask(t.id)}
                    className={`bg-black/40 border ${colors.border} hover:border-red-500/50 rounded-sm p-3.5 flex justify-between items-center gap-4 cursor-pointer transition-all`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-white uppercase tracking-wide truncate">{t.title}</p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-1">ID_TKT: {t.id} • DEADLINE BREACH: {t.dueDate}</p>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider font-mono bg-red-950/60 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-sm shrink-0">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Up Next / Upcoming Deadlines */}
          <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md space-y-4`}>
            <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                TACTICAL UP-NEXT & ALLOCATED MISSIONS
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">ORDER_BY: DEADLINE_SEQUENCE</span>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 border border-dashed border-white/[0.08] rounded-sm font-mono">
                  <p className="text-xs">[ALL CLEAR] No upcoming pending tasks.</p>
                </div>
              ) : (
                upcomingTasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onSelectTask(t.id)}
                    className={`flex justify-between items-center p-3.5 bg-black/35 border ${colors.border} rounded-sm hover:border-neutral-500 transition-all cursor-pointer hover:bg-white/[0.01]`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-white uppercase tracking-wide truncate leading-snug">{t.title}</p>
                      <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">
                        <span>ID_TKT: {t.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-400 font-bold"><Calendar className="w-3 h-3 text-zinc-500" /> TIMEFRAME: {t.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${
                        t.priority === TaskPriority.CRITICAL 
                          ? "bg-red-950/40 text-red-400 border-red-800/40" 
                          : t.priority === TaskPriority.HIGH 
                          ? "bg-amber-950/40 text-amber-400 border-amber-850/40"
                          : "bg-neutral-900 text-zinc-400 border-neutral-800"
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${
                        t.status === TaskStatus.DONE 
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-850" 
                          : t.status === TaskStatus.IN_PROGRESS 
                          ? "bg-yellow-950/40 text-yellow-400 border-yellow-800/40"
                          : "bg-black/40 text-sky-400 border-sky-950"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Favorite Projects Tracker */}
          <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md space-y-4`}>
            <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2.5">
                <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">PINNED SECTORS TRACK</h3>
              </div>
              <button 
                onClick={() => onNavigateToView("projects")} 
                className="text-[10px] font-mono font-bold tracking-wider text-[#8cb891] hover:text-white uppercase cursor-pointer"
              >
                [ALL SECTORS]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProjects.length === 0 ? (
                <p className="text-[10px] font-mono uppercase text-zinc-500 col-span-2">No projects pinned to favorites. Star them in catalogs!</p>
              ) : (
                favoriteProjects.map(proj => (
                  <div 
                    key={proj.id} 
                    className={`p-4.5 bg-black/35 border ${colors.border} rounded-sm hover:border-neutral-500 transition-all flex flex-col justify-between h-[130px]`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <span 
                          className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" 
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">{proj.name}</span>
                        <p className="text-[10px] text-zinc-500 truncate mt-1">{proj.description}</p>
                      </div>
                      <span className="text-[8px] uppercase font-mono tracking-widest text-zinc-400 bg-neutral-900 px-2 py-0.5 rounded-sm border border-white/[0.04]">
                        {proj.template}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-zinc-500 uppercase tracking-widest">MISSION LOAD</span>
                        <span className="text-emerald-400 font-bold">[{proj.progress}%]</span>
                      </div>
                      <div className="w-full bg-neutral-900 rounded-sm h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-800 to-emerald-500 h-1.5 rounded-sm transition-all duration-500" 
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
          <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md space-y-4`}>
            <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">ALERT SIGNALS</h3>
              </div>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllNotificationsAsRead}
                  className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 hover:text-white cursor-pointer"
                >
                  [DISMISS_ALL]
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-[10px] font-mono uppercase text-zinc-500">No telemetry notifications received.</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-sm border text-[10px] font-mono relative ${
                      n.isRead 
                        ? `bg-black/20 border-white/[0.03] ${colors.textMuted}` 
                        : "bg-emerald-950/20 border-emerald-900/40 text-white"
                     }`}
                  >
                    {!n.isRead && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                    <p className="font-bold pr-4 uppercase tracking-wide text-neutral-100">{n.title}</p>
                    <p className="text-zinc-500 mt-1 text-[10px] leading-relaxed lowercase font-sans">{n.description}</p>
                    <div className="flex justify-between items-center mt-2 font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {!n.isRead && (
                        <button 
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold"
                        >
                          [MARK_READ]
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Combined Workspace Activity feed log */}
          <div className={`${colors.bgCard} border ${colors.border} ${RADIUS.md} p-5 ${SHADOWS.tactical} backdrop-blur-md space-y-4`}>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2.5 border-b border-white/[0.05] pb-3">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> INTELLIGENCE LOG STREAM
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {recentFeed.length === 0 ? (
                <p className="text-[10px] font-mono uppercase text-zinc-500">No workspace activity logs found.</p>
              ) : (
                recentFeed.map(feed => (
                  <div 
                    key={feed.id} 
                    onClick={() => onSelectTask(feed.taskId)}
                    className={`p-3.5 bg-black/40 border border-white/[0.03] hover:border-neutral-500 transition-all rounded-sm text-[10px] font-mono space-y-2.5 cursor-pointer hover:bg-white/[0.01]`}
                  >
                    <div className="flex justify-between items-center text-[8px] text-zinc-500 tracking-wider">
                      <span className="font-bold text-emerald-400">[{feed.title}]</span>
                      <span>{new Date(feed.time).toLocaleDateString()}</span>
                    </div>
                    <p className="text-neutral-300 font-sans italic text-[10px] leading-relaxed">
                      "{feed.details}"
                    </p>
                    <p className="text-[9px] text-[#8cb891] truncate uppercase tracking-wider">
                      TACTICAL MISSION: {feed.taskTitle}
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
