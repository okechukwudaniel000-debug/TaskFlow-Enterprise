/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Rocket, Clipboard, Eye, Plus, ShieldCheck, LogOut, ArrowRight } from "lucide-react";
import { useTaskFlow } from "../contexts/TaskFlowContext";
import { Task, Project } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onTriggerCreateTask: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onTriggerCreateTask 
}) => {
  const { tasks, projects, logout } = useTaskFlow();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Hotkey listener inside app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Command items construction
  const commandItems = useMemo(() => {
    const items: Array<{
      id: string;
      category: "Navigation" | "Actions" | "Projects" | "Tasks";
      title: string;
      subtitle?: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [
      // Navigation
      {
        id: "nav-dash",
        category: "Navigation",
        title: "Go to Dashboard",
        subtitle: "View work overview, metrics, and team activity",
        icon: <Eye className="w-4 h-4 text-neutral-400" />,
        action: () => { onNavigate("dashboard"); onClose(); }
      },
      {
        id: "nav-board",
        category: "Navigation",
        title: "Go to Kanban Board",
        subtitle: "Manage active sprint tasks and statuses",
        icon: <Eye className="w-4 h-4 text-neutral-400" />,
        action: () => { onNavigate("board"); onClose(); }
      },
      {
        id: "nav-proj",
        category: "Navigation",
        title: "Go to Project Catalog",
        subtitle: "List and configure workspace projects",
        icon: <Eye className="w-4 h-4 text-neutral-400" />,
        action: () => { onNavigate("projects"); onClose(); }
      },
      {
        id: "nav-analytics",
        category: "Navigation",
        title: "Go to Analytics & Reports",
        subtitle: "View charts, workload, and performance metrics",
        icon: <Eye className="w-4 h-4 text-neutral-400" />,
        action: () => { onNavigate("analytics"); onClose(); }
      },
      {
        id: "nav-profile",
        category: "Navigation",
        title: "Go to User Settings",
        subtitle: "Configure avatar, theme, and timezone",
        icon: <Eye className="w-4 h-4 text-neutral-400" />,
        action: () => { onNavigate("profile"); onClose(); }
      },
      // Actions
      {
        id: "act-create-task",
        category: "Actions",
        title: "Create New Task",
        subtitle: "Add checklist, assignee, and tags to sprint backlog",
        icon: <Plus className="w-4 h-4 text-blue-400" />,
        action: () => { onTriggerCreateTask(); onClose(); }
      },
      {
        id: "act-logout",
        category: "Actions",
        title: "Logout session",
        subtitle: "Disconnect safely from workspace",
        icon: <LogOut className="w-4 h-4 text-red-400" />,
        action: () => { logout(); onClose(); }
      }
    ];

    // Add Projects
    projects.forEach((p: Project) => {
      items.push({
        id: `proj-${p.id}`,
        category: "Projects",
        title: p.name,
        subtitle: `${p.template.toUpperCase()} Project | ${p.description.substring(0, 45)}...`,
        icon: <Rocket className="w-4 h-4 text-amber-500" />,
        action: () => { onNavigate("board"); onClose(); } // Switch to board
      });
    });

    // Add Tasks
    tasks.forEach((t: Task) => {
      items.push({
        id: `task-${t.id}`,
        category: "Tasks",
        title: `${t.id}: ${t.title}`,
        subtitle: `Priority: ${t.priority} | Status: ${t.status}`,
        icon: <Clipboard className="w-4 h-4 text-blue-500" />,
        action: () => { onNavigate("board"); onClose(); } // Open board where task is
      });
    });

    // Filtering based on query
    if (!query) return items.slice(0, 10); // Return top navigation/actions by default

    const q = query.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(q) || 
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, projects, tasks, onNavigate, onTriggerCreateTask, logout, onClose]);

  // Handle Keyboard Navigation inside the command list
  useEffect(() => {
    const handleKeyList = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % commandItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + commandItems.length) % commandItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (commandItems[activeIndex]) {
          commandItems[activeIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyList);
    return () => window.removeEventListener("keydown", handleKeyList);
  }, [isOpen, activeIndex, commandItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#090909]/80 backdrop-blur-md z-50 flex items-start justify-center pt-[12vh] px-4">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-[#151515] border border-[#262626] rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[70vh] relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#262626] shrink-0">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command, search projects or sprint tasks..."
            className="w-full bg-transparent text-xs text-white placeholder-zinc-600 border-0 outline-none"
          />
          <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] bg-[#0b0b0b] border border-[#262626] px-1.5 py-0.5 rounded-md text-zinc-400 shadow">
            ESC
          </div>
        </div>

        {/* Results feed list */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[50vh]">
          {commandItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-xs">No matching commands, projects or tasks found.</p>
              <p className="text-[10px] text-zinc-600 mt-1 font-mono">Query: "{query}"</p>
            </div>
          ) : (
            // Group and Render
            commandItems.map((item, index) => {
              const isSelected = index === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full text-left flex items-start gap-3 p-2.5 rounded-md transition-all duration-150 border outline-none cursor-pointer ${
                    isSelected 
                      ? "bg-[#1a1a1a] border-[#262626]" 
                      : "bg-transparent border-transparent"
                  }`}
                >
                  <div className={`p-2 rounded-md shrink-0 transition-colors ${
                    isSelected ? "bg-[#262626]" : "bg-[#0b0b0b]"
                  }`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#0b0b0b] border border-[#262626] rounded-md text-zinc-400 font-medium uppercase tracking-wider shrink-0 font-mono">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-sans">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex items-center text-zinc-400 self-center">
                      <ArrowRight className="w-4 h-4 text-blue-400 animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Action hotkey bar */}
        <div className="p-3 bg-[#0b0b0b] border-t border-[#262626] shrink-0 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="border border-[#262626] bg-[#151515] px-1 py-0.5 rounded-md text-[9px]">↑↓</span> Navigate</span>
            <span className="flex items-center gap-1.5"><span className="border border-[#262626] bg-[#151515] px-1 py-0.5 rounded-md text-[9px]">Enter</span> Trigger</span>
          </div>
          <span className="text-zinc-600">TaskFlow Enterprise CLI v2.0</span>
        </div>
      </div>
    </div>
  );
};
