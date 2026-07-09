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
import { 
  Cpu, Terminal, Database, Activity, RefreshCw, AlertTriangle, 
  Clock, Flame, Send, Info, ChevronRight, Play, Server, Trash, ListRestart
} from "lucide-react";

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
    dataUpdatedAt
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
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
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
    enabled: isInfiniteMode // Only fetch when infinite sub-panel is open
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
    <div className="space-y-6 font-sans">
      
      {/* Upper Grid: CPU/Engine Health visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#0b0b0b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shadow shadow-black/40">
          <div className="p-3 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-lg shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">Query Engine Cache</span>
            <span className="text-lg font-bold text-white block mt-0.5">Active</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              staleTime: 10s | gcTime: 60s
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0b0b0b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shadow shadow-black/40">
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-lg shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">Deduplicated Requests</span>
            <span className="text-lg font-bold text-white block mt-0.5">{dedupClicks > 0 ? `${dedupClicks} triggers` : "Standing by"}</span>
            <span className="text-[10px] font-mono text-purple-400 block mt-1">
              Deduplicated in-flight fetches
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0b0b0b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shadow shadow-black/40">
          <div className="p-3 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">Direct Engine Fetches</span>
            <span className="text-lg font-bold text-white block mt-0.5">{networkRequestsCount} fetches</span>
            <span className="text-[10px] font-mono text-zinc-500 block mt-1">
              Server-side hits tracked
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0b0b0b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4 shadow shadow-black/40">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">Last Trip Latency</span>
            <span className="text-lg font-bold text-white block mt-0.5">{lastFetchDuration > 0 ? `${lastFetchDuration}ms` : "N/A"}</span>
            <span className="text-[10px] font-mono text-zinc-500 block mt-1">
              Reflects latency query injects
            </span>
          </div>
        </div>

      </div>

      {/* Main interactive tabs */}
      <div className="bg-[#0b0b0b] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex border-b border-neutral-800 bg-[#111111]/70 px-4 pt-3.5 gap-2 shrink-0">
          <button 
            onClick={() => setIsInfiniteMode(false)}
            className={`px-4.5 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all cursor-pointer ${
              !isInfiniteMode 
                ? "bg-[#0b0b0b] text-blue-400 border-blue-500" 
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            API Cache & Deduplication Test
          </button>
          <button 
            onClick={() => setIsInfiniteMode(true)}
            className={`px-4.5 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all cursor-pointer ${
              isInfiniteMode 
                ? "bg-[#0b0b0b] text-blue-400 border-blue-500" 
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            Infinite Scroll Virtualizer (5k Logs)
          </button>
        </div>

        {/* TAB Content 1: API Cache & Deduplication Panel */}
        {!isInfiniteMode && (
          <div className="p-5 space-y-5">
            
            <div className="flex flex-col lg:flex-row gap-5">
              
              {/* Controls Form */}
              <div className="flex-1 bg-neutral-900/40 border border-neutral-800 p-4.5 rounded-lg space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <span>Sandbox Controls</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search query input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Fuzzy Logs Filter</label>
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="e.g. Database, Ingress..."
                      className="w-full bg-[#0b0b0b] border border-neutral-800 px-3 py-1.5 rounded text-xs text-neutral-200 placeholder-zinc-700 outline-none focus:border-neutral-600 font-mono"
                    />
                  </div>

                  {/* Network Latency injector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Inject Client Latency: {latency}ms</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="1500" 
                      value={latency}
                      onChange={(e) => setLatency(Number(e.target.value))}
                      className="w-full bg-[#0b0b0b] h-1.5 rounded cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                      <span>10ms (Local)</span>
                      <span>1.5s (Cloud Satellite)</span>
                    </div>
                  </div>
                </div>

                {/* Optimistic Error toggle */}
                <div className="bg-[#121212] border border-neutral-800 p-3 rounded flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">Simulate DB Write Lock Error</span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">Triggers server 500 error to test optimistic transaction rollback.</span>
                  </div>
                  <button 
                    onClick={() => setSimulateError(prev => !prev)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                      simulateError 
                        ? "bg-red-950/60 border border-red-500/40 text-red-400" 
                        : "bg-neutral-800 border border-neutral-750 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {simulateError ? "Active (Error)" : "Bypassed (Success)"}
                  </button>
                </div>

                {/* React Query performance inspection */}
                <div className="space-y-2 pt-1 border-t border-neutral-800/60">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Query Execution Diagnostics</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="p-2 bg-neutral-900 border border-neutral-800/80 rounded flex justify-between">
                      <span>Status:</span>
                      <span className="text-blue-400 font-bold">{isFetching ? "fetching..." : "cached"}</span>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800/80 rounded flex justify-between">
                      <span>Cache State:</span>
                      <span className="text-emerald-400 font-bold">Stale in 10s</span>
                    </div>
                  </div>
                </div>

                {/* Deduplication triggers */}
                <div className="flex gap-2">
                  <button 
                    onClick={triggerDeduplicationTest}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 border border-blue-500/30 text-white text-xs font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition-all cursor-pointer shadow shadow-blue-900/10"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    <span>Deduplicate Rapid Fetches</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      queryClient.clear();
                      setNetworkRequestsCount(0);
                      setDedupClicks(0);
                    }}
                    title="Clear query client caches and stats counters"
                    className="bg-[#1c1c1c] hover:bg-[#252525] border border-neutral-800 p-2 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                  >
                    <ListRestart className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Explainer Console */}
              <div className="w-full lg:w-80 bg-[#0d0d0d] border border-neutral-800 p-4 rounded-lg flex flex-col justify-between shrink-0 font-mono text-[11px] leading-relaxed text-zinc-400">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Engine Explainer</span>
                  </span>
                  
                  <p className="text-[10px] leading-relaxed">
                    <strong className="text-neutral-300">Request Deduplication:</strong> Clicking the <span className="text-blue-400">Deduplicate</span> button triggers 5 rapid updates. Look at the <span className="text-amber-400">Direct Engine Fetches</span> counter; it increments by exactly <strong className="text-white">1</strong> because duplicates are merged in-flight.
                  </p>

                  <p className="text-[10px] leading-relaxed">
                    <strong className="text-neutral-300">API Caching:</strong> Flipping pagination pages caches their content. Returning to previously scanned pages fetches instantly with <strong className="text-white">0ms</strong> delay because they are resolved straight from cache.
                  </p>
                </div>

                <div className="bg-[#111111] p-3 border border-neutral-800 rounded mt-4 text-[9px] text-zinc-600">
                  <Info className="w-4 h-4 text-zinc-500 inline mr-1.5 shrink-0" />
                  Cache snapshots are synced client-wide instantly.
                </div>
              </div>

            </div>

            {/* Pagination Logs Feed & Log Comments Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Left Column: Paginated Logs (2/3) */}
              <div className="lg:col-span-2 border border-neutral-800 bg-black/40 rounded-lg overflow-hidden flex flex-col max-h-[450px]">
                <div className="px-4 py-3 bg-[#111111] border-b border-neutral-800 flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold text-neutral-200">System Logs Grid ({stats.total} total)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Page {stats.page} of {stats.totalPages}</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-neutral-900 min-h-[250px]">
                  {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-t-blue-500 border-neutral-850 rounded-full animate-spin" />
                      <span className="text-xs font-mono text-zinc-500">Querying API thread...</span>
                    </div>
                  ) : error ? (
                    <div className="p-16 text-center text-red-400 flex flex-col items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      <span className="text-xs font-mono">Error querying server: {error.message}</span>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-20 text-center text-zinc-600 text-xs font-mono">
                      No matching log records found in cache indexes.
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
                            isSelected ? "bg-[#141414] border-l-2 border-blue-500" : "hover:bg-[#111111]/40"
                          }`}
                        >
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-wider shrink-0 font-bold ${
                            log.status === "SUCCESS" 
                              ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30" 
                              : "bg-amber-950/50 text-amber-400 border border-amber-900/30 animate-pulse"
                          }`}>
                            {log.status}
                          </span>
                          
                          <div className="flex-1 min-w-0 font-mono">
                            <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                              <span className="font-bold text-neutral-300">{log.module}</span>
                              <span>•</span>
                              <span>{log.id}</span>
                              {log.comments.length > 0 && (
                                <span className="bg-blue-950/60 text-blue-400 border border-blue-900/30 px-1 rounded text-[9px] font-bold">
                                  {log.comments.length} annotation{log.comments.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-300 truncate mt-1 text-[11px] font-sans">{log.message}</p>
                          </div>

                          <div className="text-right font-mono text-[10px] text-zinc-600 shrink-0 self-center">
                            {log.durationMs}ms
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Paginated Footer Controls */}
                <div className="px-4 py-3 bg-[#111111] border-t border-neutral-800 flex justify-between items-center shrink-0">
                  <button 
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 border border-neutral-800 text-xs font-semibold rounded text-zinc-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    Previous Page
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(stats.totalPages, 5) }, (_, idx) => {
                      const isActive = page === idx + 1;
                      return (
                        <button
                          key={idx}
                          onClick={() => setPage(idx + 1)}
                          className={`w-7 h-7 font-mono text-[11px] font-bold rounded flex items-center justify-center border transition-all cursor-pointer ${
                            isActive 
                              ? "bg-blue-600 border-blue-500 text-white" 
                              : "bg-transparent border-neutral-800 text-zinc-500 hover:text-white hover:bg-neutral-900"
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
                    className="px-3 py-1 border border-neutral-800 text-xs font-semibold rounded text-zinc-400 hover:text-white hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    Next Page
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Optimistic comments panel (1/3) */}
              <div className="border border-neutral-800 bg-[#0c0c0c] rounded-lg overflow-hidden flex flex-col max-h-[450px]">
                <div className="px-4 py-3 bg-[#111111] border-b border-neutral-800 font-bold text-xs text-neutral-200 shrink-0">
                  Optimistic UI Comment Sync
                </div>

                {selectedLogId ? (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* Comments Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="p-3 bg-neutral-900 border border-neutral-850 rounded text-[11px] leading-relaxed text-zinc-400 font-mono">
                        <span className="text-zinc-600 block">SELECTED LOG EVENT</span>
                        <strong className="text-neutral-300 block mt-0.5">{selectedLogId}</strong>
                        <p className="mt-1 font-sans text-neutral-200 truncate">{logs.find(l => l.id === selectedLogId)?.message}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-900">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">Comments ({selectedLogComments.length})</span>
                        {selectedLogComments.length === 0 ? (
                          <p className="text-[10px] font-mono text-zinc-600 py-4">No annotations on this log. Add one optimistically below!</p>
                        ) : (
                          selectedLogComments.map((c, idx) => (
                            <div key={c.id || idx} className="p-2.5 bg-neutral-900/60 border border-neutral-800/60 rounded">
                              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                                <span className="font-bold text-blue-400">{c.user}</span>
                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs text-neutral-300 mt-1 font-sans">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Submit Comment form */}
                    <form onSubmit={handlePostComment} className="p-3 border-t border-neutral-850 bg-black/60 space-y-2 shrink-0">
                      <div className="relative">
                        <input 
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Type log comment/annotation..."
                          disabled={addCommentMutation.isPending}
                          className="w-full bg-[#0a0a0a] border border-neutral-800 px-3.5 py-2 pr-12 rounded text-xs text-neutral-200 placeholder-zinc-700 outline-none focus:border-neutral-600"
                        />
                        <button 
                          type="submit"
                          disabled={addCommentMutation.isPending || !commentText.trim()}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-400 disabled:opacity-20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-zinc-600 font-mono">
                        <span>Latency: +600ms network delay</span>
                        <span>{addCommentMutation.isPending ? "Syncing..." : "Ready"}</span>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <Terminal className="w-6 h-6 mb-2 text-zinc-700" />
                    <p className="text-xs font-mono">Select a system log event from the grid to review and add optimistic annotations.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB Content 2: Virtualized Infinite Scroller */}
        {isInfiniteMode && (
          <div className="p-5 space-y-4">
            
            {/* Header info bar */}
            <div className="bg-[#121212] border border-neutral-800 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-md shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">5,000 Record Virtualizer Scroller</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Demonstrating zero-frame-drops UI using <code className="text-blue-400 font-bold">@tanstack/react-virtual</code> row recycling on infinite datasets.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-zinc-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
                <span>Loaded in Virtual Context:</span>
                <strong className="text-white font-bold">{allInfiniteLogs.length} items</strong>
              </div>
            </div>

            {/* Virtualized Container Frame */}
            <div 
              ref={infiniteParentRef}
              onScroll={handleInfiniteScroll}
              className="h-[480px] w-full bg-[#070707] border border-neutral-800 rounded-lg overflow-y-auto relative scrollbar-thin divide-y divide-neutral-900"
            >
              
              {isInfiniteLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-t-purple-500 border-neutral-850 rounded-full animate-spin" />
                  <span className="text-xs font-mono text-zinc-500">Priming infinite scroll indexes...</span>
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
                        className={`px-4 flex items-center justify-between text-[11px] font-mono border-b border-neutral-900/50 hover:bg-[#111111]/40 ${
                          log.status === "WARNING" ? "bg-red-950/5 border-l border-red-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                          <span className="text-zinc-600 shrink-0 text-[10px]">{log.id}</span>
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] uppercase tracking-wider shrink-0 font-bold ${
                            log.status === "SUCCESS" 
                              ? "bg-emerald-950/20 text-emerald-400/80" 
                              : "bg-red-950/20 text-red-400"
                          }`}>
                            {log.module}
                          </span>
                          <span className="text-neutral-300 truncate">{log.message}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 text-zinc-500">
                          <span>{log.operator}</span>
                          <span className="text-zinc-600">|</span>
                          <span className="w-12 text-right">{log.durationMs}ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Loading Indicator at Bottom */}
            {isFetchingNextPage && (
              <div className="p-3 text-center text-xs font-mono text-purple-400 flex items-center justify-center gap-2 bg-neutral-950/80 border border-neutral-900 rounded">
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-purple-500" />
                <span>Streaming next batch of 100 entries...</span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
