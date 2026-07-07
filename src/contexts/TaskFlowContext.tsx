/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { 
  User, 
  UserRole, 
  Workspace, 
  Project, 
  Task, 
  TaskStatus, 
  TaskPriority, 
  Comment, 
  ActivityLog, 
  ActivityAction, 
  Notification,
  Subtask,
  ChecklistItem,
  Attachment
} from "../types";

// Setup Mock Users
export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Okechukwu Daniel",
    email: "okechukwudaniel000@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Principal Software Architect at TaskFlow Enterprise. Passionate about system engineering, clean architectures, and modern web apps.",
    role: UserRole.ADMIN,
    timezone: "America/Los_Angeles",
    language: "en",
    theme: "dark"
  },
  {
    id: "user-2",
    name: "Sarah Connor",
    email: "sarah.c@taskflow.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Senior Product Manager. Focused on agile delivery and team alignment.",
    role: UserRole.MANAGER,
    timezone: "America/New_York",
    language: "en",
    theme: "light",
    isOnline: true
  },
  {
    id: "user-3",
    name: "John Doe",
    email: "john.d@taskflow.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Senior UI/UX Engineer. Obsessed with micro-interactions and Framer Motion.",
    role: UserRole.MEMBER,
    timezone: "Europe/London",
    language: "en",
    theme: "dark",
    isOnline: true
  },
  {
    id: "user-4",
    name: "Alice Smith",
    email: "alice.s@taskflow.io",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Quality Assurance Engineer. Making sure everything is pixel perfect and bug-free.",
    role: UserRole.MEMBER,
    timezone: "Europe/Paris",
    language: "en",
    theme: "system",
    isOnline: false
  },
  {
    id: "user-5",
    name: "Guest Observer",
    email: "guest@taskflow.io",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "External stakeholder observing progress.",
    role: UserRole.GUEST,
    timezone: "Asia/Tokyo",
    language: "en",
    theme: "light"
  }
];

// Initial mock data to seed local storage on first launch
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: "ws-1",
    name: "TaskFlow Enterprise Co",
    description: "Main workspace for product, engineering, and design workflows.",
    ownerId: "user-1",
    members: [
      { userId: "user-1", role: UserRole.ADMIN },
      { userId: "user-2", role: UserRole.MANAGER },
      { userId: "user-3", role: UserRole.MEMBER },
      { userId: "user-4", role: UserRole.MEMBER },
      { userId: "user-5", role: UserRole.GUEST }
    ]
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Apollo Platform v2.0",
    description: "Re-architecting core services for better performance, scalability, and security.",
    workspaceId: "ws-1",
    color: "#2563EB", // Blue
    icon: "Rocket",
    isArchived: false,
    isFavorite: true,
    template: "software",
    progress: 68,
    createdAt: "2026-05-15T09:00:00Z"
  },
  {
    id: "proj-2",
    name: "Marketing Launch Campaign",
    description: "Planning global launch and customer outreach program.",
    workspaceId: "ws-1",
    color: "#F59E0B", // Warning Orange
    icon: "Megaphone",
    isArchived: false,
    isFavorite: true,
    template: "kanban",
    progress: 42,
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: "proj-3",
    name: "Compliance & Security Review",
    description: "Pre-audit preparation for SOC2 and GDPR certificates.",
    workspaceId: "ws-1",
    color: "#EF4444", // Danger Red
    icon: "ShieldAlert",
    isArchived: false,
    isFavorite: false,
    template: "kanban",
    progress: 15,
    createdAt: "2026-06-10T14:30:00Z"
  }
];

const INITIAL_TASKS: Task[] = [
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

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    userId: "user-1",
    title: "New Task Assigned",
    description: "Sarah Connor assigned task 'Implement Global Search and Command Palette' to you.",
    isRead: false,
    type: "assignment",
    createdAt: "2026-06-28T09:30:00Z"
  },
  {
    id: "not-2",
    userId: "user-1",
    title: "Mentioned in Comment",
    description: "Sarah Connor mentioned you in 'Upgrade Database Drivers and SQL Connection Pool': 'Please review the failover timing.'",
    isRead: false,
    type: "mention",
    createdAt: "2026-06-29T14:15:00Z"
  },
  {
    id: "not-3",
    userId: "user-1",
    title: "Task Completed",
    description: "Sarah Connor moved 'Author Brand Strategy and Press Release Kit' to Done.",
    isRead: true,
    type: "status",
    createdAt: "2026-06-25T17:00:00Z"
  }
];

// Context Type definition
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
  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("tf_current_user");
      if (!savedUser || savedUser === "undefined" || savedUser === "null") return MOCK_USERS[0];
      return JSON.parse(savedUser) || MOCK_USERS[0];
    } catch {
      return MOCK_USERS[0];
    }
  });
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem("tf_users");
      if (!savedUsers || savedUsers === "undefined" || savedUsers === "null") return MOCK_USERS;
      const parsed = JSON.parse(savedUsers);
      return Array.isArray(parsed) ? parsed : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  });

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light" | "system">(() => {
    try {
      return (localStorage.getItem("tf_theme") as "dark" | "light" | "system") || "dark";
    } catch {
      return "dark";
    }
  });

  // Workspaces, Projects, Tasks, Notifications
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem("tf_workspaces");
      if (!saved || saved === "undefined" || saved === "null") return INITIAL_WORKSPACES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("tf_projects");
      if (!saved || saved === "undefined" || saved === "null") return INITIAL_PROJECTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("tf_tasks");
      if (!saved || saved === "undefined" || saved === "null") return INITIAL_TASKS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem("tf_notifications");
      if (!saved || saved === "undefined" || saved === "null") return INITIAL_NOTIFICATIONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string | "ALL">("ALL");
  const [filterProject, setFilterProject] = useState<string | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "dueDate" | "alphabetical">("newest");

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("tf_current_user", JSON.stringify(currentUser));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("tf_users", JSON.stringify(users));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("tf_workspaces", JSON.stringify(workspaces));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem("tf_projects", JSON.stringify(projects));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem("tf_tasks", JSON.stringify(tasks));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("tf_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [notifications]);

  // Handle current workspace on startup
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace]);

  // Handle HTML document theme classes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    try {
      localStorage.setItem("tf_theme", theme);
    } catch (e) {
      console.warn("localStorage sync blocked:", e);
    }
  }, [theme]);

  const setThemePreference = useCallback((themePref: "dark" | "light" | "system") => {
    setTheme(themePref);
  }, []);

  // Auth Operations
  const login = useCallback(async (email: string): Promise<boolean> => {
    // Look up user by email or register a new one as an ADMIN
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    } else {
      // Register new user on the fly for ease of use
      const name = email.split("@")[0];
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
        bio: "Senior Product Engineer",
        role: UserRole.MEMBER,
        timezone: "America/Los_Angeles",
        language: "en",
        theme: "dark"
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
    }
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  }, [currentUser]);

  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    // Mock password recovery
    console.log("Forgot password requested for: ", email);
  }, []);

  const resetPassword = useCallback(async (password: string): Promise<void> => {
    // Mock password reset
    console.log("Reset password to: ", password);
  }, []);

  // Workspace Operations
  const setCurrentWorkspaceById = useCallback((id: string) => {
    const found = workspaces.find(w => w.id === id);
    if (found) setCurrentWorkspace(found);
  }, [workspaces]);

  const createWorkspace = useCallback((name: string, description: string) => {
    if (!currentUser) return;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      ownerId: currentUser.id,
      members: [{ userId: currentUser.id, role: UserRole.ADMIN }]
    };
    setWorkspaces(prev => [...prev, newWs]);
    setCurrentWorkspace(newWs);
  }, [currentUser]);

  const editWorkspace = useCallback((id: string, name: string, description: string) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name, description } : w));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(prev => prev ? { ...prev, name, description } : null);
    }
  }, [currentWorkspace]);

  const deleteWorkspace = useCallback((id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(null);
    }
  }, [currentWorkspace]);

  const inviteWorkspaceMember = useCallback((workspaceId: string, email: string, role: UserRole) => {
    // Check if user already exists
    let existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      // Create user
      const name = email.split("@")[0];
      existingUser = {
        id: `user-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
        bio: "Invited Team Member",
        role: role,
        timezone: "America/Los_Angeles",
        language: "en",
        theme: "dark"
      };
      setUsers(prev => [...prev, existingUser!]);
    }

    setWorkspaces(prev => prev.map(w => {
      if (w.id === workspaceId) {
        // Avoid duplicate members
        const isAlreadyMember = w.members.some(m => m.userId === existingUser!.id);
        if (isAlreadyMember) return w;
        return {
          ...w,
          members: [...w.members, { userId: existingUser!.id, role }]
        };
      }
      return w;
    }));

    // Update current workspace ref
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => {
        if (!prev) return null;
        const isAlreadyMember = prev.members.some(m => m.userId === existingUser!.id);
        if (isAlreadyMember) return prev;
        return {
          ...prev,
          members: [...prev.members, { userId: existingUser!.id, role }]
        };
      });
    }
  }, [users, currentWorkspace]);

  const removeWorkspaceMember = useCallback((workspaceId: string, userId: string) => {
    setWorkspaces(prev => prev.map(w => {
      if (w.id === workspaceId) {
        return {
          ...w,
          members: w.members.filter(m => m.userId !== userId)
        };
      }
      return w;
    }));

    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.filter(m => m.userId !== userId)
        };
      });
    }
  }, [currentWorkspace]);

  // Project Operations
  const setCurrentProjectById = useCallback((id: string | null) => {
    if (id === null) {
      setCurrentProject(null);
    } else {
      const found = projects.find(p => p.id === id);
      if (found) setCurrentProject(found);
    }
  }, [projects]);

  const createProject = useCallback((name: string, description: string, color: string, icon: string, template: string) => {
    if (!currentWorkspace) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      workspaceId: currentWorkspace.id,
      color,
      icon,
      isArchived: false,
      isFavorite: false,
      template,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
  }, [currentWorkspace]);

  const editProject = useCallback((id: string, updatedData: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    if (currentProject?.id === id) {
      setCurrentProject(prev => prev ? { ...prev, ...updatedData } : null);
    }
  }, [currentProject]);

  const archiveProject = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p));
    if (currentProject?.id === id) {
      setCurrentProject(prev => prev ? { ...prev, isArchived: true } : null);
    }
  }, [currentProject]);

  const duplicateProject = useCallback((id: string) => {
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const duplicate: Project = {
      ...source,
      id: `proj-${Date.now()}`,
      name: `${source.name} (Copy)`,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, duplicate]);

    // Also duplicate its tasks
    const sourceTasks = tasks.filter(t => t.projectId === id);
    const newTasks = sourceTasks.map(t => ({
      ...t,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: duplicate.id,
      comments: [],
      activityTimeline: [],
      createdAt: new Date().toISOString()
    }));
    setTasks(prev => [...prev, ...newTasks]);
  }, [projects, tasks]);

  const toggleFavoriteProject = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    if (currentProject?.id === id) {
      setCurrentProject(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  }, [currentProject]);

  // Tasks Operations
  const createTask = useCallback((taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "activityTimeline">) => {
    if (!currentUser) return;
    const taskId = `task-${Date.now()}`;
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
          details: `created this task and assigned it to ${users.find(u => u.id === taskData.assigneeId)?.name || "unassigned"}`,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);

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
      setNotifications(prev => [newNotif, ...prev]);
    }
  }, [currentUser, users]);

  const updateTask = useCallback((id: string, updatedData: Partial<Task>) => {
    if (!currentUser) return;
    
    setTasks(prev => prev.map(t => {
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
            setNotifications(pNotif => [notif, ...pNotif]);
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
          const newAssignee = users.find(u => u.id === updatedData.assigneeId);
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
            setNotifications(pNotif => [notif, ...pNotif]);
          }
        }

        // Just basic action logging for general text or date updates
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
    }));
  }, [currentUser, users]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const duplicateTask = useCallback((id: string) => {
    const source = tasks.find(t => t.id === id);
    if (!source || !currentUser) return;
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
    setTasks(prev => [dup, ...prev]);
  }, [tasks, currentUser]);

  const addComment = useCallback((taskId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      taskId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => {
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
    }));

    // Trigger notification to assignee if it's someone else
    const targetTask = tasks.find(t => t.id === taskId);
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
      setNotifications(prev => [notif, ...prev]);
    }
  }, [currentUser, tasks]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => {
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
    }));
  }, [currentUser]);

  const toggleChecklistItem = useCallback((taskId: string, itemId: string) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => {
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
    }));
  }, [currentUser]);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!currentUser) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      isCompleted: false
    };
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...t.subtasks, newSub],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  }, [currentUser]);

  const addChecklistItem = useCallback((taskId: string, title: string) => {
    if (!currentUser) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title,
      isCompleted: false
    };
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: [...t.checklist, newItem],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  }, [currentUser]);

  const addAttachment = useCallback((taskId: string, name: string, size: string, url: string) => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name,
      size,
      url,
      uploadedAt: new Date().toISOString()
    };
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: [...t.attachments, newAtt],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  }, []);

  const removeAttachment = useCallback((taskId: string, attachmentId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: t.attachments.filter(att => att.id !== attachmentId),
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  }, []);

  const bulkUpdateTasks = useCallback((taskIds: string[], status: TaskStatus) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => {
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
    }));
  }, [currentUser]);

  // Notifications Operations
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Compute Instant Filtered Tasks with extreme performance useMemo
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
