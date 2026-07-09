/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, Rocket, Clipboard, Eye, Plus, LogOut, ArrowRight,
  MessageSquare, FileText, User, Terminal, Database, Cpu, 
  HelpCircle, Loader2, Sparkles, X, LayoutDashboard, Settings,
  Users, BarChart3, Info
} from "lucide-react";
import { useTaskFlow } from "../contexts/TaskFlowContext";
import { apiFetch } from "../features/auth/authStore";
import { Task, Project } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onTriggerCreateTask: () => void;
  onSelectTask: (taskId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onTriggerCreateTask,
  onSelectTask
}) => {
  const { currentWorkspace, logout } = useTaskFlow();
  const [query, setQuery] = useState("");
  const [tech, setTech] = useState<"postgresql" | "elasticsearch">("postgresql");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [compiledPostgresSql, setCompiledPostgresSql] = useState("");
  const [compiledElasticsearchQuery, setCompiledElasticsearchQuery] = useState<any>(null);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default / Navigation Commands (when search query is empty)
  const defaultCommands = useMemo(() => {
    return [
      {
        id: "nav-dash",
        category: "Navigation",
        title: "Go to Dashboard Overview",
        subtitle: "View performance charts, agile metrics, and feed activity",
        icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
        action: () => { onNavigate("dashboard"); onClose(); }
      },
      {
        id: "nav-board",
        category: "Navigation",
        title: "Go to Sprint Kanban Board",
        subtitle: "Manage, drag, and update active team issues",
        icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
        action: () => { onNavigate("board"); onClose(); }
      },
      {
        id: "nav-proj",
        category: "Navigation",
        title: "Go to Project Portfolios",
        subtitle: "Review templates, colors, and project catalogs",
        icon: <Rocket className="w-4 h-4 text-amber-400" />,
        action: () => { onNavigate("projects"); onClose(); }
      },
      {
        id: "nav-analytics",
        category: "Navigation",
        title: "Go to Analytics & Reports",
        subtitle: "Predict deadline risks, bottlenecks, and team metrics",
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        action: () => { onNavigate("analytics"); onClose(); }
      },
      {
        id: "nav-team",
        category: "Navigation",
        title: "Go to Workspace Directory",
        subtitle: "List and manage project stakeholders and roles",
        icon: <Users className="w-4 h-4 text-sky-400" />,
        action: () => { onNavigate("team"); onClose(); }
      },
      {
        id: "nav-profile",
        category: "Navigation",
        title: "Go to Profile Parameters",
        subtitle: "Manage personal bio, localization, and theme",
        icon: <Settings className="w-4 h-4 text-zinc-400" />,
        action: () => { onNavigate("profile"); onClose(); }
      },
      {
        id: "act-create-task",
        category: "Actions",
        title: "Create New Issue Ticket",
        subtitle: "Define an assignment, due date, and checklist",
        icon: <Plus className="w-4 h-4 text-blue-400 animate-pulse" />,
        action: () => { onTriggerCreateTask(); onClose(); }
      },
      {
        id: "act-logout",
        category: "Actions",
        title: "Secure Logout Session",
        subtitle: "Safely sign out of current enterprise session",
        icon: <LogOut className="w-4 h-4 text-red-400" />,
        action: () => { logout(); onClose(); }
      }
    ];
  }, [onNavigate, onTriggerCreateTask, logout, onClose]);

  // Determine what is currently active to scroll/navigate
  const activeItems = useMemo(() => {
    if (!query) return defaultCommands;
    return searchResults;
  }, [query, defaultCommands, searchResults]);

  // Reset search when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSearchResults([]);
      setCompiledPostgresSql("");
      setCompiledElasticsearchQuery(null);
      setSearchStats(null);
      setActiveIndex(0);
      setSelectedDoc(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Trigger Debounced API Search Requests
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setCompiledPostgresSql("");
      setCompiledElasticsearchQuery(null);
      setSearchStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const workspaceParam = currentWorkspace?.id ? `&workspaceId=${currentWorkspace.id}` : "";
        const response = await apiFetch(`/api/search?q=${encodeURIComponent(query)}${workspaceParam}&tech=${tech}`);
        if (!response.ok) throw new Error("Search API error");
        
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setSearchResults(resJson.data.results || []);
          setCompiledPostgresSql(resJson.data.compiledPostgresSql || "");
          setCompiledElasticsearchQuery(resJson.data.compiledElasticsearchQuery || null);
          setSearchStats(resJson.data.stats || null);
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, tech, currentWorkspace]);

  // Handle outside click to close
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

  // Escape key and global hotkey listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedDoc) {
          setSelectedDoc(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedDoc, onClose]);

  // Keyboard Navigation inside activeItems list
  useEffect(() => {
    const handleKeyList = (e: KeyboardEvent) => {
      if (!isOpen || selectedDoc) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % activeItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + activeItems.length) % activeItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeItems[activeIndex]) {
          handleExecuteAction(activeItems[activeIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyList);
    return () => window.removeEventListener("keydown", handleKeyList);
  }, [isOpen, activeIndex, activeItems, selectedDoc]);

  // Execute Search Item Action
  const handleExecuteAction = (item: any) => {
    if (item.action) {
      item.action();
      return;
    }

    // Server-side search results handling
    switch (item.type) {
      case "task":
        onSelectTask(item.id);
        onNavigate("board");
        onClose();
        break;
      case "project":
        onNavigate("board"); // open boards
        onClose();
        break;
      case "user":
        onNavigate("team"); // open team list
        onClose();
        break;
      case "comment":
        if (item.taskId) {
          onSelectTask(item.taskId);
          onNavigate("board");
        }
        onClose();
        break;
      case "document":
        // Show immersive modal reading view
        setSelectedDoc(item);
        break;
      default:
        onClose();
    }
  };

  // Icon selector based on category / search result type
  const getIcon = (item: any) => {
    if (item.icon) return item.icon; // For navigation commands

    switch (item.type) {
      case "task":
        return <Clipboard className="w-4 h-4 text-blue-400" />;
      case "project":
        return <Rocket className="w-4 h-4 text-amber-400" />;
      case "user":
        return <User className="w-4 h-4 text-sky-400" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-rose-400" />;
      case "document":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#090909]/85 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh] px-4">
      
      {/* IMMERSIVE DOCUMENT READER OVERLAY */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-neutral-800 flex items-center justify-between bg-[#151515]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-md">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{selectedDoc.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{selectedDoc.subtitle}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 hover:bg-neutral-800 text-zinc-400 hover:text-white rounded-md cursor-pointer transition-colors"
                title="Back to search results"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Immersive Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 text-neutral-300 font-sans text-sm leading-relaxed space-y-4">
              <p className="font-semibold text-neutral-200">Seeded Knowledge Document Reference</p>
              <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-emerald-400/90 whitespace-pre-line leading-relaxed shadow">
                {selectedDoc.description}
              </div>
              
              <div className="pt-6 border-t border-neutral-800/60 space-y-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-zinc-500" />
                  <span>This document represents a system-authored guide linked within TaskFlow.</span>
                </div>
                <p>Wiki database indexes are fully supported under the Enterprise Search system using standard tsvector indexing pipelines in PostgreSQL or elasticsearch index synchronization triggers.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-neutral-900/60 border-t border-neutral-800/60 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 bg-[#1a1a1a] border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-md cursor-pointer transition-colors"
              >
                Return to Search
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CORE PALETTE PANEL CONTAINER */}
      <div 
        ref={containerRef}
        className="w-full max-w-5xl bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[75vh] relative animate-in fade-in zoom-in-98 duration-200"
      >
        
        {/* LEFT COLUMN: RESULTS & INPUT (60%) */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Search Header Bar */}
          <div className="flex items-center gap-3.5 px-4.5 py-4 border-b border-neutral-800/80 shrink-0">
            <Search className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search tasks, projects, comments, users, or internal wiki documents..."
              className="w-full bg-transparent text-xs text-white placeholder-zinc-600 border-0 outline-none font-sans"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            )}
            <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] bg-[#181818] border border-neutral-800 px-1.5 py-0.5 rounded text-zinc-500 shadow">
              ESC
            </div>
          </div>

          {/* Search Results List Feed */}
          <div className="overflow-y-auto flex-1 p-3 space-y-1 max-h-[50vh]">
            {activeItems.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-neutral-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Search className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-neutral-400">No matching records found.</p>
                <p className="text-[10px] text-zinc-600 mt-1 font-mono">Query: "{query}"</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md text-zinc-500">
                  <Database className="w-3.5 h-3.5" />
                  <span>Indexes scanned: Tasks, Projects, Users, Comments, Wiki Documents</span>
                </div>
              </div>
            ) : (
              activeItems.map((item, index) => {
                const isSelected = index === activeIndex;
                const isNav = !!item.action;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleExecuteAction(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left flex items-start gap-3.5 p-3 rounded-lg transition-all duration-150 border outline-none cursor-pointer ${
                      isSelected 
                        ? "bg-[#161616] border-neutral-800/80" 
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    {/* Icon container */}
                    <div className={`p-2 rounded-md shrink-0 transition-colors ${
                      isSelected ? "bg-neutral-800/80 text-white" : "bg-[#181818] text-zinc-400"
                    }`}>
                      {getIcon(item)}
                    </div>
                    
                    {/* Content text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-200 truncate group-hover:text-white">
                          {item.title}
                        </span>
                        
                        {/* Type Tag */}
                        <span className={`text-[9px] px-2 py-0.2 rounded font-mono font-bold uppercase tracking-wider shrink-0 ${
                          isNav
                            ? "bg-[#1e1e1e] border border-neutral-800 text-zinc-400"
                            : item.type === "task"
                            ? "bg-blue-950/50 border border-blue-900/30 text-blue-400"
                            : item.type === "project"
                            ? "bg-amber-950/50 border border-amber-900/30 text-amber-400"
                            : item.type === "user"
                            ? "bg-sky-950/50 border border-sky-900/30 text-sky-400"
                            : item.type === "comment"
                            ? "bg-rose-950/50 border border-rose-900/30 text-rose-400"
                            : "bg-emerald-950/50 border border-emerald-900/30 text-emerald-400"
                        }`}>
                          {isNav ? item.category : item.type}
                        </span>

                        {/* Relevance Score Indicator */}
                        {!isNav && item.score && (
                          <span className="text-[9px] font-mono text-zinc-600">
                            Relevance: {item.score.toFixed(0)}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Snippet / Content match preview */}
                      {!isNav && item.description && (
                        <p className="text-[11px] text-zinc-400 truncate mt-1.5 font-sans leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <div className="flex items-center text-zinc-500 self-center pr-1 shrink-0">
                        {item.type === "document" ? (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase mr-2 animate-pulse">View Document</span>
                        ) : null}
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Search Stats / Status strip */}
          <div className="p-3 bg-[#131313] border-t border-neutral-800/80 shrink-0 flex items-center justify-between text-[10px] text-zinc-500 font-mono px-4.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="border border-neutral-800 bg-[#181818] px-1 py-0.2 rounded">↑↓</span> Navigate</span>
              <span className="flex items-center gap-1.5"><span className="border border-neutral-800 bg-[#181818] px-1 py-0.2 rounded">Enter</span> Trigger</span>
            </div>
            
            {query && searchStats ? (
              <div className="flex items-center gap-2">
                <span>Found: {searchStats.total} matches</span>
                <span className="text-zinc-700">|</span>
                <span>{searchStats.tasks} Tasks</span>
                <span className="text-zinc-700">|</span>
                <span>{searchStats.documents} Docs</span>
              </div>
            ) : (
              <span>Enterprise Search CLI v2.5</span>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: QUERY COMPILER INSPECTOR (40%) */}
        <div className="hidden md:flex w-80 border-l border-neutral-800/80 bg-[#0d0d0d] flex-col shrink-0 min-w-0">
          
          {/* Header Panel */}
          <div className="px-4 py-4.5 border-b border-neutral-800/80 flex items-center justify-between bg-[#111111] shrink-0">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-bold text-neutral-300 font-mono tracking-wider uppercase">Query Explainer</span>
            </div>
            
            {/* Engine Badges */}
            <div className="flex gap-1">
              <button 
                onClick={() => setTech("postgresql")}
                title="Small Scale: PostgreSQL full text search"
                className={`p-1 border rounded cursor-pointer transition-all ${
                  tech === "postgresql" 
                    ? "bg-blue-950/40 border-blue-500/40 text-blue-400" 
                    : "bg-neutral-900 border-neutral-800 text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setTech("elasticsearch")}
                title="Large Scale: Elasticsearch Query DSL"
                className={`p-1 border rounded cursor-pointer transition-all ${
                  tech === "elasticsearch" 
                    ? "bg-purple-950/40 border-purple-500/40 text-purple-400" 
                    : "bg-neutral-900 border-neutral-800 text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Explainer Context */}
          <div className="p-3 bg-[#111111]/40 border-b border-neutral-800/50 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            {tech === "postgresql" ? (
              <>
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Using Postgres: tsvector, tsquery & ts_rank_cd</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Using Elasticsearch: multi_match best_fields</span>
              </>
            )}
          </div>

          {/* Code Inspector Terminal Frame */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[10px] leading-relaxed text-zinc-400 select-all scrollbar-thin">
            {!query.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-600">
                <Terminal className="w-5 h-5 mb-2 text-zinc-700" />
                <p>Waiting for query...</p>
                <p className="text-[9px] mt-1 text-zinc-800 leading-snug">Type terms in the left bar to watch PostgreSQL SQL compilation and Elasticsearch Query DSL JSON generation in real-time.</p>
              </div>
            ) : tech === "postgresql" ? (
              <div className="space-y-2 whitespace-pre-wrap">
                <span className="text-emerald-500 font-bold">-- compiled postgres sql:</span>
                <div className="text-[#89ddff] leading-normal">{compiledPostgresSql}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-purple-400 font-bold">// compiled elasticsearch dsl:</span>
                <pre className="text-[#f78c6c] leading-normal font-mono overflow-x-auto whitespace-pre">
                  {JSON.stringify(compiledElasticsearchQuery, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Technical Explainer Footer */}
          <div className="p-3 bg-neutral-900/80 border-t border-neutral-800/80 text-[9px] text-zinc-600 leading-normal flex items-start gap-2 shrink-0">
            <Info className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
            <p className="font-mono">
              {tech === "postgresql" 
                ? "PostgreSQL scales excellently for databases under 50GB. Weights (A, B, C) prioritize fields, and the @@ query operator filters via Gin indices."
                : "Elasticsearch handles high-frequency query volumes. Features include inverted indices, tf-idf BM25 ranking, and fuzzy token lookups."}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
