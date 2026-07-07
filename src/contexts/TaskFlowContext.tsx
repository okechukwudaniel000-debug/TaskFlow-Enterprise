/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useMemo } from "react";
import { 
  User, 
  UserRole, 
  Workspace, 
  Project, 
  Task, 
  TaskStatus, 
  TaskPriority, 
  Notification 
} from "../types";
import {
  useAuthStore,
  useWorkspaceStore,
  useProjectStore,
  useTaskStore,
  useNotificationStore,
  useUIStore
} from "../app/store";

// Context Type definition (exact match for backward compatibility)
interface TaskFlowContextType {
  // Authentication & Profile State
  currentUser: User | null;
  users: User[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;

  // Workspaces State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceById: (id: string) => void;
  createWorkspace: (name: string, description: string) => void;
  editWorkspace: (id: string, name: string, description: string) => void;
  deleteWorkspace: (id: string) => void;
  inviteWorkspaceMember: (workspaceId: string, email: string, role: UserRole) => void;
  removeWorkspaceMember: (workspaceId: string, userId: string) => void;

  // Projects State
  projects: Project[];
  currentProject: Project | null;
  setCurrentProjectById: (id: string | null) => void;
  createProject: (name: string, description: string, color: string, icon: string, template: string) => void;
  editProject: (id: string, updatedData: Partial<Project>) => void;
  archiveProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  toggleFavoriteProject: (id: string) => void;

  // Tasks State
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

  // Search & Filters State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: TaskPriority | "ALL";
  setFilterPriority: (priority: TaskPriority | "ALL") => void;
  filterStatus: TaskStatus | "ALL";
  setFilterStatus: (status: TaskStatus | "ALL") => void;
  filterAssignee: string | "ALL";
  setFilterAssignee: (assigneeId: string | "ALL") => void;
  filterProject: string | "ALL";
  setFilterProject: (projectId: string | "ALL") => void;
  sortBy: "newest" | "oldest" | "priority" | "dueDate" | "alphabetical";
  setSortBy: (sort: "newest" | "oldest" | "priority" | "dueDate" | "alphabetical") => void;

  // Computed / Filtered State
  filteredTasks: Task[];

  // Notifications State
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;

  // Settings
  theme: "dark" | "light" | "system";
  setThemePreference: (theme: "dark" | "light" | "system") => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

export const TaskFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Integrate modular Zustand stores
  const { currentUser, users, login, logout, updateProfile, forgotPassword, resetPassword } = useAuthStore();
  const { workspaces, currentWorkspace, setCurrentWorkspaceById, createWorkspace, editWorkspace, deleteWorkspace, inviteWorkspaceMember, removeWorkspaceMember } = useWorkspaceStore();
  const { projects, currentProject, setCurrentProjectById, createProject, editProject, archiveProject, duplicateProject, toggleFavoriteProject } = useProjectStore();
  const { tasks, createTask, updateTask, deleteTask, duplicateTask, addComment, toggleSubtask, toggleChecklistItem, addSubtask, addChecklistItem, addAttachment, removeAttachment, bulkUpdateTasks } = useTaskStore();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotification } = useNotificationStore();
  const { searchQuery, setSearchQuery, filterPriority, setFilterPriority, filterStatus, setFilterStatus, filterAssignee, setFilterAssignee, filterProject, setFilterProject, sortBy, setSortBy, theme, setThemePreference } = useUIStore();

  // Compute Instant Filtered Tasks with high-performance useMemo
  const filteredTasks = useMemo(() => {
    if (!currentWorkspace) return [];
    
    let result = tasks.filter(t => t.workspaceId === currentWorkspace.id && !t.isArchived);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.labels.some(lbl => lbl.toLowerCase().includes(q))
      );
    }

    // Filter by project
    if (filterProject !== "ALL") {
      result = result.filter(t => t.projectId === filterProject);
    } else if (currentProject) {
      result = result.filter(t => t.projectId === currentProject.id);
    }

    // Filter by priority
    if (filterPriority !== "ALL") {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus !== "ALL") {
      result = result.filter(t => t.status === filterStatus);
    }

    // Filter by assignee
    if (filterAssignee !== "ALL") {
      result = result.filter(t => t.assigneeId === filterAssignee);
    }

    // Sort result
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const priorityWeight = {
          [TaskPriority.CRITICAL]: 5,
          [TaskPriority.HIGH]: 4,
          [TaskPriority.MEDIUM]: 3,
          [TaskPriority.LOW]: 2,
          [TaskPriority.LOWEST]: 1,
        };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [tasks, currentWorkspace, currentProject, searchQuery, filterProject, filterPriority, filterStatus, filterAssignee, sortBy]);

  return (
    <TaskFlowContext.Provider value={{
      currentUser,
      users,
      login,
      logout,
      updateProfile,
      forgotPassword,
      resetPassword,

      workspaces,
      currentWorkspace,
      setCurrentWorkspaceById,
      createWorkspace,
      editWorkspace,
      deleteWorkspace,
      inviteWorkspaceMember,
      removeWorkspaceMember,

      projects,
      currentProject,
      setCurrentProjectById,
      createProject,
      editProject,
      archiveProject,
      duplicateProject,
      toggleFavoriteProject,

      tasks,
      createTask,
      updateTask,
      deleteTask,
      duplicateTask,
      addComment,
      toggleSubtask,
      toggleChecklistItem,
      addSubtask,
      addChecklistItem,
      addAttachment,
      removeAttachment,
      bulkUpdateTasks,

      searchQuery,
      setSearchQuery,
      filterPriority,
      setFilterPriority,
      filterStatus,
      setFilterStatus,
      filterAssignee,
      setFilterAssignee,
      filterProject,
      setFilterProject,
      sortBy,
      setSortBy,

      filteredTasks,

      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,

      theme,
      setThemePreference
    }}>
      {children}
    </TaskFlowContext.Provider>
  );
};

export const useTaskFlow = () => {
  const context = useContext(TaskFlowContext);
  if (context === undefined) {
    throw new Error("useTaskFlow must be used within a TaskFlowProvider");
  }
  return context;
};
