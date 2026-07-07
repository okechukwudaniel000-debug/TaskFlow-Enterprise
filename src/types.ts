/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export enum TaskPriority {
  LOWEST = "LOWEST",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  TESTING = "TESTING",
  DONE = "DONE"
}

export enum ActivityAction {
  CREATED = "CREATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  PRIORITY_CHANGED = "PRIORITY_CHANGED",
  ASSIGNEE_CHANGED = "ASSIGNEE_CHANGED",
  COMMENT_ADDED = "COMMENT_ADDED",
  SUBTASK_UPDATED = "SUBTASK_UPDATED",
  CHECKLIST_UPDATED = "CHECKLIST_UPDATED",
  DETAILS_UPDATED = "DETAILS_UPDATED",
  ARCHIVED = "ARCHIVED"
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: UserRole;
  timezone: string;
  language: string;
  theme: "dark" | "light" | "system";
  isOnline?: boolean;
}

export interface WorkspaceMember {
  userId: string;
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: WorkspaceMember[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  color: string; // hex code
  icon: string; // Lucide icon name
  isArchived: boolean;
  isFavorite: boolean;
  template: string; // 'software', 'kanban', 'marketing', etc.
  progress: number; // percentage 0-100
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: ActivityAction;
  details: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  reporterId: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  activityTimeline: ActivityLog[];
  watchers: string[]; // user IDs
  dependencies: string[]; // task IDs that this task depends on
  tags: string[];
  labels: string[];
  projectId: string;
  workspaceId: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  isRead: boolean;
  type: "mention" | "assignment" | "status" | "general";
  createdAt: string;
}
