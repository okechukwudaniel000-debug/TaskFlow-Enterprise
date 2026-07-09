import { create } from "zustand";
import { 
  Task, 
  TaskPriority, 
  TaskStatus, 
  ActivityAction, 
  ActivityLog, 
  Comment, 
  Subtask, 
  ChecklistItem, 
  Attachment, 
  Notification 
} from "../../types";
import { useAuthStore } from "../auth/authStore";
import { useNotificationStore } from "../notifications/notificationStore";
import { socket } from "../../lib/socket";

const safeLocalStorage = typeof window !== "undefined" && typeof localStorage !== "undefined" ? localStorage : {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {}
};

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-101",
    title: "Implement Global Search and Command Palette",
    description: "Design and code a highly performant, accessible command bar (Ctrl+K) for navigating projects, searching for issues, and performing quick actions instantly across the workspace.\n\n### Requirements:\n- Instant search with indexing (`useMemo`)\n- Keyboard navigation via Arrow keys, Enter, and Escape\n- Group results by type (Tasks, Projects, Views, Actions)\n- Fuzzy text matching support",
    priority: TaskPriority.CRITICAL,
    status: TaskStatus.IN_PROGRESS,
    assigneeId: "user-1", // Okechukwu Daniel
    reporterId: "user-2", // Sarah Connor
    dueDate: "2026-07-05",
    estimatedHours: 12,
    actualHours: 8,
    subtasks: [
      { id: "sub-1", title: "Build fuzzy matching index", isCompleted: true },
      { id: "sub-2", title: "Implement keyboard listeners and focus trap", isCompleted: true },
      { id: "sub-3", title: "Style the dialog with glassmorphism backdrop", isCompleted: false },
      { id: "sub-4", title: "Add quick shortcut action triggers", isCompleted: false }
    ],
    checklist: [
      { id: "chk-1", title: "Figma design alignment", isCompleted: true },
      { id: "chk-2", title: "ARIA accessibility compliance (combobox)", isCompleted: true },
      { id: "chk-3", title: "Responsive mobile drawer representation", isCompleted: false }
    ],
    attachments: [
      { id: "att-1", name: "search_palette_v1.png", size: "2.4 MB", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80", uploadedAt: "2026-06-28T11:20:00Z" }
    ],
    comments: [
      { id: "c-1", taskId: "task-101", userId: "user-2", content: "Can we ensure this indexes all archived tasks too? Sometimes people need to search historical tickets.", createdAt: "2026-06-29T14:15:00Z" },
      { id: "c-2", taskId: "task-101", userId: "user-1", content: "Yes! I will add a checkbox filter in the search dialog to toggle inclusion of archived items.", createdAt: "2026-06-29T15:02:00Z" }
    ],
    activityTimeline: [
      { id: "act-1", taskId: "task-101", userId: "user-2", action: ActivityAction.CREATED, details: "created the task and assigned to Okechukwu Daniel", createdAt: "2026-06-28T09:30:00Z" },
      { id: "act-2", taskId: "task-101", userId: "user-1", action: ActivityAction.STATUS_CHANGED, details: "moved task from To Do to In Progress", createdAt: "2026-06-29T10:00:00Z" }
    ],
    watchers: ["user-1", "user-2", "user-3"],
    dependencies: [],
    tags: ["UX", "Core", "Feature"],
    labels: ["v2.0-core", "high-priority"],
    projectId: "proj-1",
    workspaceId: "ws-1",
    createdAt: "2026-06-28T09:30:00Z",
    updatedAt: "2026-06-29T15:02:00Z"
  },
  {
    id: "task-102",
    title: "Upgrade Database Drivers and SQL Connection Pool",
    description: "Optimize backend SQL connector with enhanced failover tolerance, query caching layer, and parameterized connection pooling for peak traffic scenarios.",
    priority: TaskPriority.HIGH,
    status: TaskStatus.REVIEW,
    assigneeId: "user-3", // John Doe
    reporterId: "user-1",
    dueDate: "2026-07-02",
    estimatedHours: 16,
    actualHours: 14,
    subtasks: [
      { id: "sub-10", title: "Perform load-testing on current connection pool", isCompleted: true },
      { id: "sub-11", title: "Configure auto-scaling boundaries and replicas", isCompleted: true },
      { id: "sub-12", title: "Address retry logic and query backoff strategies", isCompleted: true }
    ],
    checklist: [],
    attachments: [],
    comments: [],
    activityTimeline: [
      { id: "act-10", taskId: "task-102", userId: "user-1", action: ActivityAction.CREATED, details: "created the task", createdAt: "2026-06-25T11:00:00Z" }
    ],
    watchers: ["user-1"],
    dependencies: [],
    tags: ["Backend", "Performance"],
    labels: ["tech-debt", "critical-infra"],
    projectId: "proj-1",
    workspaceId: "ws-1",
    createdAt: "2026-06-25T11:00:00Z",
    updatedAt: "2026-06-27T16:00:00Z"
  },
  {
    id: "task-103",
    title: "Secure SOC2 Compliance Audit Artifacts",
    description: "Gather and compile security credentials, encryption-at-rest proofs, firewall configurations, and training logs into a secure centralized repository for third-party auditor review.",
    priority: TaskPriority.CRITICAL,
    status: TaskStatus.TODO,
    assigneeId: "user-2", // Sarah Connor
    reporterId: "user-1",
    dueDate: "2026-07-15",
    estimatedHours: 24,
    actualHours: 0,
    subtasks: [
      { id: "sub-20", title: "Pull AWS cloud trail logs", isCompleted: false },
      { id: "sub-21", title: "Collect employee security compliance forms", isCompleted: false },
      { id: "sub-22", title: "Draft incident response checklist docs", isCompleted: false }
    ],
    checklist: [],
    attachments: [],
    comments: [],
    activityTimeline: [],
    watchers: ["user-1", "user-2"],
    dependencies: [],
    tags: ["Compliance", "Security"],
    labels: ["audit-ready"],
    projectId: "proj-3",
    workspaceId: "ws-1",
    createdAt: "2026-06-20T14:30:00Z",
    updatedAt: "2026-06-20T14:30:00Z"
  },
  {
    id: "task-104",
    title: "Produce Interactive Product Launch Sandbox",
    description: "Design a fully functional, browser-based sandbox showing key widgets. This will serve as the hero experience on the launch landing page.",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    assigneeId: "user-3", // John Doe
    reporterId: "user-2",
    dueDate: "2026-07-10",
    estimatedHours: 8,
    actualHours: 0,
    subtasks: [],
    checklist: [],
    attachments: [],
    comments: [],
    activityTimeline: [],
    watchers: [],
    dependencies: ["task-101"],
    tags: ["Marketing", "Frontend"],
    labels: ["launch-v2"],
    projectId: "proj-2",
    workspaceId: "ws-1",
    createdAt: "2026-06-29T10:00:00Z",
    updatedAt: "2026-06-29T10:00:00Z"
  },
  {
    id: "task-105",
    title: "Author Brand Strategy and Press Release Kit",
    description: "Draft official PR statements, brand review guides, and asset files for media partners.",
    priority: TaskPriority.LOW,
    status: TaskStatus.DONE,
    assigneeId: "user-2",
    reporterId: "user-2",
    dueDate: "2026-06-25",
    estimatedHours: 6,
    actualHours: 7,
    subtasks: [],
    checklist: [],
    attachments: [],
    comments: [],
    activityTimeline: [],
    watchers: [],
    dependencies: [],
    tags: ["Marketing"],
    labels: ["marketing-assets"],
    projectId: "proj-2",
    workspaceId: "ws-1",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-25T17:00:00Z"
  },
  {
    id: "task-106",
    title: "Draft Developer SDK Documentation",
    description: "Build complete API usage examples, installation instructions, and deployment guides in beautiful markdown format.",
    priority: TaskPriority.LOWEST,
    status: TaskStatus.BACKLOG,
    assigneeId: "user-1",
    reporterId: "user-1",
    dueDate: "2026-07-20",
    estimatedHours: 10,
    actualHours: 0,
    subtasks: [],
    checklist: [],
    attachments: [],
    comments: [],
    activityTimeline: [],
    watchers: [],
    dependencies: [],
    tags: ["Docs", "SDK"],
    labels: ["developer-portal"],
    projectId: "proj-1",
    workspaceId: "ws-1",
    createdAt: "2026-06-29T12:00:00Z",
    updatedAt: "2026-06-29T12:00:00Z"
  }
];

interface TaskState {
  tasks: Task[];
  createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "activityTimeline">) => void;
  updateTask: (id: string, updatedData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  addComment: (taskId: string, content: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addChecklistItem: (taskId: string, title: string) => void;
  addAttachment: (taskId: string, name: string, size: string, url: string) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  bulkUpdateTasks: (taskIds: string[], status: TaskStatus) => void;
  duplicateProjectTasks: (sourceProjectId: string, targetProjectId: string) => void;
  remoteSyncTask: (updatedTask: Task) => void;
  remoteDeleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => {
  let initialTasks = INITIAL_TASKS;

  try {
    const saved = safeLocalStorage.getItem("tf_tasks");
    if (saved && saved !== "undefined" && saved !== "null") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) initialTasks = parsed;
    }
  } catch (e) {
    console.warn("safeLocalStorage read blocked in taskStore:", e);
  }

  const persistTasks = (updated: Task[]) => {
    set({ tasks: updated });
    try {
      safeLocalStorage.setItem("tf_tasks", JSON.stringify(updated));
    } catch (e) {
      console.warn("safeLocalStorage sync blocked:", e);
    }
  };

  return {
    tasks: initialTasks,
    createTask: (taskData) => {
      const authState = useAuthStore.getState();
      const currentUser = authState.currentUser;
      if (!currentUser) return;
      
      const { tasks } = get();
      const taskId = `task-${Date.now()}`;
      const assigneeName = authState.users.find(u => u.id === taskData.assigneeId)?.name || "unassigned";

      const newTask: Task = {
        ...taskData,
        id: taskId,
        comments: [],
        activityTimeline: [
          {
            id: `act-${Date.now()}`,
            taskId: taskId,
            userId: currentUser.id,
            action: ActivityAction.CREATED,
            details: `created this task and assigned it to ${assigneeName}`,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      persistTasks([newTask, ...tasks]);
      socket.emit("task:mutate", { updatedTask: newTask });

      // Push notification to assignee
      if (taskData.assigneeId && taskData.assigneeId !== currentUser.id) {
        const newNotif: Notification = {
          id: `not-${Date.now()}`,
          userId: taskData.assigneeId,
          title: "New Task Assigned",
          description: `${currentUser.name} assigned task '${taskData.title}' to you.`,
          isRead: false,
          type: "assignment",
          createdAt: new Date().toISOString()
        };
        useNotificationStore.getState().addNotification(newNotif);
      }
    },
    updateTask: (id, updatedData) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const previousTask = tasks.find(t => t.id === id);
      const updated = tasks.map(t => {
        if (t.id === id) {
          const changes: ActivityLog[] = [];
          const logId = `act-${Date.now()}`;

          if (updatedData.status && updatedData.status !== t.status) {
            changes.push({
              id: `${logId}-status`,
              taskId: id,
              userId: currentUser.id,
              action: ActivityAction.STATUS_CHANGED,
              details: `moved task from ${t.status} to ${updatedData.status}`,
              createdAt: new Date().toISOString()
            });

            // Trigger notification to reporter/watchers
            if (t.reporterId && t.reporterId !== currentUser.id) {
              const notif: Notification = {
                id: `not-${Date.now()}-status`,
                userId: t.reporterId,
                title: "Task Status Updated",
                description: `${currentUser.name} updated task '${t.title}' to ${updatedData.status}`,
                isRead: false,
                type: "status",
                createdAt: new Date().toISOString()
              };
              useNotificationStore.getState().addNotification(notif);
            }
          }

          if (updatedData.priority && updatedData.priority !== t.priority) {
            changes.push({
              id: `${logId}-priority`,
              taskId: id,
              userId: currentUser.id,
              action: ActivityAction.PRIORITY_CHANGED,
              details: `changed priority from ${t.priority} to ${updatedData.priority}`,
              createdAt: new Date().toISOString()
            });
          }

          if (updatedData.assigneeId && updatedData.assigneeId !== t.assigneeId) {
            const newAssignee = useAuthStore.getState().users.find(u => u.id === updatedData.assigneeId);
            changes.push({
              id: `${logId}-assignee`,
              taskId: id,
              userId: currentUser.id,
              action: ActivityAction.ASSIGNEE_CHANGED,
              details: `reassigned task to ${newAssignee ? newAssignee.name : "unassigned"}`,
              createdAt: new Date().toISOString()
            });

            // Notify new assignee
            if (updatedData.assigneeId && updatedData.assigneeId !== currentUser.id) {
              const notif: Notification = {
                id: `not-${Date.now()}-assignee`,
                userId: updatedData.assigneeId,
                title: "Task Assigned to You",
                description: `${currentUser.name} assigned task '${t.title}' to you.`,
                isRead: false,
                type: "assignment",
                createdAt: new Date().toISOString()
              };
              useNotificationStore.getState().addNotification(notif);
            }
          }

          if (changes.length === 0) {
            changes.push({
              id: `${logId}-details`,
              taskId: id,
              userId: currentUser.id,
              action: ActivityAction.DETAILS_UPDATED,
              details: `updated task details`,
              createdAt: new Date().toISOString()
            });
          }

          return {
            ...t,
            ...updatedData,
            activityTimeline: [...t.activityTimeline, ...changes],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
      const targetTask = updated.find(t => t.id === id);
      if (targetTask) {
        socket.emit("task:mutate", { updatedTask: targetTask });

        // Handle Automatic Recurring Tasks
        if (
          previousTask &&
          previousTask.status !== TaskStatus.DONE &&
          targetTask.status === TaskStatus.DONE &&
          targetTask.recurrence &&
          targetTask.recurrence !== "none"
        ) {
          let nextDueDate = targetTask.dueDate;
          if (nextDueDate) {
            try {
              const date = new Date(nextDueDate);
              if (targetTask.recurrence === "daily") {
                date.setDate(date.getDate() + 1);
              } else if (targetTask.recurrence === "weekly") {
                date.setDate(date.getDate() + 7);
              } else if (targetTask.recurrence === "monthly") {
                date.setMonth(date.getMonth() + 1);
              }
              nextDueDate = date.toISOString().split("T")[0];
            } catch (err) {
              nextDueDate = new Date().toISOString().split("T")[0];
            }
          } else {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            nextDueDate = date.toISOString().split("T")[0];
          }

          const nextId = `task-${Date.now()}`;
          const nextTask: Task = {
            ...targetTask,
            id: nextId,
            status: TaskStatus.TODO,
            dueDate: nextDueDate,
            subtasks: targetTask.subtasks.map(s => ({ ...s, isCompleted: false })),
            checklist: targetTask.checklist.map(c => ({ ...c, isCompleted: false })),
            attachments: [],
            comments: [],
            activityTimeline: [
              {
                id: `act-${Date.now()}`,
                taskId: nextId,
                userId: currentUser.id,
                action: ActivityAction.CREATED,
                details: `auto-generated next occurrence (${targetTask.recurrence}) of completed task '${targetTask.title}'`,
                createdAt: new Date().toISOString()
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const finalTasks = [nextTask, ...updated];
          persistTasks(finalTasks);
          socket.emit("task:mutate", { updatedTask: nextTask });
        }
      }
    },
    deleteTask: (id) => {
      const { tasks } = get();
      persistTasks(tasks.filter(t => t.id !== id));
      socket.emit("task:delete", { taskId: id });
    },
    duplicateTask: (id) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const source = tasks.find(t => t.id === id);
      if (!source) return;

      const dup: Task = {
        ...source,
        id: `task-${Date.now()}`,
        title: `${source.title} (Copy)`,
        comments: [],
        activityTimeline: [
          {
            id: `act-${Date.now()}`,
            taskId: `task-${Date.now()}`,
            userId: currentUser.id,
            action: ActivityAction.CREATED,
            details: `created task duplicate of ${source.title}`,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      persistTasks([dup, ...tasks]);
    },
    addComment: (taskId, content) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        taskId,
        userId: currentUser.id,
        content,
        createdAt: new Date().toISOString()
      };

      const updated = tasks.map(t => {
        if (t.id === taskId) {
          const act: ActivityLog = {
            id: `act-${Date.now()}-comment`,
            taskId,
            userId: currentUser.id,
            action: ActivityAction.COMMENT_ADDED,
            details: `added a comment: "${content.substring(0, 40)}${content.length > 40 ? "..." : ""}"`,
            createdAt: new Date().toISOString()
          };
          return {
            ...t,
            comments: [...t.comments, newComment],
            activityTimeline: [...t.activityTimeline, act],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);

      // Trigger notification to assignee if it's someone else
      const targetTask = updated.find(t => t.id === taskId);
      if (targetTask) {
        socket.emit("task:mutate", { updatedTask: targetTask });
      }
      if (targetTask && targetTask.assigneeId && targetTask.assigneeId !== currentUser.id) {
        const notif: Notification = {
          id: `not-${Date.now()}-comment`,
          userId: targetTask.assigneeId,
          title: "New Comment Added",
          description: `${currentUser.name} commented on '${targetTask.title}'`,
          isRead: false,
          type: "mention",
          createdAt: new Date().toISOString()
        };
        useNotificationStore.getState().addNotification(notif);
      }
    },
    toggleSubtask: (taskId, subtaskId) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(s => 
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
          );
          const targetSub = t.subtasks.find(s => s.id === subtaskId);
          const act: ActivityLog = {
            id: `act-${Date.now()}-subtask`,
            taskId,
            userId: currentUser.id,
            action: ActivityAction.SUBTASK_UPDATED,
            details: `${targetSub?.isCompleted ? "uncompleted" : "completed"} subtask: "${targetSub?.title}"`,
            createdAt: new Date().toISOString()
          };
          return {
            ...t,
            subtasks: updatedSubtasks,
            activityTimeline: [...t.activityTimeline, act],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    toggleChecklistItem: (taskId, itemId) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          const updatedList = t.checklist.map(item => 
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
          );
          const targetItem = t.checklist.find(i => i.id === itemId);
          const act: ActivityLog = {
            id: `act-${Date.now()}-checklist`,
            taskId,
            userId: currentUser.id,
            action: ActivityAction.CHECKLIST_UPDATED,
            details: `${targetItem?.isCompleted ? "uncompleted" : "completed"} checklist item: "${targetItem?.title}"`,
            createdAt: new Date().toISOString()
          };
          return {
            ...t,
            checklist: updatedList,
            activityTimeline: [...t.activityTimeline, act],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    addSubtask: (taskId, title) => {
      const { tasks } = get();
      const newSub: Subtask = {
        id: `sub-${Date.now()}`,
        title,
        isCompleted: false
      };
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [...t.subtasks, newSub],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    addChecklistItem: (taskId, title) => {
      const { tasks } = get();
      const newItem: ChecklistItem = {
        id: `chk-${Date.now()}`,
        title,
        isCompleted: false
      };
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            checklist: [...t.checklist, newItem],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    addAttachment: (taskId, name, size, url) => {
      const { tasks } = get();
      const newAtt: Attachment = {
        id: `att-${Date.now()}`,
        name,
        size,
        url,
        uploadedAt: new Date().toISOString()
      };
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            attachments: [...t.attachments, newAtt],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    removeAttachment: (taskId, attachmentId) => {
      const { tasks } = get();
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            attachments: t.attachments.filter(att => att.id !== attachmentId),
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    bulkUpdateTasks: (taskIds, status) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { tasks } = get();
      const updated = tasks.map(t => {
        if (taskIds.includes(t.id)) {
          return {
            ...t,
            status,
            activityTimeline: [
              ...t.activityTimeline,
              {
                id: `act-${Date.now()}-bulk-${t.id}`,
                taskId: t.id,
                userId: currentUser.id,
                action: ActivityAction.STATUS_CHANGED,
                details: `bulk moved status to ${status}`,
                createdAt: new Date().toISOString()
              }
            ],
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      persistTasks(updated);
    },
    duplicateProjectTasks: (sourceProjectId, targetProjectId) => {
      const { tasks } = get();
      const sourceTasks = tasks.filter(t => t.projectId === sourceProjectId);
      const newTasks = sourceTasks.map(t => ({
        ...t,
        id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        projectId: targetProjectId,
        comments: [],
        activityTimeline: [],
        createdAt: new Date().toISOString()
      }));

      persistTasks([...tasks, ...newTasks]);
    },
    remoteSyncTask: (updatedTask) => {
      const { tasks } = get();
      const exists = tasks.some(t => t.id === updatedTask.id);
      let updated;
      if (exists) {
        updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      } else {
        updated = [updatedTask, ...tasks];
      }
      persistTasks(updated);
    },
    remoteDeleteTask: (id) => {
      const { tasks } = get();
      persistTasks(tasks.filter(t => t.id !== id));
    }
  };
});
