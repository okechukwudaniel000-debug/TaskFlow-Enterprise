/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Calendar, User, Clock, Flag, Tag, Layers, CheckCircle } from "lucide-react";
import { useTaskFlow } from "../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority } from "../types";
import { useMilitaryTheme } from "../contexts/MilitaryThemeContext";
import { RADIUS, SHADOWS } from "../utils/themeTokens";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: TaskStatus;
  initialDueDate?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose,
  initialStatus = TaskStatus.TODO,
  initialDueDate = ""
}) => {
  const { createTask, projects, users, currentUser } = useTaskFlow();
  const { colors } = useMilitaryTheme();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [tagsInput, setTagsInput] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  
  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDueDate(initialDueDate);
      setStatus(initialStatus);
    }
  }, [isOpen, initialDueDate, initialStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!title.trim()) {
      setValidationError("Task title is required.");
      return;
    }
    if (!projectId) {
      setValidationError("Please select a target Project.");
      return;
    }
    if (estimatedHours < 0) {
      setValidationError("Estimated hours cannot be negative.");
      return;
    }

    const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const labels = labelsInput.split(",").map(l => l.trim()).filter(l => l.length > 0);

    createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      assigneeId: assigneeId || currentUser?.id || "",
      reporterId: currentUser?.id || "",
      priority,
      status,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      estimatedHours,
      actualHours: 0,
      subtasks: [],
      checklist: [],
      attachments: [],
      watchers: [currentUser?.id || ""],
      dependencies: [],
      tags,
      labels,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority(TaskPriority.MEDIUM);
    setEstimatedHours(4);
    setTagsInput("");
    setLabelsInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl ${colors.bgPanel} border ${colors.border} rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 relative z-50`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">[HQ SECURE] DEPLOY NEW TASK TICKET</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded-sm hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-sm text-[10px] font-mono text-red-300 uppercase tracking-wider">
            <span className="font-extrabold text-red-400">[VALIDATION_FAILED]:</span> {validationError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              MISSION TARGET / TICKET TITLE <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PATCH INTEGRATION NETWORK DEVIATIONS"
              maxLength={120}
              className={`w-full bg-black/40 border ${colors.border} rounded-sm px-4 py-2.5 text-xs text-white font-mono placeholder-neutral-600 outline-none focus:border-neutral-500`}
              required
            />
          </div>

          {/* Description Markdown input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
              <span>TACTICAL BRIEFING (MARKDOWN SUPPORTED)</span>
              <span className="text-[8px] text-zinc-600 font-mono tracking-wider">MARKDOWN ENABLED</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide strategic overview, technical parameters, or mission goals..."
              rows={4}
              className={`w-full bg-black/40 border ${colors.border} rounded-sm p-4 text-xs text-white placeholder-neutral-600 outline-none resize-y focus:border-neutral-500`}
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Sector Division <span className="text-red-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-neutral-500`}
              >
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id} className="bg-neutral-900 text-white">
                    {proj.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" /> Lead Operator
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-neutral-500`}
              >
                <option value="" className="bg-neutral-900 text-zinc-500">Unassigned (Assign to Self)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-neutral-900 text-white">
                    {u.name.toUpperCase()} [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Tactical Phase
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-neutral-500`}
              >
                <option value={TaskStatus.BACKLOG} className="bg-neutral-900">BACKLOG</option>
                <option value={TaskStatus.TODO} className="bg-neutral-900">TODO</option>
                <option value={TaskStatus.IN_PROGRESS} className="bg-neutral-900">IN PROGRESS</option>
                <option value={TaskStatus.REVIEW} className="bg-neutral-900">CODE REVIEW</option>
                <option value={TaskStatus.TESTING} className="bg-neutral-900">QA TESTING</option>
                <option value={TaskStatus.DONE} className="bg-neutral-900">DONE</option>
              </select>
            </div>

            {/* Priority Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-zinc-500" /> Threat Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono cursor-pointer outline-none focus:border-neutral-500`}
              >
                <option value={TaskPriority.LOWEST} className="bg-neutral-900">LOWEST</option>
                <option value={TaskPriority.LOW} className="bg-neutral-900">LOW</option>
                <option value={TaskPriority.MEDIUM} className="bg-neutral-900">MEDIUM</option>
                <option value={TaskPriority.HIGH} className="bg-neutral-900">HIGH</option>
                <option value={TaskPriority.CRITICAL} className="bg-neutral-900">CRITICAL</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Target Timeline
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2 text-xs text-white font-mono cursor-pointer outline-none focus:border-neutral-500`}
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Estimated Hours [EST]
              </label>
              <input
                type="number"
                min={1}
                max={160}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2 text-xs text-white font-mono outline-none focus:border-neutral-500`}
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" /> Sector Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. CORE, DB, CRYPTO (comma separated)"
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono placeholder-neutral-600 outline-none focus:border-neutral-500`}
              />
            </div>

            {/* Labels Input */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" /> Strategic Labels
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. milestone-1, beta (comma separated)"
                className={`w-full bg-black/40 border ${colors.border} rounded-sm p-2.5 text-xs text-white font-mono placeholder-neutral-600 outline-none focus:border-neutral-500`}
              />
            </div>

          </div>

          {/* Form action buttons */}
          <div className="pt-4.5 border-t border-white/[0.05] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 hover:text-white hover:bg-white/[0.01] rounded-sm transition-all cursor-pointer"
            >
              ABORT
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-mono font-bold text-[10px] tracking-widest uppercase rounded-sm shadow shadow-black flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>DISPATCH WORKPLANE</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
