/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Search, ArrowRight, CheckSquare, Layers, 
  ChevronRight, ChevronDown, Move, Eye, Folder, SlidersHorizontal, Trash2,
  List, Calendar, Clock, BarChart4, Users, LayoutGrid
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority, Task, Project } from "../../types";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS, SHADOWS, TYPOGRAPHY } from "../../utils/themeTokens";
import { ListView } from "./views/ListView";
import { CalendarView } from "./views/CalendarView";
import { TimelineView } from "./views/TimelineView";
import { GanttView } from "./views/GanttView";
import { WorkloadView } from "./views/WorkloadView";

interface KanbanBoardProps {
  onSelectTask: (id: string) => void;
  onOpenCreateTask: (status: TaskStatus, date?: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onSelectTask, onOpenCreateTask }) => {
  const { 
    filteredTasks, updateTask, users, projects, 
    filterPriority, setFilterPriority, 
    filterAssignee, setFilterAssignee,
    filterProject, setFilterProject,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    bulkUpdateTasks
  } = useTaskFlow();

  const { colors, activeTheme } = useMilitaryTheme();

  // View type: kanban, list, calendar, timeline, gantt, workload
  const [viewType, setViewType] = useState<"kanban" | "list" | "calendar" | "timeline" | "gantt" | "workload">("kanban");

  // Column collapsible state
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({
    [TaskStatus.BACKLOG]: false,
    [TaskStatus.TODO]: false,
    [TaskStatus.IN_PROGRESS]: false,
    [TaskStatus.REVIEW]: false,
    [TaskStatus.TESTING]: false,
    [TaskStatus.DONE]: false,
  });

  // Bulk operation state
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<TaskStatus>(TaskStatus.TODO);

  // HTML5 Drag and Drop helper
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const toggleColumnCollapse = (status: TaskStatus) => {
    setCollapsedColumns(prev => ({ ...prev, [status]: !prev[status] }));
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (id) {
      updateTask(id, { status: targetStatus });
    }
    setDraggedTaskId(null);
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkMove = () => {
    if (selectedTaskIds.length === 0) return;
    bulkUpdateTasks(selectedTaskIds, bulkTargetStatus);
    setSelectedTaskIds([]);
    setBulkSelectMode(false);
  };

  // Define Columns
  const COLUMNS = [
    { id: TaskStatus.BACKLOG, title: "01 // BACKLOG", color: "border-t-zinc-700 bg-black/35" },
    { id: TaskStatus.TODO, title: "02 // STAGED", color: "border-t-[#8cb891]/60 bg-black/35" },
    { id: TaskStatus.IN_PROGRESS, title: "03 // IN ACTION", color: "border-t-yellow-600/60 bg-black/35" },
    { id: TaskStatus.REVIEW, title: "04 // CODE RECON", color: "border-t-purple-600/60 bg-black/35" },
    { id: TaskStatus.TESTING, title: "05 // QA TESTING", color: "border-t-pink-600/60 bg-black/35" },
    { id: TaskStatus.DONE, title: "06 // CONCLUDED", color: "border-t-emerald-600 bg-black/35" },
  ];

  // Group tasks by status
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.TESTING]: [],
      [TaskStatus.DONE]: [],
    };
    filteredTasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filteredTasks]);

  return (
    <div className="space-y-5 relative z-10">
      
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.05] pb-3">
        {[
          { id: "kanban", label: "KANBAN PANEL", icon: LayoutGrid },
          { id: "list", label: "LOG INDEX", icon: List },
          { id: "calendar", label: "CHRONO MAP", icon: Calendar },
          { id: "timeline", label: "SOCIOMETRICS", icon: Clock },
          { id: "gantt", label: "DEPLOYMENT SCHEDULER", icon: BarChart4 },
          { id: "workload", label: "OPERATOR CAPACITY", icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = viewType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-[10px] font-mono font-bold tracking-widest transition-all duration-150 cursor-pointer border ${
                isActive
                  ? "bg-white/[0.04] text-emerald-400 border-emerald-700/60 shadow-sm"
                  : "bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Board controls & Filter rail */}
      <div className={`${colors.bgCard} border ${colors.border} p-4.5 rounded-sm flex flex-col gap-4 ${SHADOWS.tactical} backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Direct Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER BY CALLSIGN, ID OR KEYWORDS..."
              className="w-full bg-black/40 border border-white/[0.05] rounded-sm pl-9 pr-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white placeholder-neutral-600 outline-none focus:border-neutral-500"
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Filter Priority */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "ALL")}
              className="bg-black/40 border border-white/[0.05] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 rounded-sm p-2 cursor-pointer focus:border-neutral-500 outline-none"
            >
              <option value="ALL" className="bg-neutral-900">ALL THREAT LIMITS</option>
              <option value={TaskPriority.CRITICAL} className="bg-neutral-900">CRITICAL</option>
              <option value={TaskPriority.HIGH} className="bg-neutral-900">HIGH</option>
              <option value={TaskPriority.MEDIUM} className="bg-neutral-900">MEDIUM</option>
              <option value={TaskPriority.LOW} className="bg-neutral-900">LOW</option>
              <option value={TaskPriority.LOWEST} className="bg-neutral-900">LOWEST</option>
            </select>

            {/* Filter Assignee */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-black/40 border border-white/[0.05] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 rounded-sm p-2 cursor-pointer focus:border-neutral-500 outline-none"
            >
              <option value="ALL" className="bg-neutral-900">ALL COMMAND STAFF</option>
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-neutral-900">{u.name.toUpperCase()}</option>
              ))}
            </select>

            {/* Filter Project */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-black/40 border border-white/[0.05] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 rounded-sm p-2 cursor-pointer focus:border-neutral-500 outline-none"
            >
              <option value="ALL" className="bg-neutral-900">ALL MISSIONS</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-neutral-900">{p.name.toUpperCase()}</option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/[0.05] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 rounded-sm p-2 cursor-pointer focus:border-neutral-500 outline-none"
            >
              <option value="newest" className="bg-neutral-900">CHRONO: NEWEST</option>
              <option value="oldest" className="bg-neutral-900">CHRONO: OLDEST</option>
              <option value="priority" className="bg-neutral-900">THREAT CAPACITY</option>
              <option value="dueDate" className="bg-neutral-900">TIME REMAINING</option>
              <option value="alphabetical" className="bg-neutral-900">LEXICAL SEQUENCE</option>
            </select>

            {/* Bulk Mode toggler */}
            <button
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                setSelectedTaskIds([]);
              }}
              className={`px-3 py-2 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-150 ${
                bulkSelectMode 
                  ? "bg-amber-800 border-amber-600 text-amber-100" 
                  : "bg-black/40 border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.01]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{bulkSelectMode ? "ABORT BULK" : "BULK ALLOC"}</span>
            </button>

          </div>
        </div>

        {/* Bulk action row when active */}
        {bulkSelectMode && (
          <div className="bg-black/40 p-3.5 rounded-sm border border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <span className="text-[10px] font-mono tracking-wider text-zinc-300 uppercase">
              SELECTED OPERATIONS: <span className="font-bold text-amber-400">[{selectedTaskIds.length}]</span> TICKETS STAGED
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">REDIRECT VECTOR:</span>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value as TaskStatus)}
                className="bg-black/80 border border-white/[0.05] text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300 rounded-sm p-1.5 outline-none"
              >
                <option value={TaskStatus.BACKLOG}>BACKLOG</option>
                <option value={TaskStatus.TODO}>TODO</option>
                <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
                <option value={TaskStatus.REVIEW}>CODE REVIEW</option>
                <option value={TaskStatus.TESTING}>QA TESTING</option>
                <option value={TaskStatus.DONE}>DONE</option>
              </select>
              <button
                onClick={handleBulkMove}
                disabled={selectedTaskIds.length === 0}
                className="px-4 py-1.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-amber-100 font-mono font-bold uppercase tracking-wider rounded-sm text-[10px] cursor-pointer transition-all"
              >
                EXECUTE DISPATCH
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Conditional Views */}
      {viewType === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4.5 min-w-[1200px] h-[75vh]">
            {COLUMNS.map(col => {
              const isCollapsed = collapsedColumns[col.id];
              const columnTasks = tasksByColumn[col.id] || [];

              return (
                <div 
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex flex-col rounded-sm border border-white/[0.04] p-3.5 h-full transition-all duration-200 select-none ${col.color} ${
                    isCollapsed ? "w-16 shrink-0" : "w-72 shrink-0"
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3.5 shrink-0 pb-2 border-b border-white/[0.02]">
                    <div className="flex items-center gap-2 min-w-0">
                      <button 
                        onClick={() => toggleColumnCollapse(col.id)}
                        className="p-1 hover:bg-white/[0.02] rounded-sm text-zinc-500 cursor-pointer"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {!isCollapsed && (
                        <>
                          <h4 className="text-[10px] font-mono font-bold text-white truncate tracking-wider uppercase">{col.title}</h4>
                          <span className="text-[9px] bg-black/40 border border-white/[0.05] px-1.5 py-0.5 rounded-sm text-emerald-400 font-bold font-mono">
                            {columnTasks.length}
                          </span>
                        </>
                      )}
                    </div>

                    {!isCollapsed && (
                      <button 
                        onClick={() => onOpenCreateTask(col.id)}
                        className="p-1 hover:bg-white/[0.02] rounded-sm text-zinc-500 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Collapsed side banner style if collapsed */}
                  {isCollapsed ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-widest uppercase rotate-90 origin-center whitespace-nowrap">
                        {col.title.replace(/\d+\s\/\/\s/, "")}
                      </span>
                      <span className="text-[9px] bg-black/40 border border-white/[0.05] px-1.5 rounded-sm text-zinc-400 font-bold font-mono mt-2">
                        {columnTasks.length}
                      </span>
                    </div>
                  ) : (
                    // Scrollable cards list
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                      {columnTasks.length === 0 ? (
                        <div className="border border-dashed border-white/[0.04] rounded-sm p-6 text-center text-zinc-600 text-[10px] font-mono h-32 flex flex-col items-center justify-center gap-1.5">
                          <Folder className="w-4 h-4 text-zinc-700" />
                          <span className="uppercase tracking-widest">[ZONE EMPTY]</span>
                        </div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {columnTasks.map(t => {
                            const taskAssignee = users.find(u => u.id === t.assigneeId);
                            const isSelected = selectedTaskIds.includes(t.id);

                            return (
                              <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -2 }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, t.id)}
                                onClick={() => {
                                  if (bulkSelectMode) {
                                    toggleTaskSelection(t.id);
                                  } else {
                                    onSelectTask(t.id);
                                  }
                                }}
                                className={`p-3.5 rounded-sm border transition-all duration-150 relative cursor-pointer group flex flex-col gap-3 ${
                                  isSelected
                                    ? "bg-amber-950/20 border-amber-600/70 shadow-sm"
                                    : draggedTaskId === t.id
                                    ? "opacity-30 bg-black border-transparent"
                                    : "bg-black/40 border-white/[0.03] hover:border-neutral-500 hover:bg-black/60 shadow"
                                }`}
                              >
                                {/* Drag handle dots hover-only */}
                                <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-40 transition-opacity text-zinc-500">
                                  <Move className="w-3.5 h-3.5" />
                                </div>

                                {/* Task meta row */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] font-mono font-bold text-zinc-500 tracking-wider">
                                    ID: {t.id}
                                  </span>
                                  
                                  {bulkSelectMode && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}} // Swallowed for click wrapper
                                      className="rounded-sm bg-neutral-900 border-neutral-800 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                                    />
                                  )}
                                </div>

                                {/* Task Title */}
                                <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wide leading-relaxed line-clamp-2">
                                  {t.title}
                                </h5>

                                {/* Subtask / checklist counter row */}
                                {(t.subtasks.length > 0 || t.checklist.length > 0) && (
                                  <div className="flex gap-2 items-center text-[9px] font-mono uppercase tracking-wider">
                                    {t.subtasks.length > 0 && (
                                      <span className="flex items-center gap-1 bg-[#1a221b]/40 border border-white/[0.02] px-1.5 py-0.5 rounded-sm text-zinc-400">
                                        <CheckSquare className="w-3 h-3 text-zinc-500" />
                                        <span>{t.subtasks.filter(s => s.isCompleted).length}/{t.subtasks.length} SECS</span>
                                      </span>
                                    )}
                                    {t.checklist.length > 0 && (
                                      <span className="flex items-center gap-1 bg-[#1a221b]/40 border border-white/[0.02] px-1.5 py-0.5 rounded-sm text-[#76df91]">
                                        <CheckSquare className="w-3 h-3 text-emerald-500" />
                                        <span>{t.checklist.filter(i => i.isCompleted).length}/{t.checklist.length} QA</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Tags list row */}
                                {t.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {t.tags.slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="text-[8px] bg-black/40 border border-white/[0.03] px-1.5 py-0.5 rounded-sm text-zinc-400 font-mono tracking-wider uppercase">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Footer parameters row */}
                                <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.02] shrink-0">
                                  
                                  {/* Color-coded Priority Badge */}
                                  <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${
                                    t.priority === TaskPriority.CRITICAL 
                                      ? "bg-red-950/40 text-red-400 border-red-800/40" 
                                      : t.priority === TaskPriority.HIGH 
                                      ? "bg-amber-950/40 text-amber-400 border-amber-850/40"
                                      : t.priority === TaskPriority.MEDIUM
                                      ? "bg-sky-950/40 text-sky-400 border-sky-800/40"
                                      : "bg-neutral-900 text-zinc-400 border-neutral-800"
                                  }`}>
                                    {t.priority}
                                  </span>

                                  {/* Assignee Avatar */}
                                  <div className="flex items-center gap-1.5">
                                    {taskAssignee ? (
                                      <img 
                                        src={taskAssignee.avatar} 
                                        alt={taskAssignee.name} 
                                        title={`Assigned callsign ${taskAssignee.name}`}
                                        className="w-5 h-5 rounded-full object-cover border border-white/[0.06]"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-zinc-500 border border-white/[0.03] text-[8px] font-mono font-bold">
                                        UA
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      ) : viewType === "list" ? (
        <ListView 
          tasks={filteredTasks} 
          users={users} 
          projects={projects} 
          onSelectTask={onSelectTask} 
        />
      ) : viewType === "calendar" ? (
        <CalendarView 
          tasks={filteredTasks} 
          users={users} 
          onSelectTask={onSelectTask} 
          onOpenCreateTask={onOpenCreateTask} 
        />
      ) : viewType === "timeline" ? (
        <TimelineView 
          tasks={filteredTasks} 
          users={users} 
          projects={projects} 
          onSelectTask={onSelectTask} 
        />
      ) : viewType === "gantt" ? (
        <GanttView 
          tasks={filteredTasks} 
          users={users} 
          onSelectTask={onSelectTask} 
          onUpdateDependencies={(taskId, deps) => updateTask(taskId, { dependencies: deps })} 
        />
      ) : (
        <WorkloadView 
          tasks={filteredTasks} 
          users={users} 
          onSelectTask={onSelectTask} 
        />
      )}

    </div>
  );
};
