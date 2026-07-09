/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, Calendar, User, Clock, Flag, Tag, Layers, MessageSquare, 
  Paperclip, Plus, CheckSquare, ListTodo, History, Trash2, Copy, Send,
  Sparkles, Loader2, Brain
} from "lucide-react";
import { useTaskFlow } from "../contexts/TaskFlowContext";
import { Task, TaskPriority, TaskStatus } from "../types";
import { useNotificationStore } from "../features/notifications/notificationStore";
import { apiFetch } from "../features/auth/authStore";

interface TaskDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ taskId, onClose }) => {
  const { 
    tasks, users, currentUser, updateTask, deleteTask, duplicateTask,
    addComment, toggleSubtask, toggleChecklistItem, addSubtask, addChecklistItem,
    addAttachment, removeAttachment, projects
  } = useTaskFlow();

  const task = tasks.find(t => t.id === taskId);

  // Local Form state
  const [commentText, setCommentText] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newChecklistItemTitle, setNewChecklistItemTitle] = useState("");
  
  // Attachments loading state simulation
  const [isUploading, setIsUploading] = useState(false);

  // AI Assistant states
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isEstimatingEffort, setIsEstimatingEffort] = useState(false);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [isSummarizingDiscussion, setIsSummarizingDiscussion] = useState(false);
  const [aiDiscussionSummary, setAiDiscussionSummary] = useState<string | null>(null);

  // Controlled Title and Description to allow dynamic updates from AI
  const [titleInput, setTitleInput] = useState<string | null>(null);
  const [descriptionInput, setDescriptionInput] = useState<string | null>(null);

  React.useEffect(() => {
    setTitleInput(null);
    setDescriptionInput(null);
    setAiDiscussionSummary(null);
  }, [taskId]);

  const handleAiGenerateDescription = async () => {
    const currentTitle = titleInput !== null ? titleInput : task.title;
    const currentNotes = descriptionInput !== null ? descriptionInput : task.description;
    if (!currentTitle) return;

    setIsGeneratingDesc(true);
    try {
      const res = await apiFetch("/api/ai/generate-description", {
        method: "POST",
        body: JSON.stringify({ title: currentTitle, notes: currentNotes })
      });
      const body = await res.json();
      if (body.success && body.data?.description) {
        setDescriptionInput(body.data.description);
        updateTask(task.id, { description: body.data.description });
      } else {
        alert(body.message || "Failed to generate AI description.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI generation failed. Please ensure GEMINI_API_KEY is configured.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAiGenerateSubtasks = async () => {
    const currentTitle = titleInput !== null ? titleInput : task.title;
    const currentDesc = descriptionInput !== null ? descriptionInput : task.description;
    if (!currentTitle) return;

    setIsGeneratingSubtasks(true);
    try {
      const res = await apiFetch("/api/ai/generate-subtasks", {
        method: "POST",
        body: JSON.stringify({ title: currentTitle, description: currentDesc })
      });
      const body = await res.json();
      if (body.success && Array.isArray(body.data?.subtasks)) {
        for (const subTitle of body.data.subtasks) {
          addSubtask(task.id, subTitle);
        }
      } else {
        alert(body.message || "Failed to generate AI subtasks.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI subtasks breakdown failed.");
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleAiEstimateEffort = async () => {
    const currentTitle = titleInput !== null ? titleInput : task.title;
    const currentDesc = descriptionInput !== null ? descriptionInput : task.description;
    if (!currentTitle) return;

    setIsEstimatingEffort(true);
    try {
      const res = await apiFetch("/api/ai/estimate-effort", {
        method: "POST",
        body: JSON.stringify({ title: currentTitle, description: currentDesc })
      });
      const body = await res.json();
      if (body.success && body.data) {
        const { hours, reasoning } = body.data;
        updateTask(task.id, { estimatedHours: hours });
        alert(`AI Suggestion: ${hours} hours.\n\nReasoning:\n${reasoning}`);
      } else {
        alert(body.message || "Failed to estimate effort with AI.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI effort estimation failed.");
    } finally {
      setIsEstimatingEffort(false);
    }
  };

  const handleAiSuggestPriority = async () => {
    const currentTitle = titleInput !== null ? titleInput : task.title;
    const currentDesc = descriptionInput !== null ? descriptionInput : task.description;
    if (!currentTitle) return;

    setIsSuggestingPriority(true);
    try {
      const res = await apiFetch("/api/ai/suggest-priority", {
        method: "POST",
        body: JSON.stringify({ title: currentTitle, description: currentDesc, dueDate: task.dueDate })
      });
      const body = await res.json();
      if (body.success && body.data) {
        const { priority, reasoning } = body.data;
        updateTask(task.id, { priority });
        alert(`AI Recommended Priority: ${priority}.\n\nReasoning:\n${reasoning}`);
      } else {
        alert(body.message || "Failed to suggest priority with AI.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI priority suggestion failed.");
    } finally {
      setIsSuggestingPriority(false);
    }
  };

  const handleAiSummarizeDiscussion = async () => {
    setIsSummarizingDiscussion(true);
    setAiDiscussionSummary(null);
    try {
      const res = await apiFetch(`/api/ai/tasks/${task.id}/summarize-discussion`, {
        method: "POST"
      });
      const body = await res.json();
      if (body.success && body.data?.summary) {
        setAiDiscussionSummary(body.data.summary);
      } else {
        alert(body.message || "Failed to summarize discussions with AI.");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI discussion summary failed.");
    } finally {
      setIsSummarizingDiscussion(false);
    }
  };

  if (!task) return null;

  const currentProject = projects.find(p => p.id === task.projectId);

  // Get User details
  const assignee = users.find(u => u.id === task.assigneeId);
  const reporter = users.find(u => u.id === task.reporterId);

  // Quick state handlers
  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTask(task.id, { assigneeId });
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value.trim();
    if (nextTitle && nextTitle !== task.title) {
      updateTask(task.id, { title: nextTitle });
    }
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const nextDesc = e.target.value.trim();
    if (nextDesc !== task.description) {
      updateTask(task.id, { description: nextDesc });
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTask(task.id, { dueDate: e.target.value });
  };

  const handleEstimatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value) || 0;
    updateTask(task.id, { estimatedHours: hours });
  };

  const handleActualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value) || 0;
    updateTask(task.id, { actualHours: hours });
  };

  // Comments addition with user mentions
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    
    addComment(task.id, text);
    setCommentText("");

    // Detect @mentions and notify mentioned users
    const mentions = text.match(/@(\w+)/g);
    if (mentions) {
      mentions.forEach(mention => {
        const username = mention.substring(1).toLowerCase();
        const matchedUser = users.find(u => 
          u.name.toLowerCase().replace(/\s+/g, "").includes(username) ||
          u.id.toLowerCase().includes(username)
        );
        if (matchedUser && matchedUser.id !== currentUser?.id) {
          const newNotif = {
            id: `not-${Date.now()}-mention`,
            userId: matchedUser.id,
            title: "You were mentioned",
            description: `${currentUser?.name} mentioned you in task '${task.title}': "${text.slice(0, 45)}..."`,
            isRead: false,
            type: "mention" as const,
            createdAt: new Date().toISOString()
          };
          useNotificationStore.getState().addNotification(newNotif);
        }
      });
    }
  };

  // Add subtask
  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  // Add checklist item
  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItemTitle.trim()) return;
    addChecklistItem(task.id, newChecklistItemTitle.trim());
    setNewChecklistItemTitle("");
  };

  // File Upload simulation
  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      addAttachment(
        task.id, 
        `specification_doc_${Math.floor(Math.random() * 100)}.pdf`, 
        "1.2 MB", 
        "#"
      );
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-[#090909]/70 backdrop-blur-sm z-40 flex justify-end">
      {/* Sidebar background clickable to dismiss */}
      <div className="flex-1 cursor-pointer" onClick={onClose} />

      {/* Main Drawer container panel */}
      <div className="w-full max-w-4xl bg-[#151515] border-l border-[#262626] h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-200">
        
        {/* Header Action Row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#0b0b0b] shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="px-2 py-0.5 bg-[#1a1a1a] rounded-md border border-[#262626] text-white font-bold">{task.id}</span>
            <span>/</span>
            <span className="truncate max-w-[200px] text-zinc-300 font-sans font-semibold">{currentProject?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Duplicate Button */}
            <button
              onClick={() => {
                duplicateTask(task.id);
                onClose();
              }}
              title="Duplicate Task"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (confirm("Are you sure you want to permanently delete this task?")) {
                  deleteTask(task.id);
                  onClose();
                }
              }}
              title="Delete Task"
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-[#262626] mx-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE: Core content editor (8 columns) */}
          <div className="lg:col-span-8 p-6 space-y-6 border-r border-[#262626]">
            
            {/* Task Title editable */}
            <div>
              <input
                type="text"
                value={titleInput !== null ? titleInput : task.title}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={(e) => {
                  const nextTitle = e.target.value.trim();
                  if (nextTitle && nextTitle !== task.title) {
                    updateTask(task.id, { title: nextTitle });
                  }
                }}
                className="w-full bg-transparent border-0 text-lg font-extrabold text-white focus:ring-0 px-0 focus:border-b focus:border-blue-500 py-1 font-sans tracking-tight"
                placeholder="Task Title"
              />
            </div>

            {/* Task Description textbox */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Description
                  </h4>
                  <button
                    onClick={handleAiGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingDesc ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    )}
                    <span>AI Generate</span>
                  </button>
                </div>
                <span className="text-[9px] text-zinc-600 font-mono">Auto-saved</span>
              </div>
              <textarea
                value={descriptionInput !== null ? descriptionInput : task.description}
                onChange={(e) => setDescriptionInput(e.target.value)}
                onBlur={(e) => {
                  const nextDesc = e.target.value.trim();
                  if (nextDesc !== task.description) {
                    updateTask(task.id, { description: nextDesc });
                  }
                }}
                rows={5}
                className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md p-3 text-xs text-zinc-300 placeholder-zinc-700 focus:border-[#333] transition-colors outline-none font-sans"
                placeholder="Add rich details or specifications for this issue..."
              />
            </div>

            {/* Subtasks checklist Section */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-zinc-500" />
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Subtasks ({task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAiGenerateSubtasks}
                  disabled={isGeneratingSubtasks}
                  className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono font-bold cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingSubtasks ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                  <span>✨ AI Break Down</span>
                </button>
              </div>

              {/* Existing Subtasks */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2.5 p-2 bg-[#0b0b0b] rounded-md border border-[#262626] hover:border-[#333] transition-colors">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() => toggleSubtask(task.id, sub.id)}
                      className="rounded-md text-blue-600 focus:ring-0 w-3.5 h-3.5 bg-[#151515] border-[#262626] cursor-pointer"
                    />
                    <span className={`text-xs ${sub.isCompleted ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input Form */}
              <form onSubmit={handleAddSub} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a detailed subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-[#0b0b0b] border border-[#262626] rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none"
                />
                <button
                  type="submit"
                  className="px-3 bg-[#151515] hover:bg-[#1a1a1a] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-[#262626] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
            </div>

            {/* Custom Checklist Section */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-zinc-500" />
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Quality Checklist ({task.checklist.filter(i => i.isCompleted).length}/{task.checklist.length})
                </h4>
              </div>

              {/* Existing Checklist */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {task.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2 bg-[#0b0b0b] rounded-md border border-[#262626] hover:border-[#333] transition-colors">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => toggleChecklistItem(task.id, item.id)}
                      className="rounded-md text-blue-600 focus:ring-0 w-3.5 h-3.5 bg-[#151515] border-[#262626] cursor-pointer"
                    />
                    <span className={`text-xs ${item.isCompleted ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Checklist Form */}
              <form onSubmit={handleAddCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a quality assurance checklist item..."
                  value={newChecklistItemTitle}
                  onChange={(e) => setNewChecklistItemTitle(e.target.value)}
                  className="flex-1 bg-[#0b0b0b] border border-[#262626] rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none"
                />
                <button
                  type="submit"
                  className="px-3 bg-[#151515] hover:bg-[#1a1a1a] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-[#262626] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
            </div>

            {/* Attachments panel */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-zinc-500" />
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Attachments ({task.attachments.length})
                  </h4>
                </div>
                <button
                  onClick={handleSimulatedUpload}
                  disabled={isUploading}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono uppercase font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>

              {/* Existing list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {task.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2.5 bg-[#0b0b0b] rounded-md border border-[#262626] hover:border-[#333] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-[#151515] rounded-md text-zinc-400 border border-[#262626]">
                        <Paperclip className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{att.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{att.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(task.id, att.id)}
                      className="p-1 hover:bg-[#1a1a1a] rounded-md text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Feed Area */}
            <div className="space-y-4 pt-4 border-t border-[#262626]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Comments & Discussion ({task.comments.length})
                  </h4>
                </div>
                {task.comments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAiSummarizeDiscussion}
                    disabled={isSummarizingDiscussion}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSummarizingDiscussion ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    )}
                    <span>Summarize Discussion</span>
                  </button>
                )}
              </div>

              {/* AI Discussion Summary Box */}
              {aiDiscussionSummary && (
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-md p-3.5 text-xs text-blue-200 font-sans space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-blue-400" /> AI Executive Summary
                    </span>
                    <button 
                      onClick={() => setAiDiscussionSummary(null)}
                      className="text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{aiDiscussionSummary}</p>
                </div>
              )}

              {/* Existing comments */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {task.comments.map(c => {
                  const comUser = users.find(u => u.id === c.userId);
                  return (
                    <div key={c.id} className="flex gap-3 items-start bg-[#0b0b0b] p-3 rounded-md border border-[#262626]">
                      <img 
                        src={comUser?.avatar} 
                        alt={comUser?.name} 
                        className="w-7 h-7 rounded-full object-cover border border-[#262626]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{comUser?.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Comment Input Form */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <img 
                  src={currentUser?.avatar} 
                  alt={currentUser?.name} 
                  className="w-8 h-8 rounded-full object-cover border border-[#262626] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a supportive comment or post updates..."
                    className="w-full bg-[#0b0b0b] border border-[#262626] rounded-md pl-3 pr-10 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#333] outline-none font-sans"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT SIDE: Metadata panel (4 columns) */}
          <div className="lg:col-span-4 p-6 bg-[#0b0b0b] border-t lg:border-t-0 lg:border-l border-[#262626] space-y-6">
            
            {/* Properties Header */}
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono mb-3">
                Task Parameters
              </h4>

              {/* Status Select */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs font-semibold text-white focus:border-[#333] cursor-pointer outline-none"
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
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={handleAiSuggestPriority}
                    disabled={isSuggestingPriority}
                    className="inline-flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-300 font-mono font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSuggestingPriority ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    )}
                    <span>AI Suggest</span>
                  </button>
                </div>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs font-semibold text-white focus:border-[#333] cursor-pointer outline-none"
                >
                  <option value={TaskPriority.LOWEST}>Lowest Priority</option>
                  <option value={TaskPriority.LOW}>Low Priority</option>
                  <option value={TaskPriority.MEDIUM}>Medium Priority</option>
                  <option value={TaskPriority.HIGH}>High Priority</option>
                  <option value={TaskPriority.CRITICAL}>Critical Priority</option>
                </select>
              </div>

              {/* Assignee Selection */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Assignee
                </label>
                <select
                  value={task.assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Due Date picker */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Due Date
                </label>
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={handleDueDateChange}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs text-white focus:border-[#333] cursor-pointer outline-none font-mono"
                />
              </div>

              {/* Work Hours metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Estimated
                    </label>
                    <button
                      type="button"
                      onClick={handleAiEstimateEffort}
                      disabled={isEstimatingEffort}
                      className="inline-flex items-center gap-0.5 text-[9px] text-blue-400 hover:text-blue-300 font-mono font-bold cursor-pointer disabled:opacity-50"
                      title="Request AI Effort Suggestion"
                    >
                      {isEstimatingEffort ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      )}
                      <span>AI</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={task.estimatedHours}
                    onChange={handleEstimatedChange}
                    className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs text-white text-center outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Logged Actual
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={task.actualHours}
                    onChange={handleActualChange}
                    className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs text-white text-center focus:border-[#333] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Reporter details */}
              <div className="p-3 bg-[#151515] rounded-md border border-[#262626] mb-4 flex items-center gap-2.5">
                <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Reporter</p>
                  <p className="text-xs font-semibold text-zinc-300 truncate">{reporter?.name || "Unknown Author"}</p>
                </div>
              </div>

              {/* Recurrence Dropdown */}
              <div className="space-y-1.5 mb-4">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Recurrence Rules
                </label>
                <select
                  value={task.recurrence || "none"}
                  onChange={(e) => updateTask(task.id, { recurrence: e.target.value as any })}
                  className="w-full bg-[#151515] border border-[#262626] rounded-md p-2 text-xs text-white focus:border-[#333] cursor-pointer outline-none"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily Repeat</option>
                  <option value="weekly">Weekly Repeat</option>
                  <option value="monthly">Monthly Repeat</option>
                </select>
              </div>

              {/* Task Dependencies */}
              <div className="space-y-1.5 mb-4 pt-3 border-t border-[#1e1e1e]">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Task Dependencies
                </label>
                <div className="space-y-1.5">
                  {(task.dependencies || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic">No prerequisites linked.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {(task.dependencies || []).map(depId => (
                        <span key={depId} className="inline-flex items-center gap-1 text-[9px] font-mono bg-[#111111] border border-[#262626] px-2 py-0.5 rounded text-indigo-300">
                          <span>{depId}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = (task.dependencies || []).filter(id => id !== depId);
                              updateTask(task.id, { dependencies: updated });
                            }}
                            className="text-zinc-500 hover:text-red-400 font-bold font-sans cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const updated = [...(task.dependencies || []), e.target.value];
                        updateTask(task.id, { dependencies: updated });
                      }
                    }}
                    className="w-full bg-[#151515] border border-[#262626] rounded-md p-1.5 text-[11px] text-zinc-400 outline-none"
                  >
                    <option value="">+ Link Prerequisite...</option>
                    {tasks
                      .filter(t => t.id !== task.id && !(task.dependencies || []).includes(t.id))
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.id} - {t.title.slice(0, 30)}...</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Custom Fields section */}
              <div className="space-y-1.5 mb-4 pt-3 border-t border-[#1e1e1e]">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Custom Metadata Fields</span>
                </label>
                
                <div className="space-y-1.5">
                  {(task.customFields || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-600 italic">No custom fields defined.</p>
                  ) : (
                    (task.customFields || []).map(f => (
                      <div key={f.id} className="flex items-center justify-between gap-1 text-[11px] bg-[#151515] p-1.5 rounded border border-[#222]">
                        <span className="font-mono text-zinc-400 font-semibold">{f.name}:</span>
                        <span className="text-white truncate max-w-[120px]">{f.value}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (task.customFields || []).filter(field => field.id !== f.id);
                            updateTask(task.id, { customFields: updated });
                          }}
                          className="text-zinc-600 hover:text-red-400 font-bold ml-1 cursor-pointer font-sans"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new custom field inline */}
                <div className="flex gap-1.5 pt-1.5">
                  <input
                    type="text"
                    id="new-field-name"
                    placeholder="Name"
                    className="flex-1 bg-[#151515] border border-[#262626] rounded px-2 py-1 text-[10px] text-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const valInput = document.getElementById("new-field-value") as HTMLInputElement;
                        const nameInput = e.currentTarget;
                        if (nameInput.value.trim() && valInput.value.trim()) {
                          const newField = {
                            id: `cf-${Date.now()}`,
                            name: nameInput.value.trim(),
                            value: valInput.value.trim()
                          };
                          const updated = [...(task.customFields || []), newField];
                          updateTask(task.id, { customFields: updated });
                          nameInput.value = "";
                          valInput.value = "";
                        }
                      }
                    }}
                  />
                  <input
                    type="text"
                    id="new-field-value"
                    placeholder="Value"
                    className="w-20 bg-[#151515] border border-[#262626] rounded px-2 py-1 text-[10px] text-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const nameInput = document.getElementById("new-field-name") as HTMLInputElement;
                        const valInput = e.currentTarget;
                        if (nameInput.value.trim() && valInput.value.trim()) {
                          const newField = {
                            id: `cf-${Date.now()}`,
                            name: nameInput.value.trim(),
                            value: valInput.value.trim()
                          };
                          const updated = [...(task.customFields || []), newField];
                          updateTask(task.id, { customFields: updated });
                          nameInput.value = "";
                          valInput.value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById("new-field-name") as HTMLInputElement;
                      const valInput = document.getElementById("new-field-value") as HTMLInputElement;
                      if (nameInput && valInput && nameInput.value.trim() && valInput.value.trim()) {
                        const newField = {
                          id: `cf-${Date.now()}`,
                          name: nameInput.value.trim(),
                          value: valInput.value.trim()
                        };
                        const updated = [...(task.customFields || []), newField];
                        updateTask(task.id, { customFields: updated });
                        nameInput.value = "";
                        valInput.value = "";
                      }
                    }}
                    className="px-2 bg-neutral-850 hover:bg-neutral-800 text-white rounded text-[10px] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Audit History Timeline */}
            <div className="pt-4 border-t border-[#262626]">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-zinc-500" />
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Audit History Timeline
                </h4>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {task.activityTimeline.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No activity registered on this task.</p>
                ) : (
                  task.activityTimeline.map(log => {
                    const actor = users.find(u => u.id === log.userId);
                    return (
                      <div key={log.id} className="relative pl-4 border-l border-[#262626]">
                        {/* Bullet circle */}
                        <div className="absolute -left-1 top-1.5 w-2 h-2 bg-blue-500/80 rounded-full ring-2 ring-[#0b0b0b]" />
                        <p className="text-[11px] text-zinc-300 leading-snug font-sans">
                          <span className="font-semibold text-white">{actor?.name || "System"}</span> {log.details}
                        </p>
                        <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
