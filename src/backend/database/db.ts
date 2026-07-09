import fs from "fs";
import path from "path";
import { 
  User, Workspace, Project, Task, Notification, UserRole,
  Organization, Sprint, AutomationRule, Document
} from "../../types";
import { MOCK_USERS } from "../../features/auth/authStore";
import { INITIAL_WORKSPACES } from "../../features/workspace/workspaceStore";
import { INITIAL_PROJECTS } from "../../features/projects/projectStore";
import { INITIAL_TASKS } from "../../features/tasks/taskStore";
import { INITIAL_NOTIFICATIONS } from "../../features/notifications/notificationStore";

const DB_FILE_PATH = path.join(process.cwd(), "tf_database.json");

const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: "org-1",
    name: "TaskFlow Global Enterprise",
    subscriptionPlan: "Enterprise"
  },
  {
    id: "org-2",
    name: "SaaS Developer Lab",
    subscriptionPlan: "Pro"
  }
];

const INITIAL_SPRINTS: Sprint[] = [
  {
    id: "spr-1",
    workspaceId: "ws-1",
    name: "Sprint 1: Core Architecture",
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-07-14T23:59:59.000Z",
    status: "active"
  },
  {
    id: "spr-2",
    workspaceId: "ws-1",
    name: "Sprint 2: SaaS Expansion & Automation",
    startDate: "2026-07-15T00:00:00.000Z",
    endDate: "2026-07-28T23:59:59.000Z",
    status: "planned"
  }
];

const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "auto-1",
    workspaceId: "ws-1",
    name: "Auto-Assign review tasks to Okechukwu",
    trigger: "STATUS_CHANGED",
    triggerValue: "REVIEW",
    action: "AUTO_ASSIGN",
    actionValue: "user-1",
    isActive: true
  },
  {
    id: "auto-2",
    workspaceId: "ws-1",
    name: "Auto-Set Priority Critical on Blockers",
    trigger: "STATUS_CHANGED",
    triggerValue: "BACKLOG",
    action: "SET_PRIORITY",
    actionValue: "CRITICAL",
    isActive: true
  }
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    title: "TaskFlow Enterprise Security Protocols",
    content: "All enterprise accounts must utilize Multi-Factor Authentication (MFA). Database access is restricted via VPC security rules and IAM roles. Audit logs are preserved for 180 days in hot storage. Users are prompted to verify credentials during sensitive settings edits.",
    authorId: "user-1",
    workspaceId: "ws-1",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z"
  },
  {
    id: "doc-2",
    title: "Sprint Planning & Kanban Workflow Guidelines",
    content: "Sprints operate on 2-week intervals. Tasks must have priority and estimated hours defined before starting work. Subtasks should be created for tracking separate development phases. Comments must summarize active progress.",
    authorId: "user-1",
    workspaceId: "ws-1",
    createdAt: "2026-07-01T11:30:00.000Z",
    updatedAt: "2026-07-01T11:30:00.000Z"
  },
  {
    id: "doc-3",
    title: "AI Integrations & Automation Rules Handbook",
    content: "TaskFlow triggers automation rules on status changes, checklist completion, or priority upgrades. Developers can configure specific webhooks. The server-side Gemini SDK is used for intelligent comments, priority suggestions, and workload analytics.",
    authorId: "user-2",
    workspaceId: "ws-1",
    createdAt: "2026-07-02T09:15:00.000Z",
    updatedAt: "2026-07-02T09:15:00.000Z"
  }
];

export interface AuthProfile {
  userId: string;
  passwordHash: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  loginAttempts: number;
  lockUntil?: string | null;
  refreshTokens: string[];
  sessions: {
    sessionId: string;
    userAgent?: string;
    ip?: string;
    lastActive: string;
  }[];
}

export interface SecurityAuditLog {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  details: string;
}

interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  notifications: Notification[];
  authProfiles: AuthProfile[];
  auditLogs: SecurityAuditLog[];
  organizations: Organization[];
  sprints: Sprint[];
  automationRules: AutomationRule[];
  documents: Document[];
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: MOCK_USERS,
      workspaces: INITIAL_WORKSPACES,
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      notifications: INITIAL_NOTIFICATIONS,
      authProfiles: [],
      auditLogs: [],
      organizations: INITIAL_ORGANIZATIONS,
      sprints: INITIAL_SPRINTS,
      automationRules: INITIAL_AUTOMATION_RULES,
      documents: INITIAL_DOCUMENTS,
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          this.data = {
            users: Array.isArray(parsed.users) ? parsed.users : MOCK_USERS,
            workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : INITIAL_WORKSPACES,
            projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_PROJECTS,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_TASKS,
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
            authProfiles: Array.isArray(parsed.authProfiles) ? parsed.authProfiles : [],
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
            organizations: Array.isArray(parsed.organizations) ? parsed.organizations : INITIAL_ORGANIZATIONS,
            sprints: Array.isArray(parsed.sprints) ? parsed.sprints : INITIAL_SPRINTS,
            automationRules: Array.isArray(parsed.automationRules) ? parsed.automationRules : INITIAL_AUTOMATION_RULES,
            documents: Array.isArray(parsed.documents) ? parsed.documents : INITIAL_DOCUMENTS,
          };
          console.log("Database successfully loaded from:", DB_FILE_PATH);
        }
      } else {
        this.save();
      }
    } catch (e) {
      console.warn("Could not load database file, using in-memory defaults:", e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not save database file, changes remain in-memory:", e);
    }
  }

  // Users CRUD
  get users() { return this.data.users; }
  set users(val: User[]) { this.data.users = val; this.save(); }

  // Workspaces CRUD
  get workspaces() { return this.data.workspaces; }
  set workspaces(val: Workspace[]) { this.data.workspaces = val; this.save(); }

  // Projects CRUD
  get projects() { return this.data.projects; }
  set projects(val: Project[]) { this.data.projects = val; this.save(); }

  // Tasks CRUD
  get tasks() { return this.data.tasks; }
  set tasks(val: Task[]) { this.data.tasks = val; this.save(); }

  // Notifications CRUD
  get notifications() { return this.data.notifications; }
  set notifications(val: Notification[]) { this.data.notifications = val; this.save(); }

  // AuthProfiles CRUD
  get authProfiles() { return this.data.authProfiles; }
  set authProfiles(val: AuthProfile[]) { this.data.authProfiles = val; this.save(); }

  // AuditLogs CRUD
  get auditLogs() { return this.data.auditLogs; }
  set auditLogs(val: SecurityAuditLog[]) { this.data.auditLogs = val; this.save(); }

  // Organizations CRUD
  get organizations() { return this.data.organizations; }
  set organizations(val: Organization[]) { this.data.organizations = val; this.save(); }

  // Sprints CRUD
  get sprints() { return this.data.sprints; }
  set sprints(val: Sprint[]) { this.data.sprints = val; this.save(); }

  // AutomationRules CRUD
  get automationRules() { return this.data.automationRules; }
  set automationRules(val: AutomationRule[]) { this.data.automationRules = val; this.save(); }

  // Documents CRUD
  get documents() { return this.data.documents; }
  set documents(val: Document[]) { this.data.documents = val; this.save(); }
}

export const db = new DatabaseManager();
