import { create } from "zustand";
import { User, UserRole } from "../../types";

const safeLocalStorage = typeof window !== "undefined" && typeof localStorage !== "undefined" ? localStorage : {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {}
};

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

export interface Session {
  sessionId: string;
  userAgent?: string;
  ip?: string;
  lastActive: string;
}

export interface SecurityLog {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  details: string;
}

interface AuthState {
  currentUser: User | null;
  users: User[];
  accessToken: string | null;
  isCheckingSession: boolean;
  sessions: Session[];
  securityLogs: SecurityLog[];
  
  registerUser: (email: string, name: string, password: string) => Promise<boolean>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (tokenOrPassword: string, passwordNew?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  getSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  getSecurityLogs: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers || {});
  
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    const refreshToken = safeLocalStorage.getItem("tf_refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshRes.ok) {
          const bodyJson = await refreshRes.json();
          if (bodyJson.success && bodyJson.data) {
            useAuthStore.setState({ accessToken: bodyJson.data.accessToken });
            safeLocalStorage.setItem("tf_refresh_token", bodyJson.data.refreshToken);
            
            // Retry the original fetch
            headers.set("Authorization", `Bearer ${bodyJson.data.accessToken}`);
            return await fetch(url, { ...options, headers });
          }
        }
      } catch (e) {
        console.error("Silent authentication refresh failed:", e);
      }
    }
    
    // Invalidate session on failure
    useAuthStore.getState().logout();
  }

  return response;
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Try to load initial user profile from localStorage as fallback
  let initialCurrentUser: User | null = null;
  let initialUsers: User[] = MOCK_USERS;

  try {
    const savedUser = safeLocalStorage.getItem("tf_current_user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      initialCurrentUser = JSON.parse(savedUser);
    }
    const savedUsers = safeLocalStorage.getItem("tf_users");
    if (savedUsers && savedUsers !== "undefined" && savedUsers !== "null") {
      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed)) initialUsers = parsed;
    }
  } catch (e) {
    console.warn("safeLocalStorage read blocked in authStore initialization:", e);
  }

  return {
    currentUser: initialCurrentUser,
    users: initialUsers,
    accessToken: null,
    isCheckingSession: true,
    sessions: [],
    securityLogs: [],

    registerUser: async (email: string, name: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password })
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Registration failed.");
        }

        const { user, accessToken, refreshToken } = bodyJson.data;
        set({ currentUser: user, accessToken });
        safeLocalStorage.setItem("tf_refresh_token", refreshToken);
        safeLocalStorage.setItem("tf_current_user", JSON.stringify(user));

        // Sync local user list cache
        const { users } = get();
        if (!users.some(u => u.id === user.id)) {
          const updated = [...users, user];
          set({ users: updated });
          safeLocalStorage.setItem("tf_users", JSON.stringify(updated));
        }

        return true;
      } catch (err: any) {
        console.error("register error:", err);
        throw err;
      }
    },

    login: async (email: string, password?: string): Promise<boolean> => {
      try {
        const pass = password || "Password123!"; // Autorecovering fallback password for mock logins
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass })
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Authentication failed.");
        }

        const { user, accessToken, refreshToken } = bodyJson.data;
        set({ currentUser: user, accessToken });
        safeLocalStorage.setItem("tf_refresh_token", refreshToken);
        safeLocalStorage.setItem("tf_current_user", JSON.stringify(user));

        return true;
      } catch (err: any) {
        console.error("login error:", err);
        throw err;
      }
    },

    logout: async () => {
      const refreshToken = safeLocalStorage.getItem("tf_refresh_token");
      if (refreshToken && get().accessToken) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${get().accessToken}`
            },
            body: JSON.stringify({ refreshToken })
          });
        } catch (e) {
          console.warn("Logout request failed:", e);
        }
      }

      set({ currentUser: null, accessToken: null, sessions: [], securityLogs: [] });
      safeLocalStorage.removeItem("tf_refresh_token");
      safeLocalStorage.removeItem("tf_current_user");
    },

    updateProfile: async (updatedData: Partial<User>) => {
      const { currentUser } = get();
      if (!currentUser) return;

      try {
        const response = await apiFetch("/api/auth/profile", {
          method: "PUT",
          body: JSON.stringify(updatedData)
        });

        const bodyJson = await response.json();
        if (response.ok && bodyJson.success) {
          const updated = bodyJson.data;
          set({ currentUser: updated });
          localStorage.setItem("tf_current_user", JSON.stringify(updated));
        }
      } catch (e) {
        console.error("Failed to update profile on backend:", e);
        // Fallback to local update
        const updated = { ...currentUser, ...updatedData };
        set({ currentUser: updated });
        localStorage.setItem("tf_current_user", JSON.stringify(updated));
      }
    },

    forgotPassword: async (email: string): Promise<string> => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Password recovery request failed.");
        }

        return bodyJson.data?.resetToken || "";
      } catch (err: any) {
        console.error("forgotPassword error:", err);
        throw err;
      }
    },

    resetPassword: async (tokenOrPassword: string, passwordNew?: string): Promise<void> => {
      try {
        // Handle both signatures
        let token = tokenOrPassword;
        let password = passwordNew;

        if (!password) {
          // Backward compatibility: treat tokenOrPassword as new password, verify using a test token or throw
          token = "demo-direct-reset-token";
          password = tokenOrPassword;
        }

        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password })
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Password reset failed.");
        }
      } catch (err: any) {
        console.error("resetPassword error:", err);
        throw err;
      }
    },

    verifyEmail: async (token: string): Promise<void> => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Email verification failed.");
        }
      } catch (err: any) {
        console.error("verifyEmail error:", err);
        throw err;
      }
    },

    getSessions: async () => {
      try {
        const response = await apiFetch("/api/auth/sessions");
        const bodyJson = await response.json();
        if (response.ok && bodyJson.success) {
          set({ sessions: bodyJson.data });
        }
      } catch (e) {
        console.error("getSessions error:", e);
      }
    },

    revokeSession: async (sessionId: string) => {
      try {
        const response = await apiFetch(`/api/auth/sessions/${sessionId}`, {
          method: "DELETE"
        });

        const bodyJson = await response.json();
        if (!response.ok || !bodyJson.success) {
          throw new Error(bodyJson.message || "Failed to revoke session.");
        }

        // Remove from local list
        const { sessions } = get();
        set({ sessions: sessions.filter(s => s.sessionId !== sessionId) });
      } catch (err: any) {
        console.error("revokeSession error:", err);
        throw err;
      }
    },

    getSecurityLogs: async () => {
      try {
        const response = await apiFetch("/api/auth/audit-logs");
        const bodyJson = await response.json();
        if (response.ok && bodyJson.success) {
          set({ securityLogs: bodyJson.data });
        }
      } catch (e) {
        console.error("getSecurityLogs error:", e);
      }
    },

    initializeAuth: async () => {
      set({ isCheckingSession: true });
      const refreshToken = safeLocalStorage.getItem("tf_refresh_token");

      if (refreshToken) {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
          });

          const bodyJson = await response.json();
          if (response.ok && bodyJson.success && bodyJson.data) {
            const { accessToken, refreshToken: newRefreshToken } = bodyJson.data;
            set({ accessToken });
            safeLocalStorage.setItem("tf_refresh_token", newRefreshToken);

            // Fetch me profile details with newly acquired access token
            const profileRes = await fetch("/api/auth/me", {
              headers: { "Authorization": `Bearer ${accessToken}` }
            });
            const profileJson = await profileRes.json();
            if (profileRes.ok && profileJson.success && profileJson.data) {
              set({ currentUser: profileJson.data });
              safeLocalStorage.setItem("tf_current_user", JSON.stringify(profileJson.data));
            }
          } else {
            // Clean up invalid session on failure
            set({ currentUser: null, accessToken: null });
            safeLocalStorage.removeItem("tf_refresh_token");
            safeLocalStorage.removeItem("tf_current_user");
          }
        } catch (e) {
          console.warn("Silent session restore error:", e);
        }
      }
      set({ isCheckingSession: false });
    }
  };
});
