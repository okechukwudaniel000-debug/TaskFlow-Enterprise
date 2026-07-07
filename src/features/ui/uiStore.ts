import { create } from "zustand";
import { TaskPriority, TaskStatus } from "../../types";

interface UIState {
  searchQuery: string;
  filterPriority: TaskPriority | "ALL";
  filterStatus: TaskStatus | "ALL";
  filterAssignee: string | "ALL";
  filterProject: string | "ALL";
  sortBy: "newest" | "oldest" | "priority" | "dueDate" | "alphabetical";
  theme: "dark" | "light" | "system";
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: TaskPriority | "ALL") => void;
  setFilterStatus: (status: TaskStatus | "ALL") => void;
  setFilterAssignee: (assignee: string | "ALL") => void;
  setFilterProject: (project: string | "ALL") => void;
  setSortBy: (sort: "newest" | "oldest" | "priority" | "dueDate" | "alphabetical") => void;
  setThemePreference: (themePref: "dark" | "light" | "system") => void;
}

export const useUIStore = create<UIState>((set) => {
  let initialTheme: "dark" | "light" | "system" = "dark";
  try {
    const saved = localStorage.getItem("tf_theme") as "dark" | "light" | "system";
    if (saved) initialTheme = saved;
  } catch (e) {
    console.warn("localStorage read blocked in uiStore:", e);
  }

  // Helper to apply theme to document
  const applyThemeToDOM = (t: "dark" | "light" | "system") => {
    try {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      if (t === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    } catch (e) {
      console.warn("Could not apply theme to DOM:", e);
    }
  };

  // Run initial theme application
  applyThemeToDOM(initialTheme);

  return {
    searchQuery: "",
    filterPriority: "ALL",
    filterStatus: "ALL",
    filterAssignee: "ALL",
    filterProject: "ALL",
    sortBy: "newest",
    theme: initialTheme,
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterPriority: (priority) => set({ filterPriority: priority }),
    setFilterStatus: (status) => set({ filterStatus: status }),
    setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
    setFilterProject: (project) => set({ filterProject: project }),
    setSortBy: (sort) => set({ sortBy: sort }),
    setThemePreference: (themePref) => {
      set({ theme: themePref });
      applyThemeToDOM(themePref);
      try {
        localStorage.setItem("tf_theme", themePref);
      } catch (e) {
        console.warn("localStorage sync blocked in uiStore:", e);
      }
    }
  };
});
