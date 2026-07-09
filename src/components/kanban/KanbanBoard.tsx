/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, Search, ArrowRight, CheckSquare, Layers, 
  ChevronRight, ChevronDown, Move, Eye, Folder, SlidersHorizontal, Trash2,
  List, Calendar, Clock, BarChart4, Users, LayoutGrid
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority, Task, Project } from "../../types";
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
    { id: TaskStatus.BACKLOG, title: "Backlog", color: "border-t-zinc-600 bg-[#0b0b0b]/40" },
    { id: TaskStatus.TODO, title: "To Do", color: "border-t-blue-500 bg-[#0b0b0b]/40" },
    { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "border-t-amber-500 bg-[#0b0b0b]/40" },
    { id: TaskStatus.REVIEW, title: "Code Review", color: "border-t-purple-500 bg-[#0b0b0b]/40" },
    { id: TaskStatus.TESTING, title: "QA Testing", color: "border-t-pink-500 bg-[#0b0b0b]/40" },
    { id: TaskStatus.DONE, title: "Done", color: "border-t-emerald-500 bg-[#0b0b0b]/40" },
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
    <div className="space-y-4">
      
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#222222] pb-3">
        {[
          { id: "kanban", label: "Kanban Board", icon: LayoutGrid },
          { id: "list", label: "List View", icon: List },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "timeline", label: "Timeline", icon: Clock },
          { id: "gantt", label: "Gantt Chart", icon: BarChart4 },
          { id: "workload", label: "Workload Planner", icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = viewType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/5"
                  : "bg-transparent text-zinc-400 border border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Board controls & Filter rail */}
      <div className="bg-[#151515] border border-[#262626] p-4 rounded-xl flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Direct Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards (ID, title, tags...)"
              className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-[#333]"
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Filter Priority */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "ALL")}
              className="bg-[#0b0b0b] border border-[#262626] text-xs text-zinc-400 rounded-md p-1.5 cursor-pointer focus:border-[#333] outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value={TaskPriority.CRITICAL}>Critical</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.LOWEST}>Lowest</option>
            </select>

            {/* Filter Assignee */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-[#0b0b0b] border border-[#262626] text-xs text-zinc-400 rounded-md p-1.5 cursor-pointer focus:border-[#333] outline-none"
            >
              <option value="ALL">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            {/* Filter Project */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-[#0b0b0b] border border-[#262626] text-xs text-zinc-400 rounded-md p-1.5 cursor-pointer focus:border-[#333] outline-none"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0b0b0b] border border-[#262626] text-xs text-zinc-400 rounded-md p-1.5 cursor-pointer focus:border-[#333] outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Bulk Mode toggler */}
            <button
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                setSelectedTaskIds([]);
              }}
              className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                bulkSelectMode 
                  ? "bg-amber-600 border-amber-500 text-white" 
                  : "bg-[#0b0b0b] border-[#262626] text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{bulkSelectMode ? "Cancel Bulk" : "Bulk Operations"}</span>
            </button>

          </div>
        </div>

        {/* Bulk action row when active */}
        {bulkSelectMode && (
          <div className="bg-[#0b0b0b] p-3 rounded-md border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Selected <span className="font-bold text-amber-400">{selectedTaskIds.length}</span> sprint tasks
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono">MOVE TO:</span>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value as TaskStatus)}
                className="bg-[#151515] border border-[#262626] text-xs text-zinc-300 rounded p-1 outline-none"
              >
                <option value={TaskStatus.BACKLOG}>Backlog</option>
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Code Review</option>
                <option value={TaskStatus.TESTING}>QA Testing</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
              <button
                onClick={handleBulkMove}
                disabled={selectedTaskIds.length === 0}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded text-xs cursor-pointer"
              >
                Apply Move Action
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
                  className={`flex flex-col rounded-md border border-[#262626] p-3 h-full transition-all duration-200 select-none ${col.color} ${
                    isCollapsed ? "w-16 shrink-0" : "w-72 shrink-0"
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <button 
                        onClick={() => toggleColumnCollapse(col.id)}
                        className="p-0.5 hover:bg-[#1a1a1a] rounded text-zinc-500 cursor-pointer"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {!isCollapsed && (
                        <>
                          <h4 className="text-xs font-bold text-white truncate uppercase tracking-wider">{col.title}</h4>
                          <span className="text-[10px] bg-[#1a1a1a] border border-[#262626] px-1.5 py-0.5 rounded text-zinc-400 font-bold font-mono">
                            {columnTasks.length}
                          </span>
                        </>
                      )}
                    </div>

                    {!isCollapsed && (
                      <button 
                        onClick={() => onOpenCreateTask(col.id)}
                        className="p-1 hover:bg-[#1a1a1a] rounded text-zinc-500 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Collapsed side banner style if collapsed */}
                  {isCollapsed ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider rotate-90 origin-center whitespace-nowrap">
                        {col.title}
                      </span>
                      <span className="text-[10px] bg-[#1a1a1a] border border-[#262626] px-1.5 rounded text-zinc-400 font-bold font-mono mt-2">
                        {columnTasks.length}
                      </span>
                    </div>
                  ) : (
                    // Scrollable cards list
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                      {columnTasks.length === 0 ? (
                        <div className="border border-dashed border-[#262626] rounded-md p-6 text-center text-zinc-600 text-[11px] h-32 flex flex-col items-center justify-center gap-1">
                          <Folder className="w-4 h-4" />
                          <span>Empty Lane</span>
                        </div>
                      ) : (
                        columnTasks.map(t => {
                          const taskAssignee = users.find(u => u.id === t.assigneeId);
                          const isSelected = selectedTaskIds.includes(t.id);

                          return (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, t.id)}
                              onClick={() => {
                                if (bulkSelectMode) {
                                  toggleTaskSelection(t.id);
                                } else {
                                  onSelectTask(t.id);
                                }
                              }}
                              className={`p-3.5 rounded-md border transition-all duration-150 relative cursor-pointer group flex flex-col gap-3 ${
                                isSelected
                                  ? "bg-amber-950/25 border-amber-600 shadow-sm"
                                  : draggedTaskId === t.id
                                  ? "opacity-40 bg-[#0b0b0b] border-[#262626]/40"
                                  : "bg-[#151515] border-[#262626] hover:border-[#333] hover:bg-[#1a1a1a] shadow-sm"
                              }`}
                            >
                              {/* Drag handle dots hover-only */}
                              <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-60 transition-opacity text-zinc-500">
                                <Move className="w-3.5 h-3.5" />
                              </div>

                              {/* Task meta row */}
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider">
                                  {t.id}
                                </span>
                                
                                {bulkSelectMode && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Swallowed for click wrapper
                                    className="rounded bg-neutral-900 border-neutral-800 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                                  />
                                )}
                              </div>

                              {/* Task Title */}
                              <h5 className="text-xs font-semibold text-white leading-relaxed line-clamp-2">
                                {t.title}
                              </h5>

                              {/* Subtask / checklist counter row */}
                              {(t.subtasks.length > 0 || t.checklist.length > 0) && (
                                <div className="flex gap-2.5 items-center text-[10px] text-zinc-500">
                                  {t.subtasks.length > 0 && (
                                    <span className="flex items-center gap-1.5 bg-[#0b0b0b] border border-[#262626] px-1.5 py-0.5 rounded">
                                      <CheckSquare className="w-3 h-3 text-zinc-500" />
                                      <span>{t.subtasks.filter(s => s.isCompleted).length}/{t.subtasks.length} Sub</span>
                                    </span>
                                  )}
                                  {t.checklist.length > 0 && (
                                    <span className="flex items-center gap-1.5 bg-[#0b0b0b] border border-[#262626] px-1.5 py-0.5 rounded">
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
                                    <span key={idx} className="text-[9px] bg-[#0b0b0b] border border-[#262626] px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Footer parameters row */}
                              <div className="flex justify-between items-center pt-2.5 border-t border-[#262626] shrink-0">
                                
                                {/* Color-coded Priority Badge */}
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
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

                                {/* Assignee Avatar */}
                                <div className="flex items-center gap-1.5">
                                  {taskAssignee ? (
                                    <img 
                                      src={taskAssignee.avatar} 
                                      alt={taskAssignee.name} 
                                      title={`Assigned to ${taskAssignee.name}`}
                                      className="w-5.5 h-5.5 rounded-full object-cover border border-[#262626]"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-5.5 h-5.5 rounded-full bg-[#0b0b0b] flex items-center justify-center text-zinc-500 border border-[#262626] text-[9px] font-bold">
                                      UA
                                    </div>
                                  )}
                                </div>

                              </div>
                            </div>
                          );
                        })
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
