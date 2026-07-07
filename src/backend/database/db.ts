import fs from "fs";
import path from "path";
import { User, Workspace, Project, Task, Notification, UserRole } from "../../types";
import { MOCK_USERS } from "../../features/auth/authStore";
import { INITIAL_WORKSPACES } from "../../features/workspace/workspaceStore";
import { INITIAL_PROJECTS } from "../../features/projects/projectStore";
import { INITIAL_TASKS } from "../../features/tasks/taskStore";
import { INITIAL_NOTIFICATIONS } from "../../features/notifications/notificationStore";

const DB_FILE_PATH = path.join(process.cwd(), "tf_database.json");

interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  notifications: Notification[];
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
}

export const db = new DatabaseManager();
