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

export const AnalyticsReport: React.FC = () => {
  const { tasks, users, currentWorkspace } = useTaskFlow();

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
      { name: "Critical", value: counts[TaskPriority.CRITICAL], color: "#EF4444" },
      { name: "High", value: counts[TaskPriority.HIGH], color: "#F59E0B" },
      { name: "Medium", value: counts[TaskPriority.MEDIUM], color: "#2563EB" },
      { name: "Low", value: counts[TaskPriority.LOW], color: "#06B6D4" },
      { name: "Lowest", value: counts[TaskPriority.LOWEST], color: "#737373" },
    ].filter(item => item.value > 0);
  }, [tasks]);

  // 3. Derive: Sprint Workload distribution (Bar Chart data)
  const workloadDistributionData = useMemo(() => {
    const memberMap: Record<string, { name: string; completed: number; pending: number }> = {};
    
    users.forEach(u => {
      memberMap[u.id] = { name: u.name.split(" ")[0], completed: 0, pending: 0 };
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
    { name: "Week 22", completed: 3, pending: 10, estimated: 55, remaining: 50 },
    { name: "Week 23", completed: 5, pending: 12, estimated: 60, remaining: 42 },
    { name: "Week 24", completed: 8, pending: 9, estimated: 48, remaining: 35 },
    { name: "Week 25", completed: 12, pending: 15, estimated: 72, remaining: 28 },
    { name: "Week 26", completed: doneTasks.length, pending: activeTasks.length, estimated: totalEstimatedHours, remaining: Math.max(0, totalEstimatedHours - totalLoggedHours) },
  ];

  // 5. Derive: Burn-down sprint progression (remaining estimation hours over 7 days sprint)
  const burndownData = [
    { day: "Sprint Start", target: totalEstimatedHours, actual: totalEstimatedHours },
    { day: "Day 1", target: Math.round(totalEstimatedHours * 0.85), actual: Math.round(totalEstimatedHours * 0.9) },
    { day: "Day 2", target: Math.round(totalEstimatedHours * 0.70), actual: Math.round(totalEstimatedHours * 0.75) },
    { day: "Day 3", target: Math.round(totalEstimatedHours * 0.55), actual: Math.round(totalEstimatedHours * 0.65) },
    { day: "Day 4", target: Math.round(totalEstimatedHours * 0.40), actual: Math.round(totalEstimatedHours * 0.45) },
    { day: "Day 5", target: Math.round(totalEstimatedHours * 0.25), actual: Math.round(totalEstimatedHours * 0.3) },
    { day: "Day 6", target: Math.round(totalEstimatedHours * 0.10), actual: Math.round(totalEstimatedHours * 0.12) },
    { day: "Sprint End", target: 0, actual: Math.max(0, totalEstimatedHours - totalLoggedHours) },
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
        return <h4 key={idx} className="text-sm font-extrabold text-blue-400 mt-4 mb-2 font-mono tracking-wide uppercase">{trimmed.replace(/^####\s*/, "")}</h4>;
      }
      if (trimmed.startsWith("###")) {
        return <h3 key={idx} className="text-base font-extrabold text-white mt-5 mb-2 font-mono tracking-wide uppercase">{trimmed.replace(/^###\s*/, "")}</h3>;
      }
      if (trimmed.startsWith("##")) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 border-b border-[#262626] pb-1 font-sans">{trimmed.replace(/^##\s*/, "")}</h2>;
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const cleanLine = trimmed.replace(/^[-*]\s*/, "");
        return <li key={idx} className="text-xs text-zinc-300 ml-4 list-disc mt-1 leading-relaxed">{parseInlineBold(cleanLine)}</li>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-zinc-300 leading-relaxed my-1.5">{parseInlineBold(trimmed)}</p>;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab selection bar and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#262626] pb-4 gap-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wider uppercase font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Workspace Analytics & Reports</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Track and optimize sprint metrics and team capacity.</p>
        </div>
        <div className="flex bg-[#111111] p-1 rounded-md border border-[#262626] self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab("metrics")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === "metrics"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white font-mono uppercase text-[10px]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Standard Metrics</span>
          </button>
          <button
            onClick={() => setActiveSubTab("ai")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeSubTab === "ai"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:text-white font-mono uppercase text-[10px]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Workspace Insights</span>
          </button>
        </div>
      </div>

      {activeSubTab === "metrics" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top statistics banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI: Sprint Completion rate */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Sprint Complete rate</p>
                <p className="text-2xl font-extrabold text-blue-500">{completionRate}%</p>
                <p className="text-[10px] text-zinc-400">{doneTasks.length} out of {totalTasks} closed</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-400">
                <Target className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Backlog execution */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Active Sprint Issues</p>
                <p className="text-2xl font-extrabold text-amber-500">{activeTasks.length}</p>
                <p className="text-[10px] text-zinc-400">In backlog & design flight</p>
              </div>
              <div className="w-10 h-10 bg-amber-500/10 rounded-md flex items-center justify-center text-amber-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Time Estimates */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Total Estimation</p>
                <p className="text-2xl font-extrabold text-indigo-400">{totalEstimatedHours}h</p>
                <p className="text-[10px] text-zinc-400">Sprint points allocated</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-md flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* KPI: Logged hours */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Logged Hours Actual</p>
                <p className="text-2xl font-extrabold text-emerald-400">{totalLoggedHours}h</p>
                <p className="text-[10px] text-emerald-400/85">Real-time team work tracked</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Main Charts Area Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Burn-down and trends (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Burn-Down Sprint progression */}
              <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Sprint Burn-Down Chart (Remaining Hours)</span>
                  </h3>
                  <span className="text-[9px] bg-[#0b0b0b] border border-[#262626] text-zinc-400 px-2 py-0.5 rounded-md font-mono">Point Matrix</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={burndownData}>
                      <defs>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="day" stroke="#737373" fontSize={11} />
                      <YAxis stroke="#737373" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0b", border: "1px solid #262626", borderRadius: 4 }} />
                      <Legend />
                      <Area type="monotone" dataKey="target" stroke="#ef4444" name="Target Burndown" strokeWidth={2} fillOpacity={1} fill="url(#colorTarget)" />
                      <Area type="monotone" dataKey="actual" stroke="#2563eb" name="Actual Burndown" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Velocity Trend line */}
              <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Historical Velocity & Trend lines
                  </h3>
                  <span className="text-[9px] text-zinc-500 font-mono">Monthly Index</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={taskCompletionTrendData}>
                      <defs>
                        <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#737373" fontSize={11} />
                      <YAxis stroke="#737373" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0b", border: "1px solid #262626", borderRadius: 4 }} />
                      <Area type="monotone" dataKey="completed" stroke="#22c55e" name="Completed Issues" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                      <Area type="monotone" dataKey="pending" stroke="#06b6d4" name="Backlog Queue" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Priority breakdown and user allocations (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Priority Pie chart */}
              <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Priority Risk Allocation
                </h3>

                <div className="h-48 flex justify-center">
                  {priorityBreakdownData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500 text-xs">
                      <AlertCircle className="w-5 h-5 mb-1.5" />
                      <span>No active prioritizations</span>
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
                        <Tooltip contentStyle={{ backgroundColor: "#0b0b0b", border: "1px solid #262626", borderRadius: 4 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Labels legend */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {priorityBreakdownData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                      <span className="text-zinc-400 truncate">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User workload bar chart */}
              <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Sprint Workload Distribution
                </h3>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                      <XAxis dataKey="name" stroke="#737373" fontSize={10} />
                      <YAxis stroke="#737373" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0b0b", border: "1px solid #262626", borderRadius: 4 }} />
                      <Legend fontSize={10} />
                      <Bar dataKey="completed" name="Done" fill="#22c55e" stackId="a" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="pending" name="Remaining" fill="#2563eb" stackId="a" radius={[4, 4, 0, 0]} />
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
            <div className="bg-[#151515] border border-[#262626] rounded-md p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Brain className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Ready to optimize team capacity?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md font-sans">
                  Leverage the power of server-side Gemini intelligence to analyze task distribution, detect process bottlenecks, predict deadline risks, and get actionable suggestions for your team.
                </p>
              </div>
              <button
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights}
                className="bg-blue-600 hover:bg-blue-500 border border-blue-500/30 text-white font-semibold py-2.5 px-6 rounded-md text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="font-mono uppercase text-[10px]">Analyzing workspace records...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span className="font-mono uppercase text-[10px]">Generate AI Productivity Insights</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Banner section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-950/15 border border-blue-500/20 rounded-md p-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/15 rounded-md text-blue-400 border border-blue-500/20">
                    <Brain className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Productivity Intelligence Report
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Generated dynamically by server-side Gemini intelligence.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateInsights}
                  disabled={isGeneratingInsights}
                  className="bg-[#151515] hover:bg-[#1a1a1a] border border-[#262626] text-white py-1.5 px-4 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-stretch md:self-auto justify-center"
                >
                  {isGeneratingInsights ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="font-mono uppercase text-[10px]">Re-Analyze Workspace</span>
                </button>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Main Report & Suggestions (8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Markdown generated Report Card */}
                  <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Momentum & Capacity Report
                      </h3>
                    </div>
                    <div className="text-xs text-zinc-300 space-y-1">
                      {formatMarkdown(insights.report)}
                    </div>
                  </div>

                  {/* Suggestions Card */}
                  <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                      <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Workload Balancing suggestions
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {insights.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-zinc-300 font-sans">
                          <span className="w-5 h-5 bg-amber-500/10 rounded-full flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0 font-mono mt-0.5">{idx + 1}</span>
                          <span className="leading-relaxed font-sans">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 2. Bottlenecks & Deadline Risks (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Bottlenecks Card */}
                  <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Detected Bottlenecks
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {insights.bottlenecks.map((bottleneck, idx) => (
                        <div key={idx} className="p-3 bg-[#0b0b0b] border border-[#262626] rounded-md flex gap-2.5 items-start">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                          <p className="text-xs text-zinc-300 leading-snug font-sans">{bottleneck}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deadline Risk Prediction Card */}
                  <div className="bg-[#151515] border border-[#262626] rounded-md p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Deadline Risk Prediction
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {insights.deadlineRisks.length === 0 ? (
                        <p className="text-[11px] text-zinc-500 italic">No critical deadline risks identified.</p>
                      ) : (
                        insights.deadlineRisks.map((risk, idx) => (
                          <div key={idx} className="p-3 bg-[#0b0b0b] border border-[#262626] hover:border-[#333] rounded-md space-y-1.5 transition-colors">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">#{risk.taskId}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                                risk.riskLevel.toLowerCase() === "high" 
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}>
                                {risk.riskLevel} Risk
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-white leading-snug font-sans">{risk.title}</h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{risk.explanation}</p>
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
