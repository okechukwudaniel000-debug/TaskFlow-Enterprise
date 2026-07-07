import { create } from "zustand";
import { Workspace, UserRole } from "../../types";
import { useAuthStore } from "../auth/authStore";

export const INITIAL_WORKSPACES: Workspace[] = [
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

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceById: (id: string) => void;
  createWorkspace: (name: string, description: string) => void;
  editWorkspace: (id: string, name: string, description: string) => void;
  deleteWorkspace: (id: string) => void;
  inviteWorkspaceMember: (workspaceId: string, email: string, role: UserRole) => void;
  removeWorkspaceMember: (workspaceId: string, userId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  let initialWorkspaces = INITIAL_WORKSPACES;

  try {
    const saved = localStorage.getItem("tf_workspaces");
    if (saved && saved !== "undefined" && saved !== "null") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) initialWorkspaces = parsed;
    }
  } catch (e) {
    console.warn("localStorage read blocked in workspaceStore:", e);
  }

  // Set default active workspace on load (first one)
  const defaultWorkspace = initialWorkspaces.length > 0 ? initialWorkspaces[0] : null;

  return {
    workspaces: initialWorkspaces,
    currentWorkspace: defaultWorkspace,
    setCurrentWorkspaceById: (id: string) => {
      const { workspaces } = get();
      const found = workspaces.find(w => w.id === id);
      if (found) {
        set({ currentWorkspace: found });
      }
    },
    createWorkspace: (name: string, description: string) => {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;
      const { workspaces } = get();
      const newWs: Workspace = {
        id: `ws-${Date.now()}`,
        name,
        description,
        ownerId: currentUser.id,
        members: [{ userId: currentUser.id, role: UserRole.ADMIN }]
      };
      const updated = [...workspaces, newWs];
      set({ workspaces: updated, currentWorkspace: newWs });
      try {
        localStorage.setItem("tf_workspaces", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    editWorkspace: (id: string, name: string, description: string) => {
      const { workspaces, currentWorkspace } = get();
      const updated = workspaces.map(w => w.id === id ? { ...w, name, description } : w);
      set({ workspaces: updated });
      if (currentWorkspace?.id === id) {
        set({ currentWorkspace: { ...currentWorkspace, name, description } });
      }
      try {
        localStorage.setItem("tf_workspaces", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    deleteWorkspace: (id: string) => {
      const { workspaces, currentWorkspace } = get();
      const updated = workspaces.filter(w => w.id !== id);
      set({ workspaces: updated });
      if (currentWorkspace?.id === id) {
        set({ currentWorkspace: updated.length > 0 ? updated[0] : null });
      }
      try {
        localStorage.setItem("tf_workspaces", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    inviteWorkspaceMember: (workspaceId: string, email: string, role: UserRole) => {
      const { workspaces, currentWorkspace } = get();
      const authState = useAuthStore.getState();
      let existingUser = authState.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!existingUser) {
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
        const updatedUsers = [...authState.users, existingUser];
        useAuthStore.setState({ users: updatedUsers });
        try {
          localStorage.setItem("tf_users", JSON.stringify(updatedUsers));
        } catch (e) {
          console.warn("localStorage sync blocked:", e);
        }
      }

      const invitedUserId = existingUser.id;
      const updatedWorkspaces = workspaces.map(w => {
        if (w.id === workspaceId) {
          const isAlreadyMember = w.members.some(m => m.userId === invitedUserId);
          if (isAlreadyMember) return w;
          return {
            ...w,
            members: [...w.members, { userId: invitedUserId, role }]
          };
        }
        return w;
      });

      set({ workspaces: updatedWorkspaces });

      if (currentWorkspace?.id === workspaceId) {
        const isAlreadyMember = currentWorkspace.members.some(m => m.userId === invitedUserId);
        if (!isAlreadyMember) {
          set({
            currentWorkspace: {
              ...currentWorkspace,
              members: [...currentWorkspace.members, { userId: invitedUserId, role }]
            }
          });
        }
      }

      try {
        localStorage.setItem("tf_workspaces", JSON.stringify(updatedWorkspaces));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    removeWorkspaceMember: (workspaceId: string, userId: string) => {
      const { workspaces, currentWorkspace } = get();
      const updatedWorkspaces = workspaces.map(w => {
        if (w.id === workspaceId) {
          return {
            ...w,
            members: w.members.filter(m => m.userId !== userId)
          };
        }
        return w;
      });

      set({ workspaces: updatedWorkspaces });

      if (currentWorkspace?.id === workspaceId) {
        set({
          currentWorkspace: {
            ...currentWorkspace,
            members: currentWorkspace.members.filter(m => m.userId !== userId)
          }
        });
      }

      try {
        localStorage.setItem("tf_workspaces", JSON.stringify(updatedWorkspaces));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    }
  };
});
