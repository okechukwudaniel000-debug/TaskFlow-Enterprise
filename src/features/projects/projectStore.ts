import { create } from "zustand";
import { Project } from "../../types";
import { useWorkspaceStore } from "../workspace/workspaceStore";
import { useTaskStore } from "../tasks/taskStore";
import { useAuthStore } from "../auth/authStore";

export const INITIAL_PROJECTS: Project[] = [
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
    createdAt: "2026-05-15T09:00:00Z",
    ownerId: "user-1"
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
    createdAt: "2026-06-01T10:00:00Z",
    ownerId: "user-1"
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
    createdAt: "2026-06-10T14:30:00Z",
    ownerId: "user-1"
  }
];

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProjectById: (id: string | null) => void;
  createProject: (name: string, description: string, color: string, icon: string, template: string) => void;
  editProject: (id: string, updatedData: Partial<Project>) => void;
  archiveProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  toggleFavoriteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => {
  let initialProjects = INITIAL_PROJECTS;

  try {
    const saved = localStorage.getItem("tf_projects");
    if (saved && saved !== "undefined" && saved !== "null") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) initialProjects = parsed;
    }
  } catch (e) {
    console.warn("localStorage read blocked in projectStore:", e);
  }

  return {
    projects: initialProjects,
    currentProject: null,
    setCurrentProjectById: (id: string | null) => {
      if (id === null) {
        set({ currentProject: null });
      } else {
        const { projects } = get();
        const found = projects.find(p => p.id === id);
        if (found) set({ currentProject: found });
      }
    },
    createProject: (name: string, description: string, color: string, icon: string, template: string) => {
      const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
      if (!currentWorkspace) return;
      const currentUser = useAuthStore.getState().currentUser;
      const { projects } = get();
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
        createdAt: new Date().toISOString(),
        ownerId: currentUser?.id || "user-1"
      };
      const updated = [...projects, newProj];
      set({ projects: updated });
      try {
        localStorage.setItem("tf_projects", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    editProject: (id: string, updatedData: Partial<Project>) => {
      const { projects, currentProject } = get();
      const updated = projects.map(p => p.id === id ? { ...p, ...updatedData } : p);
      set({ projects: updated });
      if (currentProject?.id === id) {
        set({ currentProject: { ...currentProject, ...updatedData } });
      }
      try {
        localStorage.setItem("tf_projects", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    archiveProject: (id: string) => {
      const { projects, currentProject } = get();
      const updated = projects.map(p => p.id === id ? { ...p, isArchived: true } : p);
      set({ projects: updated });
      if (currentProject?.id === id) {
        set({ currentProject: { ...currentProject, isArchived: true } });
      }
      try {
        localStorage.setItem("tf_projects", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    duplicateProject: (id: string) => {
      const { projects } = get();
      const source = projects.find(p => p.id === id);
      if (!source) return;
      const duplicate: Project = {
        ...source,
        id: `proj-${Date.now()}`,
        name: `${source.name} (Copy)`,
        isFavorite: false,
        createdAt: new Date().toISOString()
      };
      const updated = [...projects, duplicate];
      set({ projects: updated });
      try {
        localStorage.setItem("tf_projects", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }

      // Trigger duplication of associated tasks in the taskStore
      useTaskStore.getState().duplicateProjectTasks(id, duplicate.id);
    },
    toggleFavoriteProject: (id: string) => {
      const { projects, currentProject } = get();
      const updated = projects.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
      set({ projects: updated });
      if (currentProject?.id === id) {
        set({ currentProject: { ...currentProject, isFavorite: !currentProject.isFavorite } });
      }
      try {
        localStorage.setItem("tf_projects", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    }
  };
});
