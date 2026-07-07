/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, Activity, CheckSquare, Target, Users, AlertCircle, Sparkles
} from "lucide-react";
import { useTaskFlow } from "../../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority } from "../../types";

export const AnalyticsReport: React.FC = () => {
  const { tasks, users, projects } = useTaskFlow();

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

  return (
    <div className="space-y-6">
      
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
  );
};
