/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TaskFlowProvider, useTaskFlow } from "./contexts/TaskFlowContext";
import { LoginRegister } from "./components/auth/LoginRegister";
import { CommandPalette } from "./components/CommandPalette";

const DashboardOverview = lazy(() => import("./components/dashboard/DashboardOverview").then(m => ({ default: m.DashboardOverview })));
const KanbanBoard = lazy(() => import("./components/kanban/KanbanBoard").then(m => ({ default: m.KanbanBoard })));
const ProjectCatalog = lazy(() => import("./components/projects/ProjectCatalog").then(m => ({ default: m.ProjectCatalog })));
const AnalyticsReport = lazy(() => import("./components/analytics/AnalyticsReport").then(m => ({ default: m.AnalyticsReport })));
const TeamManagement = lazy(() => import("./components/team/TeamManagement").then(m => ({ default: m.TeamManagement })));
const UserProfileSettings = lazy(() => import("./components/profile/UserProfileSettings").then(m => ({ default: m.UserProfileSettings })));
const PerformanceSandbox = lazy(() => import("./components/performance/PerformanceSandbox").then(m => ({ default: m.PerformanceSandbox })));

import { CreateTaskModal } from "./components/CreateTaskModal";
import { TaskDrawer } from "./components/TaskDrawer";
import { TaskStatus } from "./types";
import { useAuthStore } from "./features/auth/authStore";
import { initSocket } from "./lib/socket";
import { ToastProvider, Avatar, Breadcrumbs, QuickActions } from "./components/ui";
import { MilitaryThemeProvider, useMilitaryTheme } from "./contexts/MilitaryThemeContext";
import { TacticalBackground } from "./components/ui/TacticalBackground";

import { 
  Layers, LayoutDashboard, Kanban, Library, BarChart3, Users, Settings, 
  Search, Plus, LogOut, Sparkles, Menu, X, ArrowRight, ShieldCheck, ChevronDown, Cpu, Eye, Radio, ShieldAlert
} from "lucide-react";

function AppContent() {
  const { 
    currentUser, logout, workspaces, currentWorkspace, setCurrentWorkspaceById, createWorkspace, theme
  } = useTaskFlow();

  const { activeTheme, setActiveTheme, colors } = useMilitaryTheme();
  const { initializeAuth, isCheckingSession } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    initSocket();
  }, [initializeAuth]);

  // Navigation / View state
  const [activeView, setActiveView] = useState<string>("dashboard");
  
  // Mobile UI Sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isMobileSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobileSidebarOpen]);

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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl+K: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      // N: New Task
      if (e.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        handleTriggerCreateTask(TaskStatus.TODO);
      }
    };
    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // Secure Loading Gate
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#070c08] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-emerald-500 border-emerald-950 rounded-full animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">SECURE KEYS LINK SYNC...</span>
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

  const navItems = [
    { id: "dashboard", label: "Operations Room", icon: LayoutDashboard },
    { id: "board", label: "Tactical Kanban", icon: Kanban },
    { id: "projects", label: "Mission Folders", icon: Library },
    { id: "analytics", label: "Strategic Metrics", icon: BarChart3 },
    { id: "team", label: "Operator Directory", icon: Users },
    { id: "profile", label: "Comms & Profile", icon: Settings },
    { id: "performance", label: "Telemetry & Sandbox", icon: Cpu },
  ];

  return (
    <div className={`min-h-screen ${colors.bgDark} ${colors.textPrimary} flex flex-col md:flex-row relative font-sans overflow-hidden transition-colors duration-200`}>
      {/* Dynamic Tactical HUD Background with topo curves and radar lines */}
      <TacticalBackground />

      {/* 1. Mobile Top Navigation Header */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3.5 ${colors.bgPanel} border-b ${colors.border} shrink-0 w-full z-20 relative`}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-mono font-bold text-xs tracking-widest text-white uppercase">COMMAND HQ</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className={`p-1.5 ${colors.textMuted} hover:text-white rounded border border-transparent hover:border-white/10`}
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. PERSISTENT ENTERPRISE SIDEBAR PANEL (TACTICAL RAIL) */}
      <aside 
        ref={sidebarRef}
        className={`
        fixed md:sticky top-0 left-0 h-screen w-64 ${colors.bgPanel} border-r ${colors.border} flex flex-col justify-between shrink-0 z-30 transition-transform duration-200 md:translate-x-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex flex-col flex-1 min-h-0 relative">
          
          {/* Workspace branding switcher header */}
          <div className={`p-4.5 border-b ${colors.borderMuted} space-y-4`}>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-950/60 rounded-sm flex items-center justify-center border border-emerald-800 shadow">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="font-mono font-black text-xs text-white tracking-widest block uppercase">TF COMMANDER</span>
                <span className="text-[8px] font-mono tracking-widest text-emerald-500 uppercase block">NATO PORTAL SECURITY</span>
              </div>
            </div>

            {/* Workspace dropdown switcher */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-zinc-500 font-mono font-bold tracking-wider uppercase">Active Area</span>
                <button 
                  onClick={() => setShowWsModal(true)} 
                  className="text-[9px] text-emerald-400 hover:text-emerald-300 font-mono font-bold uppercase tracking-wide"
                >
                  [+ NEW]
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={currentWorkspace?.id || ""}
                  onChange={(e) => setCurrentWorkspaceById(e.target.value)}
                  className="w-full bg-black/40 border border-[#314233]/70 rounded-sm py-1.5 pl-3 pr-8 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200 cursor-pointer outline-none focus:border-neutral-500"
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id} className="bg-neutral-900 text-neutral-200">{ws.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Core navigation list */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-white/[0.04] border-emerald-700/60 text-emerald-400 shadow-sm shadow-black/30"
                      : "text-zinc-400 border-transparent hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ACTIVE MILITARY COMMAND THEME SWITCHER */}
          <div className={`p-4 border-t ${colors.borderMuted} space-y-2`}>
            <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">COMMAND SCHEME:</span>
            <div className="grid grid-cols-2 gap-1">
              {(["forest", "night", "desert", "arctic"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTheme(t)}
                  className={`px-1.5 py-1 text-[8px] font-mono tracking-wider uppercase font-extrabold border cursor-pointer rounded-sm transition-all ${
                    activeTheme === t
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500"
                      : "bg-black/30 text-zinc-500 border-transparent hover:text-white hover:bg-white/[0.01]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Create task Trigger Action inside rail */}
          <div className={`p-3 border-t ${colors.borderMuted} shrink-0`}>
            <button
              onClick={() => handleTriggerCreateTask(TaskStatus.TODO)}
              className="w-full bg-emerald-800 hover:bg-emerald-700 border border-emerald-600/30 text-emerald-100 py-2 px-3 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-black/40 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Mission</span>
            </button>
          </div>

        </div>

        {/* Logged in User session bar */}
        <div className={`p-3.5 border-t ${colors.borderMuted} bg-black/20 shrink-0 flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar 
              src={currentUser.avatar} 
              name={currentUser.name}
              size="sm"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-bold text-white block truncate leading-tight">{currentUser.name}</span>
              <span className="text-[9px] font-mono text-zinc-500 block truncate leading-none mt-0.5">ROLE: {currentUser.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            title="Secure Comms Terminate"
            className={`p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* TOP UTILITY HEADER BAR */}
        <header className={`hidden md:flex h-14 bg-black/10 backdrop-blur-md border-b ${colors.border} items-center justify-between px-6 shrink-0 z-10 relative`}>
          
          {/* Breadcrumb path */}
          <Breadcrumbs activeView={activeView} />

          {/* Quick command search bar and helper tooltip */}
          <div className="flex items-center gap-4">
            
            {/* Search Launcher button */}
            <QuickActions 
              onTriggerCreateTask={handleTriggerCreateTask} 
              onNavigate={setActiveView} 
            />
            
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`px-3 py-1.5 bg-black/35 border ${colors.border} rounded-sm flex items-center gap-3 text-zinc-500 hover:text-neutral-300 hover:border-neutral-500 cursor-pointer text-[10px] font-mono tracking-wider transition-all outline-none focus:ring-1 focus:ring-emerald-500`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>LAUNCH INTEL FINDER...</span>
              <span className="bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded font-mono text-[8px] text-zinc-600">CTRL K</span>
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono uppercase tracking-wider bg-black/30 px-2.5 py-1 border border-white/[0.04] rounded-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>LINK SECURED</span>
            </div>

          </div>

        </header>

        {/* ACTIVE SCREEN RENDER VIEWS PANEL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent relative z-10">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
              <div className="w-8 h-8 border-2 border-t-emerald-500 border-emerald-950 rounded-full animate-spin" />
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">RETRIEVING ENCRYPTED PARTITION...</span>
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
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

                {activeView === "performance" && (
                  <PerformanceSandbox />
                )}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>

        {/* Bottom Status Bar */}
        <footer className={`h-8 border-t ${colors.border} bg-black/30 px-4 flex items-center justify-between text-[9px] text-zinc-500 font-mono shrink-0 relative z-10`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>COMMS LINK: LIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>DESYNC LATENCY: 12ms</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>SYS_VER: 2.4.1-TACTICAL</span>
            <span className="text-zinc-800">|</span>
            <span className="hover:text-white cursor-pointer transition-colors uppercase">PROT_INFO</span>
            <span className="hover:text-white cursor-pointer transition-colors uppercase">SEC_REG</span>
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${colors.bgPanel} border ${colors.border} rounded-sm overflow-hidden shadow-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">[SECURE COMM] INITIALIZE SECTOR</h4>
              <button onClick={() => setShowWsModal(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Sector Name</label>
                <input
                  type="text"
                  placeholder="e.g. NATO HQ NORTHERN OPERATIONS"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono placeholder-neutral-600 outline-none focus:border-neutral-500`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Description & Coordinates</label>
                <textarea
                  placeholder="Strategic coordinate parameters and details..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  rows={2}
                  className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-sans placeholder-neutral-600 outline-none focus:border-neutral-500`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWsModal(false)}
                  className="px-3.5 py-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-neutral-400 hover:text-white"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded-sm shadow-lg shadow-black/40 active:scale-95"
                >
                  DEVISE SECTOR
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
    <MilitaryThemeProvider>
      <ToastProvider>
        <TaskFlowProvider>
          <AppContent />
        </TaskFlowProvider>
      </ToastProvider>
    </MilitaryThemeProvider>
  );
}
