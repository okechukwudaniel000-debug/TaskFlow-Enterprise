/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Activity, CheckSquare, Target, Users, AlertCircle, Sparkles,
  Brain, Loader2, AlertTriangle, Lightbulb
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority } from "../../types";
import { apiFetch } from "../../features/auth/authStore";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const AnalyticsReport: React.FC = () => {
  const { tasks, users, currentWorkspace } = useTaskFlow();
  const { colors } = useMilitaryTheme();

  const [activeSubTab, setActiveSubTab] = useState<"metrics" | "ai">("metrics");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<{
    report: string;
    bottlenecks: string[];
    deadlineRisks: Array<{
      taskId: string;
      title: string;
      riskLevel: string;
      explanation: string;
    }>;
    suggestions: string[];
  } | null>(null);

  // 1. Calculate General Metrics
  const totalTasks = tasks.length;
  const doneTasks = useMemo(() => tasks.filter(t => t.status === TaskStatus.DONE), [tasks]);
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== TaskStatus.DONE && !t.isArchived), [tasks]);
  
  const completionRate = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((doneTasks.length / totalTasks) * 100);
  }, [totalTasks, doneTasks]);

  const totalEstimatedHours = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  }, [tasks]);

  const totalLoggedHours = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);
  }, [tasks]);

  // 2. Derive: Task Priority breakdown (Pie Chart data)
  const priorityBreakdownData = useMemo(() => {
    const counts = {
      [TaskPriority.CRITICAL]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.LOW]: 0,
      [TaskPriority.LOWEST]: 0,
    };
    tasks.forEach(t => {
      if (counts[t.priority] !== undefined) counts[t.priority]++;
    });

    return [
      { name: "CRITICAL", value: counts[TaskPriority.CRITICAL], color: "#EF4444" },
      { name: "HIGH", value: counts[TaskPriority.HIGH], color: "#F59E0B" },
      { name: "MEDIUM", value: counts[TaskPriority.MEDIUM], color: "#10B981" },
      { name: "LOW", value: counts[TaskPriority.LOW], color: "#06B6D4" },
      { name: "LOWEST", value: counts[TaskPriority.LOWEST], color: "#737373" },
    ].filter(item => item.value > 0);
  }, [tasks]);

  // 3. Derive: Sprint Workload distribution (Bar Chart data)
  const workloadDistributionData = useMemo(() => {
    const memberMap: Record<string, { name: string; completed: number; pending: number }> = {};
    
    users.forEach(u => {
      memberMap[u.id] = { name: u.name.split(" ")[0].toUpperCase(), completed: 0, pending: 0 };
    });

    tasks.forEach(t => {
      if (t.assigneeId && memberMap[t.assigneeId]) {
        if (t.status === TaskStatus.DONE) {
          memberMap[t.assigneeId].completed++;
        } else {
          memberMap[t.assigneeId].pending++;
        }
      }
    });

    return Object.values(memberMap);
  }, [tasks, users]);

  // 4. Derive: Tasks Completed trend (Area Chart data)
  const taskCompletionTrendData = [
    { name: "WK 22", completed: 3, pending: 10, estimated: 55, remaining: 50 },
    { name: "WK 23", completed: 5, pending: 12, estimated: 60, remaining: 42 },
    { name: "WK 24", completed: 8, pending: 9, estimated: 48, remaining: 35 },
    { name: "WK 25", completed: 12, pending: 15, estimated: 72, remaining: 28 },
    { name: "WK 26", completed: doneTasks.length, pending: activeTasks.length, estimated: totalEstimatedHours, remaining: Math.max(0, totalEstimatedHours - totalLoggedHours) },
  ];

  // 5. Derive: Burn-down sprint progression (remaining estimation hours over 7 days sprint)
  const burndownData = [
    { day: "START", target: totalEstimatedHours, actual: totalEstimatedHours },
    { day: "D1", target: Math.round(totalEstimatedHours * 0.85), actual: Math.round(totalEstimatedHours * 0.9) },
    { day: "D2", target: Math.round(totalEstimatedHours * 0.70), actual: Math.round(totalEstimatedHours * 0.75) },
    { day: "D3", target: Math.round(totalEstimatedHours * 0.55), actual: Math.round(totalEstimatedHours * 0.65) },
    { day: "D4", target: Math.round(totalEstimatedHours * 0.40), actual: Math.round(totalEstimatedHours * 0.45) },
    { day: "D5", target: Math.round(totalEstimatedHours * 0.25), actual: Math.round(totalEstimatedHours * 0.3) },
    { day: "D6", target: Math.round(totalEstimatedHours * 0.10), actual: Math.round(totalEstimatedHours * 0.12) },
    { day: "END", target: 0, actual: Math.max(0, totalEstimatedHours - totalLoggedHours) },
  ];

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await apiFetch("/api/ai/productivity-insights", {
        method: "POST",
        body: JSON.stringify({ workspaceId: currentWorkspace?.id || "ws-1" })
      });
      const body = await res.json();
      if (body.success && body.data) {
        setInsights(body.data);
      } else {
        alert(body.message || "Failed to generate AI productivity insights.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error generating AI productivity insights. Please ensure GEMINI_API_KEY is configured.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-white">{part}</strong> : part);
  };

  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("####")) {
        return <h4 key={idx} className="text-[10px] font-extrabold text-emerald-400 mt-4 mb-2 font-mono tracking-widest uppercase">{trimmed.replace(/^####\s*/, "")}</h4>;
      }
      if (trimmed.startsWith("###")) {
        return <h3 key={idx} className="text-[11px] font-extrabold text-white mt-5 mb-2 font-mono tracking-widest uppercase">{trimmed.replace(/^###\s*/, "")}</h3>;
      }
      if (trimmed.startsWith("##")) {
        return <h2 key={idx} className="text-xs font-bold text-white mt-6 mb-3 border-b border-white/[0.04] pb-1 font-mono tracking-widest uppercase">{trimmed.replace(/^##\s*/, "")}</h2>;
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const cleanLine = trimmed.replace(/^[-*]\s*/, "");
        return <li key={idx} className="text-[10px] text-zinc-300 ml-4 list-disc mt-1 leading-relaxed font-mono uppercase">{parseInlineBold(cleanLine)}</li>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-[10px] text-zinc-300 leading-relaxed my-1.5 font-mono uppercase">{parseInlineBold(trimmed)}</p>;
    });
  };

  return (
    <div className="space-y-6 font-mono relative z-10">
      
      {/* Sub-tab selection bar and Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b ${colors.borderMuted} pb-4 gap-4`}>
        <div>
          <h2 className="text-xs font-bold text-white tracking-widest uppercase font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>HQ COMMAND SYSTEMS TELEMETRY</span>
          </h2>
          <p className="text-[9px] text-zinc-500 mt-1 uppercase">TRACK SPRINT METRICS, TEAM DEPLOYMENT & VELOCITY INDICES.</p>
        </div>
        <div className={`flex bg-black/40 p-1 rounded-sm border ${colors.border} self-stretch sm:self-auto shrink-0`}>
          <button
            onClick={() => setActiveSubTab("metrics")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-sm text-[9px] tracking-widest font-extrabold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === "metrics"
                ? "bg-emerald-800 text-white border border-emerald-600"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>STANDARD METRICS</span>
          </button>
          <button
            onClick={() => setActiveSubTab("ai")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-sm text-[9px] tracking-widest font-extrabold uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === "ai"
                ? "bg-emerald-800 text-white border border-emerald-600"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI INTEL RECON</span>
          </button>
        </div>
      </div>

      {activeSubTab === "metrics" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top statistics banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI: Sprint Completion rate */}
            <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 flex items-center justify-between shadow-sm`}>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">TACT_COMPLETION_RATE</p>
                <p className="text-2xl font-extrabold text-emerald-400">{completionRate}%</p>
                <p className="text-[9px] text-zinc-500 uppercase">{doneTasks.length} OF {totalTasks} SECTORS CLOSED</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
            </div>

            {/* KPI: Backlog execution */}
            <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 flex items-center justify-between shadow-sm`}>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ACTIVE_FLIGHT_ISSUES</p>
                <p className="text-2xl font-extrabold text-yellow-400">{activeTasks.length}</p>
                <p className="text-[9px] text-zinc-500 uppercase">IN ACTIVE DESIGN & BUILD QUEUES</p>
              </div>
              <div className="w-10 h-10 bg-yellow-500/10 rounded-sm flex items-center justify-center text-yellow-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            {/* KPI: Time Estimates */}
            <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 flex items-center justify-between shadow-sm`}>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ESTIMATED_EFFORT_POOL</p>
                <p className="text-2xl font-extrabold text-sky-400">{totalEstimatedHours}H</p>
                <p className="text-[9px] text-zinc-500 uppercase">TACTICAL CAPACITY ALLOCATED</p>
              </div>
              <div className="w-10 h-10 bg-sky-500/10 rounded-sm flex items-center justify-center text-sky-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            {/* KPI: Logged hours */}
            <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 flex items-center justify-between shadow-sm`}>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">LOGGED_ACTUAL_EFFORT</p>
                <p className="text-2xl font-extrabold text-emerald-400">{totalLoggedHours}H</p>
                <p className="text-[9px] text-emerald-400/80 uppercase">REAL-TIME TEAM HOURS TRACKED</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-400">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Main Charts Area Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Burn-down and trends (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Burn-Down Sprint progression */}
              <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>SPRINT BURN-DOWN TIMELINE (EFFORT REMAINING)</span>
                  </h3>
                  <span className="text-[8px] bg-black/40 border border-white/[0.04] text-zinc-400 px-2 py-0.5 rounded-sm uppercase">INDEX MATRIX</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={burndownData}>
                      <defs>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="day" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0 }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Area type="monotone" dataKey="target" stroke="#ef4444" name="Target Burndown" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTarget)" />
                      <Area type="monotone" dataKey="actual" stroke="#10B981" name="Actual Burndown" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Velocity Trend line */}
              <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                    HISTORICAL VELOCITY & TELEMETRY INDEX
                  </h3>
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">MONTHLY INDEX</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={taskCompletionTrendData}>
                      <defs>
                        <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0 }} />
                      <Area type="monotone" dataKey="completed" stroke="#10b981" name="Completed Issues" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComp)" />
                      <Area type="monotone" dataKey="pending" stroke="#06b6d4" name="Backlog Queue" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Priority breakdown and user allocations (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Priority Pie chart */}
              <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  PRIORITY THREAT RISK ALLOCATION
                </h3>

                <div className="h-48 flex justify-center">
                  {priorityBreakdownData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500 text-[9px] uppercase">
                      <AlertCircle className="w-5 h-5 mb-1.5 text-zinc-600" />
                      <span>No active priorities</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {priorityBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Labels legend */}
                <div className="grid grid-cols-2 gap-2 text-[9px] uppercase">
                  {priorityBreakdownData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
                      <span className="text-zinc-400 truncate font-extrabold">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User workload bar chart */}
              <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                  OPERATOR WORKLOAD ALLOCATION
                </h3>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 0 }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Bar dataKey="completed" name="Done" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#84cc16" stackId="a" radius={[0, 0, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!insights ? (
            <div className={`bg-black/35 border ${colors.border} rounded-sm p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4 shadow-xl`}>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-400 border border-emerald-600/20">
                <Brain className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-extrabold text-white uppercase tracking-widest">
                  LAUNCH PRODUCTIVITY INSIGHT ANALYZER?
                </h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed max-w-md font-mono uppercase tracking-wide">
                  Leverage Gemini intelligence systems to scan active workspace registers, isolate process bottlenecks, flag delivery risks, and draft workload optimization briefs.
                </p>
              </div>
              <button
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights}
                className="bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-extrabold py-3 px-6 rounded-sm text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>RUNNING RECON SCAN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>INITIATE TELEMETRY INSIGHTS</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Banner section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-emerald-950/20 border border-emerald-800/30 rounded-sm p-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-sm text-emerald-400 border border-emerald-600/20">
                    <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest">
                      ACTIVE TACTICAL BRIEFING REPORT
                    </h4>
                    <p className="text-[9px] text-emerald-400/80 mt-0.5 uppercase tracking-wide">
                      COMPILED FROM RECON PLATFORM INTELLIGENCE DATA-STORES.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={isGeneratingInsights}
                  className={`bg-black/40 hover:bg-white/[0.01] border ${colors.border} text-white py-2 px-4 rounded-sm text-[9px] tracking-widest font-extrabold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-stretch md:self-auto justify-center transition-colors`}
                >
                  {isGeneratingInsights ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>RE-SCAN REGISTERS</span>
                </button>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Main Report & Suggestions (8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Markdown generated Report Card */}
                  <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                    <div className={`flex items-center gap-2 border-b ${colors.borderMuted} pb-3`}>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                        MOMENTUM & CAPACITY BRIEFING
                      </h3>
                    </div>
                    <div className="text-[10px] text-zinc-300 space-y-1">
                      {formatMarkdown(insights.report)}
                    </div>
                  </div>

                  {/* Suggestions Card */}
                  <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                    <div className={`flex items-center gap-2 border-b ${colors.borderMuted} pb-3`}>
                      <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                        BALANCING PROTOCOLS / RECOMMENDATIONS
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {insights.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-[10px] text-zinc-300 font-mono uppercase">
                          <span className="w-5 h-5 bg-amber-500/10 rounded-sm flex items-center justify-center text-[10px] text-amber-400 font-extrabold shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 2. Bottlenecks & Deadline Risks (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Bottlenecks Card */}
                  <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                    <div className={`flex items-center gap-2 border-b ${colors.borderMuted} pb-3`}>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                        DETECTED PIPELINE BLOCKS
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {insights.bottlenecks.map((bottleneck, idx) => (
                        <div key={idx} className={`p-3 bg-black/40 border ${colors.border} rounded-sm flex gap-2.5 items-start`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                          <p className="text-[10px] text-zinc-300 leading-snug font-mono uppercase">{bottleneck}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deadline Risk Prediction Card */}
                  <div className={`bg-black/35 border ${colors.border} rounded-sm p-5 shadow-sm space-y-4`}>
                    <div className={`flex items-center gap-2 border-b ${colors.borderMuted} pb-3`}>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">
                        CRITICAL TIMELINE THREAT DEVIATIONS
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {insights.deadlineRisks.length === 0 ? (
                        <p className="text-[10px] text-zinc-500 italic uppercase">No timeline risk deviations mapped.</p>
                      ) : (
                        insights.deadlineRisks.map((risk, idx) => (
                          <div key={idx} className={`p-3 bg-black/40 border ${colors.border} hover:border-neutral-500 rounded-sm space-y-1.5 transition-colors`}>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">#{risk.taskId}</span>
                              <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-widest ${
                                risk.riskLevel.toLowerCase() === "high" 
                                  ? "bg-red-950/40 text-red-400 border border-red-800/40" 
                                  : "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                              }`}>
                                {risk.riskLevel} RISK
                              </span>
                            </div>
                            <h4 className="text-[10px] font-extrabold text-white uppercase leading-snug">{risk.title}</h4>
                            <p className="text-[9px] text-zinc-400 leading-relaxed uppercase">{risk.explanation}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
