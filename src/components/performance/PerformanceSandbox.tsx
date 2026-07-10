/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from "react";
import { 
  useQuery, useMutation, useQueryClient, useInfiniteQuery 
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { apiFetch } from "../../features/auth/authStore";
import { DesignSystemPlayground } from "./DesignSystemPlayground";
import { 
  Cpu, Terminal, Database, Activity, RefreshCw, AlertTriangle, 
  Clock, Flame, Send, Info, Server, ListRestart
} from "lucide-react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

interface LogEvent {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  message: string;
  durationMs: number;
  status: "SUCCESS" | "WARNING";
  operator: string;
  comments: Array<{ id: string; user: string; text: string; createdAt: string }>;
}

export const PerformanceSandbox: React.FC = () => {
  const queryClient = useQueryClient();
  const { colors } = useMilitaryTheme();
  
  const [search, setSearch] = useState("");
  const [latency, setLatency] = useState(150);
  const [simulateError, setSimulateError] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  
  // Custom tracking for metric visualizers
  const [dedupClicks, setDedupClicks] = useState(0);
  const [networkRequestsCount, setNetworkRequestsCount] = useState(0);
  const lastFetchTimeRef = useRef<number>(0);
  const [lastFetchDuration, setLastFetchDuration] = useState<number>(0);

  // -------------------------------------------------------------
  // 1. REACT QUERY PAGINATED LOGS (Demonstrating API Caching & Deduplication)
  // -------------------------------------------------------------
  const [page, setPage] = useState(1);
  const limit = 30;

  const fetchLogs = async (p: number, s: string, lat: number) => {
    setNetworkRequestsCount(prev => prev + 1);
    const startTime = performance.now();
    
    const res = await apiFetch(`/api/performance/logs?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}&latency=${lat}`);
    if (!res.ok) throw new Error("Failed to load logs");
    
    const json = await res.json();
    const duration = Math.round(performance.now() - startTime);
    lastFetchTimeRef.current = Date.now();
    setLastFetchDuration(duration);
    return json.data;
  };

  const { 
    data, 
    isLoading, 
    isFetching, 
    error, 
    refetch,
  } = useQuery({
    queryKey: ["performance-logs-paginated", page, search, latency],
    queryFn: () => fetchLogs(page, search, latency),
    staleTime: 10000, // keep fresh for 10 seconds
    gcTime: 60000, // keep in cache for 60 seconds
  });

  const logs: LogEvent[] = data?.results || [];
  const stats = data?.stats || { total: 0, totalPages: 1, hasMore: false };

  // -------------------------------------------------------------
  // 2. VIRTUALIZED INFINITE SCROLLER (Demonstrating 5,000 records rendering)
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<"cache" | "virtual" | "design">("cache");
  const infiniteParentRef = useRef<HTMLDivElement>(null);

  // Infinite query fetching
  const fetchInfiniteLogs = async ({ pageParam = 1 }) => {
    setNetworkRequestsCount(prev => prev + 1);
    const res = await apiFetch(`/api/performance/logs?page=${pageParam}&limit=100&latency=50`);
    if (!res.ok) throw new Error("Failed to load infinite scroll logs");
    const json = await res.json();
    return json.data;
  };

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading
  } = useInfiniteQuery({
    queryKey: ["performance-logs-infinite"],
    queryFn: fetchInfiniteLogs,
    getNextPageParam: (lastPage) => {
      const current = lastPage.stats.page;
      return current < lastPage.stats.totalPages ? current + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "virtual" // Only fetch when infinite sub-panel is open
  });

  // Flattened logs list for virtualizer
  const allInfiniteLogs = useMemo(() => {
    if (!infiniteData) return [];
    return infiniteData.pages.flatMap((page) => page.results);
  }, [infiniteData]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: allInfiniteLogs.length,
    getScrollElement: () => infiniteParentRef.current,
    estimateSize: () => 44, // compact log line height
    overscan: 10,
  });

  // Infinite scroll trigger scroll listener
  const handleInfiniteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
      fetchNextPage();
    }
  };

  // -------------------------------------------------------------
  // 3. OPTIMISTIC UPDATES MUTATION (Adding Log Comments)
  // -------------------------------------------------------------
  const selectedLogComments = useMemo(() => {
    const activeLog = logs.find(l => l.id === selectedLogId);
    return activeLog?.comments || [];
  }, [selectedLogId, logs]);

  const addCommentMutation = useMutation({
    mutationFn: async ({ logId, text }: { logId: string; text: string }) => {
      const res = await apiFetch(`/api/performance/logs/${logId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text, simulateError })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to submit log annotation");
      }
      return res.json();
    },
    
    // ON MUTATE: Perform Optimistic Update
    onMutate: async ({ logId, text }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["performance-logs-paginated", page, search, latency] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["performance-logs-paginated", page, search, latency]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["performance-logs-paginated", page, search, latency],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            results: old.results.map((l: LogEvent) => {
              if (l.id === logId) {
                return {
                  ...l,
                  comments: [
                    ...l.comments,
                    {
                      id: `optimistic-${Date.now()}`,
                      user: "You (Optimistic Context)",
                      text: `${text} (Saving...)`,
                      createdAt: new Date().toISOString()
                    }
                  ]
                };
              }
              return l;
            })
          };
        }
      );

      // Return context with snapshot
      return { previousData };
    },

    // ON ERROR: Rollback to snapshot
    onError: (err, variables, context) => {
      console.warn("Optimistic Update failed! Rolling back state...", err);
      if (context?.previousData) {
        queryClient.setQueryData(
          ["performance-logs-paginated", page, search, latency],
          context.previousData
        );
      }
      // Push error to UI alert list
      alert(err.message);
    },

    // ON SETTLED: Refetch query to guarantee sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-logs-paginated", page, search, latency] });
      setCommentText("");
    }
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogId || !commentText.trim()) return;
    addCommentMutation.mutate({ logId: selectedLogId, text: commentText.trim() });
  };

  // Test Deduplication handler
  const triggerDeduplicationTest = () => {
    setDedupClicks(prev => prev + 1);
    // Rapidly trigger 5 refetches
    refetch();
    refetch();
    refetch();
    refetch();
    refetch();
  };

  return (
    <div className="space-y-6 font-mono relative z-10">
      
      {/* Upper Grid: CPU/Engine Health visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className={`bg-black/35 border ${colors.border} rounded-sm p-4 flex items-center gap-4 shadow shadow-black`}>
          <div className="p-3 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1 text-[10px]">
            <span className="font-bold tracking-widest uppercase text-zinc-500 block">CACHE_ENGINE</span>
            <span className="text-sm font-extrabold text-white block mt-0.5 uppercase">ACTIVE STATUS</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1 mt-1 text-[9px] font-extrabold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              STALE: 10S | GC: 60S
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`bg-black/35 border ${colors.border} rounded-sm p-4 flex items-center gap-4 shadow shadow-black`}>
          <div className="p-3 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-[10px]">
            <span className="font-bold tracking-widest uppercase text-zinc-500 block">DEDUP_IN_FLIGHT</span>
            <span className="text-sm font-extrabold text-white block mt-0.5 uppercase">
              {dedupClicks > 0 ? `${dedupClicks} INITIATIONS` : "IDLE / STANDBY"}
            </span>
            <span className="font-mono text-zinc-400 block mt-1 text-[9px] uppercase font-bold">
              Rapid merging engines active
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`bg-black/35 border ${colors.border} rounded-sm p-4 flex items-center gap-4 shadow shadow-black`}>
          <div className="p-3 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-[10px]">
            <span className="font-bold tracking-widest uppercase text-zinc-500 block">RAW_FETCHE_HITS</span>
            <span className="text-sm font-extrabold text-white block mt-0.5 uppercase">{networkRequestsCount} COUNTERED</span>
            <span className="font-mono text-zinc-500 block mt-1 text-[9px] uppercase font-bold">
              Direct telemetry inquiries
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`bg-black/35 border ${colors.border} rounded-sm p-4 flex items-center gap-4 shadow shadow-black`}>
          <div className="p-3 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-[10px]">
            <span className="font-bold tracking-widest uppercase text-zinc-500 block">SAT_TRIP_LATENCY</span>
            <span className="text-sm font-extrabold text-white block mt-0.5 uppercase">{lastFetchDuration > 0 ? `${lastFetchDuration}MS` : "STATIC"}</span>
            <span className="font-mono text-zinc-500 block mt-1 text-[9px] uppercase font-bold">
              Injectable latency parameters
            </span>
          </div>
        </div>

      </div>

      {/* Main interactive tabs */}
      <div className={`bg-black/35 border ${colors.border} rounded-sm overflow-hidden shadow-xl`}>
        
        {/* Tab selection */}
        <div className={`flex border-b ${colors.borderMuted} bg-black/45 px-4 pt-3.5 gap-2 shrink-0 overflow-x-auto scrollbar-none`}>
          <button 
            onClick={() => setActiveTab("cache")}
            className={`px-4.5 py-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-t-sm border-t-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "cache"
                ? "bg-neutral-900 text-emerald-400 border-emerald-600" 
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            CACHING & MERGING RECON
          </button>
          <button 
            onClick={() => setActiveTab("virtual")}
            className={`px-4.5 py-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-t-sm border-t-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "virtual"
                ? "bg-neutral-900 text-emerald-400 border-emerald-600" 
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            5,000 STREAM SCROLLER VIRTUAL
          </button>
          <button 
            onClick={() => setActiveTab("design")}
            className={`px-4.5 py-2.5 text-[9px] tracking-widest font-extrabold uppercase rounded-t-sm border-t-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "design"
                ? "bg-neutral-900 text-emerald-400 border-emerald-600" 
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            TACTICAL DESIGN MATRIX
          </button>
        </div>

        {/* TAB Content 1: API Cache & Deduplication Panel */}
        {activeTab === "cache" && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            
            <div className="flex flex-col lg:flex-row gap-5">
              
              {/* Controls Form */}
              <div className={`flex-1 bg-black/40 border ${colors.borderMuted} p-5 rounded-sm space-y-4`}>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>[HQ SECURE] CORE REGULATION CONSOLE</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search query input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">FUZZY LOGS SECTOR FILTER</label>
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="e.g. DATABASE, INGRESS, AUTH..."
                      className={`w-full bg-black/40 border ${colors.border} rounded-sm px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-neutral-500 uppercase font-bold`}
                    />
                  </div>

                  {/* Network Latency injector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">INJECTED TELEMETRY LATENCY: {latency}MS</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="1500" 
                      value={latency}
                      onChange={(e) => setLatency(Number(e.target.value))}
                      className="w-full bg-black/40 h-1 rounded-sm cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-600 font-extrabold uppercase tracking-wider mt-0.5">
                      <span>10MS (HQ INTEGRATED)</span>
                      <span>1.5S (SATELLITE DOWNLINK)</span>
                    </div>
                  </div>
                </div>

                {/* Optimistic Error toggle */}
                <div className={`bg-black/30 border ${colors.border} p-3 rounded-sm flex items-center justify-between gap-4`}>
                  <div>
                    <span className="text-[10px] font-extrabold text-white block uppercase tracking-wide">SIMULATE DB WRITE BLOCK TIMEOUT</span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5 uppercase">Triggers simulated 500 error parameters to evaluate transaction rollback.</span>
                  </div>
                  <button 
                    onClick={() => setSimulateError(prev => !prev)}
                    className={`px-3 py-1.5 rounded-sm text-[9px] font-extrabold tracking-widest uppercase transition-all cursor-pointer ${
                      simulateError 
                        ? "bg-red-950 border border-red-800 text-red-400" 
                        : "bg-neutral-900 border border-neutral-700 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {simulateError ? "ENGAGED" : "BYPASSED"}
                  </button>
                </div>

                {/* React Query performance inspection */}
                <div className="space-y-2 pt-1 border-t border-white/[0.04]">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">ENGINE CONSOLE EVALUATION DIAGNOSTICS</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px] uppercase font-bold">
                    <div className={`p-2.5 bg-black/40 border ${colors.border} rounded-sm flex justify-between`}>
                      <span className="text-zinc-500">ENGINE STATUS:</span>
                      <span className="text-emerald-400">{isFetching ? "STREAMING..." : "RESOLVED"}</span>
                    </div>
                    <div className={`p-2.5 bg-black/40 border ${colors.border} rounded-sm flex justify-between`}>
                      <span className="text-zinc-500">CACHE PERSIST:</span>
                      <span className="text-emerald-400">FRESH FOR 10S</span>
                    </div>
                  </div>
                </div>

                {/* Deduplication triggers */}
                <div className="flex gap-2">
                  <button 
                    onClick={triggerDeduplicationTest}
                    className="flex-1 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white text-[10px] tracking-widest font-extrabold py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow shadow-black active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                    <span>DEDUPLICATE RAPID INQUIRIES</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      queryClient.clear();
                      setNetworkRequestsCount(0);
                      setDedupClicks(0);
                    }}
                    title="Clear registers and analytics state counters"
                    className={`bg-neutral-900 hover:bg-neutral-800 border ${colors.border} p-2.5 text-zinc-500 hover:text-white rounded-sm transition-colors cursor-pointer`}
                  >
                    <ListRestart className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Explainer Console */}
              <div className={`w-full lg:w-80 bg-black/40 border ${colors.borderMuted} p-5 rounded-sm flex flex-col justify-between shrink-0 text-[10px] leading-relaxed text-zinc-400 uppercase`}>
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-white flex items-center gap-1.5 tracking-widest">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>TELEMETRY GUIDANCE</span>
                  </span>
                  
                  <p className="text-[9px] leading-relaxed">
                    <strong className="text-zinc-200">Request Deduplication:</strong> Rapidly triggering telemetry requests maps overlapping tasks. The system bundles them, resulting in exactly <strong className="text-emerald-400">1 raw engine call</strong>.
                  </p>

                  <p className="text-[9px] leading-relaxed">
                    <strong className="text-zinc-200">Cache Persistence:</strong> Stepping through data structures logs entries inside local scopes. Re-reading sectors retrieves data at <strong className="text-emerald-400">0ms latency</strong>, utilizing in-memory structures.
                  </p>
                </div>

                <div className="bg-neutral-950 p-3 border border-white/[0.04] rounded-sm mt-4 text-[8px] text-zinc-600 font-extrabold tracking-wider">
                  <Info className="w-4 h-4 text-zinc-500 inline mr-1.5 shrink-0" />
                  Telemetry records are shared client-wide instantly.
                </div>
              </div>

            </div>

            {/* Pagination Logs Feed & Log Comments Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Left Column: Paginated Logs (2/3) */}
              <div className={`lg:col-span-2 border ${colors.border} bg-black/35 rounded-sm overflow-hidden flex flex-col max-h-[450px]`}>
                <div className="px-4 py-3 bg-neutral-900/60 border-b border-white/[0.04] flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-extrabold text-white uppercase tracking-widest">ACTIVE REGISTRATION DECK ({stats.total} TOTAL)</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">PAGE {stats.page} OF {stats.totalPages}</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.02] min-h-[250px] scrollbar-thin">
                  {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-t-emerald-500 border-neutral-900 rounded-full animate-spin" />
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SCANNING COMS REGISTERS...</span>
                    </div>
                  ) : error ? (
                    <div className="p-16 text-center text-red-400 flex flex-col items-center gap-2 uppercase">
                      <AlertTriangle className="w-6 h-6" />
                      <span className="text-[10px] font-bold">Telemetry Error: {error.message}</span>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-20 text-center text-zinc-600 text-[10px] uppercase font-bold">
                      No active registry parameters located.
                    </div>
                  ) : (
                    logs.map(log => {
                      const isSelected = log.id === selectedLogId;
                      return (
                        <div 
                          key={log.id}
                          onClick={() => {
                            setSelectedLogId(log.id);
                            setCommentText("");
                          }}
                          className={`p-3 text-xs flex items-start gap-3 cursor-pointer select-none transition-colors ${
                            isSelected ? "bg-neutral-900 border-l-2 border-emerald-500" : "hover:bg-white/[0.01]"
                          }`}
                        >
                          <span className={`px-1.5 py-0.5 rounded-sm font-mono text-[8px] uppercase tracking-wider shrink-0 font-extrabold ${
                            log.status === "SUCCESS" 
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" 
                              : "bg-yellow-950/40 text-yellow-500 border border-yellow-800/40 animate-pulse"
                          }`}>
                            {log.status}
                          </span>
                          
                          <div className="flex-1 min-w-0 font-mono text-[10px] uppercase">
                            <div className="flex items-center gap-2 text-zinc-500 font-bold">
                              <span className="text-zinc-300">{log.module}</span>
                              <span>•</span>
                              <span>{log.id}</span>
                              {log.comments.length > 0 && (
                                <span className="bg-sky-950/40 text-sky-400 border border-sky-900/30 px-1.5 rounded-sm text-[8px] font-extrabold tracking-widest">
                                  {log.comments.length} COMS
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-400 truncate mt-1 font-mono">{log.message}</p>
                          </div>

                          <div className="text-right font-mono text-[9px] text-zinc-600 shrink-0 self-center font-bold">
                            {log.durationMs}MS
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Paginated Footer Controls */}
                <div className="px-4 py-3 bg-neutral-900/60 border-t border-white/[0.04] flex justify-between items-center shrink-0">
                  <button 
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-1.5 border border-white/[0.04] text-[9px] tracking-widest font-extrabold uppercase rounded-sm text-zinc-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    PREV PAGE
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(stats.totalPages, 5) }, (_, idx) => {
                      const isActive = page === idx + 1;
                      return (
                        <button
                          key={idx}
                          onClick={() => setPage(idx + 1)}
                          className={`w-7 h-7 font-mono text-[9px] font-extrabold rounded-sm flex items-center justify-center border transition-all cursor-pointer ${
                            isActive 
                              ? "bg-emerald-800 border-emerald-600 text-white" 
                              : "bg-transparent border-white/[0.04] text-zinc-500 hover:text-white hover:bg-neutral-900"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    disabled={!stats.hasMore || isLoading}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3.5 py-1.5 border border-white/[0.04] text-[9px] tracking-widest font-extrabold uppercase rounded-sm text-zinc-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    NEXT PAGE
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Optimistic comments panel (1/3) */}
              <div className={`border ${colors.border} bg-black/35 rounded-sm overflow-hidden flex flex-col max-h-[450px]`}>
                <div className="px-4 py-3 bg-neutral-900/60 border-b border-white/[0.04] font-extrabold text-[10px] uppercase tracking-widest text-white shrink-0">
                  [LIVE-SYNC] LOG ANNOTATIONS
                </div>

                {selectedLogId ? (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* Comments Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                      <div className="p-3 bg-neutral-950 border border-white/[0.04] rounded-sm text-[9px] leading-relaxed text-zinc-400 font-mono uppercase font-bold">
                        <span className="text-zinc-600 block">SELECTED DECK_ID</span>
                        <strong className="text-white block mt-0.5">{selectedLogId}</strong>
                        <p className="mt-1 text-zinc-300 truncate">{logs.find(l => l.id === selectedLogId)?.message}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-[9px] font-bold uppercase text-zinc-500 block">COMMENTS DIRECTORY ({selectedLogComments.length})</span>
                        {selectedLogComments.length === 0 ? (
                          <p className="text-[9px] font-mono text-zinc-600 py-4 uppercase">No current logs annotated. Inject comment optimistically below.</p>
                        ) : (
                          selectedLogComments.map((c, idx) => (
                            <div key={c.id || idx} className="p-2.5 bg-black/40 border border-white/[0.04] rounded-sm uppercase text-[9px]">
                              <div className="flex justify-between items-center text-zinc-500 font-extrabold">
                                <span className="text-emerald-400">{c.user.toUpperCase()}</span>
                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-zinc-300 mt-1">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Submit Comment form */}
                    <form onSubmit={handlePostComment} className="p-3 border-t border-white/[0.04] bg-neutral-900/40 space-y-2 shrink-0">
                      <div className="relative">
                        <input 
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="ANNOTATE LOG EVENT..."
                          disabled={addCommentMutation.isPending}
                          className="w-full bg-black/40 border border-white/[0.04] px-3.5 py-2 pr-12 rounded-sm text-xs text-white placeholder-zinc-700 outline-none focus:border-neutral-500 uppercase font-bold"
                        />
                        <button 
                          type="submit"
                          disabled={addCommentMutation.isPending || !commentText.trim()}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-emerald-400 hover:text-emerald-300 disabled:opacity-20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-zinc-600 font-extrabold uppercase tracking-widest">
                        <span>LATENCY: +600MS NETWORK DELAY</span>
                        <span>{addCommentMutation.isPending ? "COMMITING..." : "SECURE_STANDBY"}</span>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 uppercase">
                    <Terminal className="w-6 h-6 mb-2 text-zinc-700" />
                    <p className="text-[10px] font-mono leading-relaxed">Select a live registry record to annotate operations data-structures.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB Content 2: Virtualized Infinite Scroller */}
        {activeTab === "virtual" && (
          <div className="p-5 space-y-4 animate-in fade-in duration-200">
            
            {/* Header info bar */}
            <div className="bg-black/40 border border-white/[0.04] p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 uppercase">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-600/20 text-emerald-400 rounded-sm shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold text-white tracking-widest">5,000 ACTIVE RECORD VIRTUAL SCANNER</h4>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5 tracking-wide">
                    Evaluating row recycling systems on large datasets with zero performance drop.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-[9px] font-bold text-zinc-400 bg-neutral-900 border border-white/[0.04] px-3.5 py-1.5 rounded-sm">
                <span>RECON_SCOPE_LOADED:</span>
                <strong className="text-emerald-400 font-extrabold">{allInfiniteLogs.length} EVENTS</strong>
              </div>
            </div>

            {/* Virtualized Container Frame */}
            <div 
              ref={infiniteParentRef}
              onScroll={handleInfiniteScroll}
              className="h-[480px] w-full bg-neutral-950 border border-white/[0.04] rounded-sm overflow-y-auto relative scrollbar-thin divide-y divide-white/[0.02]"
            >
              
              {isInfiniteLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 uppercase">
                  <div className="w-6 h-6 border-2 border-t-emerald-500 border-neutral-900 rounded-full animate-spin" />
                  <span className="text-[9px] font-bold text-zinc-500 tracking-widest">SCANNING DATA BLOCK POOLS...</span>
                </div>
              ) : (
                <div 
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const log = allInfiniteLogs[virtualRow.index];
                    if (!log) return null;
                    
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className={`px-4 flex items-center justify-between text-[10px] font-mono border-b border-white/[0.02] hover:bg-white/[0.01] uppercase ${
                          log.status === "WARNING" ? "bg-red-950/10 border-l border-red-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                          <span className="text-zinc-600 shrink-0 text-[9px] font-bold">{log.id}</span>
                          <span className={`px-1.5 py-0.5 rounded-sm font-mono text-[8px] uppercase tracking-wider shrink-0 font-extrabold ${
                            log.status === "SUCCESS" 
                              ? "bg-emerald-950/20 text-emerald-400" 
                              : "bg-red-950/20 text-red-400 border border-red-900/30"
                          }`}>
                            {log.module}
                          </span>
                          <span className="text-zinc-300 truncate font-mono">{log.message}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 text-zinc-500 font-bold text-[9px]">
                          <span>{log.operator.toUpperCase()}</span>
                          <span className="text-zinc-800">|</span>
                          <span className="w-12 text-right">{log.durationMs}MS</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Loading Indicator at Bottom */}
            {isFetchingNextPage && (
              <div className="p-3 text-center text-[9px] font-bold text-emerald-400 flex items-center justify-center gap-2 bg-neutral-900 border border-white/[0.04] rounded-sm uppercase tracking-widest">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span>STREAMING DEEP REGISTRY SEGMENT DECK (100 RECORDS)...</span>
              </div>
            )}

          </div>
        )}

        {/* TAB Content 3: UI Design System Playground */}
        {activeTab === "design" && (
          <DesignSystemPlayground />
        )}

      </div>

    </div>
  );
};
