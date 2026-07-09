/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TaskFlowProvider, useTaskFlow } from "./contexts/TaskFlowContext";
import { LoginRegister } from "./components/auth/LoginRegister";
import { DashboardOverview } from "./components/dashboard/DashboardOverview";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { ProjectCatalog } from "./components/projects/ProjectCatalog";
import { AnalyticsReport } from "./components/analytics/AnalyticsReport";
import { TeamManagement } from "./components/team/TeamManagement";
import { UserProfileSettings } from "./components/profile/UserProfileSettings";
import { CommandPalette } from "./components/CommandPalette";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { TaskDrawer } from "./components/TaskDrawer";
import { TaskStatus } from "./types";
import { useAuthStore } from "./features/auth/authStore";
import { initSocket } from "./lib/socket";

import { 
  Layers, LayoutDashboard, Kanban, Library, BarChart3, Users, Settings, 
  Search, Plus, LogOut, Sparkles, Menu, X, ArrowRight, ShieldCheck, ChevronDown
} from "lucide-react";

function AppContent() {
  const { 
    currentUser, logout, workspaces, currentWorkspace, setCurrentWorkspaceById, createWorkspace, theme
  } = useTaskFlow();

  const { initializeAuth, isCheckingSession } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    initSocket();
  }, [initializeAuth]);

  // Navigation / View state
  const [activeView, setActiveView] = useState<string>("dashboard");
  
  // Mobile UI Sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal Dialog states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [createTaskInitialDueDate, setCreateTaskInitialDueDate] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Workspace creation modal simulation
  const [showWsModal, setShowWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // Secure Loading Gate
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-blue-500 border-neutral-800 rounded-full animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Synchronizing keyspace...</span>
        </div>
      </div>
    );
  }

  // If user is logged out, serve full-page Login/Register panel
  if (!currentUser) {
    return <LoginRegister />;
  }

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWorkspace(newWsName.trim(), newWsDesc.trim());
    setNewWsName("");
    setNewWsDesc("");
    setShowWsModal(false);
  };

  const handleTriggerCreateTask = (status: TaskStatus = TaskStatus.TODO, dueDate: string = "") => {
    setCreateTaskInitialStatus(status);
    setCreateTaskInitialDueDate(dueDate);
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row relative font-sans">
      
      {/* 1. Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0b0b] border-b border-[#262626] shrink-0 w-full z-20">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-sm tracking-tight text-white">TaskFlow Enterprise</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1 text-neutral-400 hover:text-white rounded"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 2. PERSISTENT ENTERPRISE SIDEBAR PANEL */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#262626] flex flex-col justify-between shrink-0 z-30 transition-transform duration-200 md:translate-x-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Workspace branding switcher header */}
          <div className="p-4 border-b border-[#262626] space-y-3.5">
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center border border-blue-400/20 shadow">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-white tracking-tight block truncate">TaskFlow Enterprise</span>
                <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Secure Workspace</span>
              </div>
            </div>

            {/* Workspace dropdown switcher */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Select Workspace</span>
                <button 
                  onClick={() => setShowWsModal(true)} 
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                >
                  + Create
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={currentWorkspace?.id || ""}
                  onChange={(e) => setCurrentWorkspaceById(e.target.value)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md py-1.5 px-2.5 text-xs font-semibold text-neutral-200 cursor-pointer pr-8 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Core navigation list */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* Dashboard Overview */}
            <button
              onClick={() => { setActiveView("dashboard"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "dashboard"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            {/* Kanban Board */}
            <button
              onClick={() => { setActiveView("board"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "board"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Sprint Kanban Board</span>
            </button>

            {/* Project Catalog */}
            <button
              onClick={() => { setActiveView("projects"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "projects"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Project Portfolios</span>
            </button>

            {/* Analytics Reports */}
            <button
              onClick={() => { setActiveView("analytics"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "analytics"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Metrics</span>
            </button>

            {/* Team Directory */}
            <button
              onClick={() => { setActiveView("team"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "team"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Workspace Directory</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { setActiveView("profile"); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 border rounded-md text-xs font-semibold transition-all duration-150 ${
                activeView === "profile"
                  ? "bg-[#1a1a1a] border-[#333] text-blue-400"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-[#151515]"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Parameters</span>
            </button>
          </nav>

          {/* Quick Create task Trigger Action inside rail */}
          <div className="p-3 border-t border-[#262626] shrink-0">
            <button
              onClick={() => handleTriggerCreateTask(TaskStatus.TODO)}
              className="w-full bg-blue-600 hover:bg-blue-500 border border-blue-500/30 text-white py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Issue Ticket</span>
            </button>
          </div>

        </div>

        {/* Logged in User session bar */}
        <div className="p-4 border-t border-[#262626] bg-[#0b0b0b] shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-8.5 h-8.5 rounded-full object-cover border border-[#262626]"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <span className="text-xs font-medium text-white block truncate leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-zinc-500 block truncate leading-none">{currentUser.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            title="Secure Logout"
            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-[#090909]">
        
        {/* TOP UTILITY HEADER BAR */}
        <header className="hidden md:flex h-14 bg-[#090909]/80 backdrop-blur-md border-b border-[#262626] items-center justify-between px-6 shrink-0 z-10">
          
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <span>Workspaces</span>
            <span className="text-zinc-600">/</span>
            <span className="text-white font-medium">{currentWorkspace?.name}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-blue-400 capitalize font-medium">{activeView} view</span>
          </div>

          {/* Quick command search bar and helper tooltip */}
          <div className="flex items-center gap-4">
            
            {/* Search Launcher button */}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-3 py-1.5 bg-[#151515] border border-[#262626] rounded-md flex items-center gap-3 text-zinc-500 hover:text-neutral-300 hover:border-neutral-700 cursor-pointer text-xs focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search platform...</span>
              <span className="bg-neutral-800 border border-neutral-700 px-1 py-0.2 rounded font-mono text-[9px] text-zinc-600">CMD K</span>
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>API Connected</span>
            </div>

          </div>

        </header>

        {/* ACTIVE SCREEN RENDER VIEWS PANEL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#090909]">
          {activeView === "dashboard" && (
            <DashboardOverview 
              onNavigateToView={setActiveView} 
              onSelectTask={setSelectedTaskId} 
            />
          )}

          {activeView === "board" && (
            <KanbanBoard 
              onSelectTask={setSelectedTaskId} 
              onOpenCreateTask={handleTriggerCreateTask} 
            />
          )}

          {activeView === "projects" && (
            <ProjectCatalog />
          )}

          {activeView === "analytics" && (
            <AnalyticsReport />
          )}

          {activeView === "team" && (
            <TeamManagement />
          )}

          {activeView === "profile" && (
            <UserProfileSettings />
          )}
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-8 border-t border-[#262626] bg-[#0b0b0b] px-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>API Status: Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              <span>DB latency: 12ms</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>v2.4.1-stable</span>
            <span className="text-zinc-700">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </footer>

      </main>

      {/* 4. MODALS, COMMAND PALETTE, DIALOGS */}
      
      {/* Command Palette Ctrl+K */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        onTriggerCreateTask={() => handleTriggerCreateTask(TaskStatus.TODO)}
        onSelectTask={setSelectedTaskId}
      />

      {/* Create Issue Task Modal */}
      <CreateTaskModal 
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        initialStatus={createTaskInitialStatus}
        initialDueDate={createTaskInitialDueDate}
      />

      {/* Task Drawer sliding panel details */}
      <TaskDrawer 
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Workspace Creation dialog popup */}
      {showWsModal && (
        <div className="fixed inset-0 bg-[#090909]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Initialize New Workspace</h4>
              <button onClick={() => setShowWsModal(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Workspace Title</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp Research"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-800 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Brief description of division or team workflows..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#181818] border border-neutral-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWsModal(false)}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded shadow-lg shadow-blue-500/15"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <TaskFlowProvider>
      <AppContent />
    </TaskFlowProvider>
  );
}
