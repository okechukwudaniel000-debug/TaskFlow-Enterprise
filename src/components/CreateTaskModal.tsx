/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Calendar, User, Clock, Flag, Tag, Layers, CheckCircle } from "lucide-react";
import { useTaskFlow } from "../contexts/TaskFlowContext";
import { TaskStatus, TaskPriority } from "../types";

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
    <div className="fixed inset-0 bg-[#090909]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#151515] border border-[#262626] rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">Create New Task</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-md text-xs text-red-200">
            <span className="font-bold">Validation Error:</span> {validationError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={120}
              className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] transition-colors outline-none"
              required
            />
          </div>

          {/* Description Markdown input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>Task Description</span>
              <span className="text-[9px] text-zinc-500 font-mono">SUPPORT MARKDOWN</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the acceptance criteria or context..."
              rows={4}
              className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-4 text-xs text-white placeholder-zinc-600 focus:border-[#333] transition-colors resize-y font-sans outline-none"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Project Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Project <span className="text-red-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
              >
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-500" /> Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
              >
                <option value="">Unassigned (Assign to Self)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" /> Sprint Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
              >
                <option value={TaskStatus.BACKLOG}>Backlog</option>
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Code Review</option>
                <option value={TaskStatus.TESTING}>QA Testing</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-zinc-500" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
              >
                <option value={TaskPriority.LOWEST}>Lowest</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.CRITICAL}>Critical</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white focus:border-[#333] cursor-pointer outline-none font-mono"
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Estimated Work Hours
              </label>
              <input
                type="number"
                min={1}
                max={160}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2 text-xs text-white focus:border-[#333] outline-none font-mono"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-zinc-500" /> Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. UX, Frontend, Core (comma separated)"
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none"
              />
            </div>

            {/* Labels Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-zinc-500" /> Labels
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="e.g. v2-core, tech-debt (comma separated)"
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none"
              />
            </div>

          </div>

          {/* Form action buttons */}
          <div className="pt-4 border-t border-[#262626] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publish Task</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
