import { create } from "zustand";
import { User, UserRole } from "../../types";

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

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let initialCurrentUser: User | null = MOCK_USERS[0];
  let initialUsers: User[] = MOCK_USERS;

  try {
    const savedUser = localStorage.getItem("tf_current_user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      initialCurrentUser = JSON.parse(savedUser) || MOCK_USERS[0];
    }
    const savedUsers = localStorage.getItem("tf_users");
    if (savedUsers && savedUsers !== "undefined" && savedUsers !== "null") {
      const parsed = JSON.parse(savedUsers);
      if (Array.isArray(parsed)) initialUsers = parsed;
    }
  } catch (e) {
    console.warn("localStorage read blocked in authStore:", e);
  }

  return {
    currentUser: initialCurrentUser,
    users: initialUsers,
    login: async (email: string) => {
      const { users } = get();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        set({ currentUser: foundUser });
        try {
          localStorage.setItem("tf_current_user", JSON.stringify(foundUser));
        } catch (e) {
          console.warn("localStorage sync blocked:", e);
        }
        return true;
      } else {
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
        const updatedUsers = [...users, newUser];
        set({ users: updatedUsers, currentUser: newUser });
        try {
          localStorage.setItem("tf_users", JSON.stringify(updatedUsers));
          localStorage.setItem("tf_current_user", JSON.stringify(newUser));
        } catch (e) {
          console.warn("localStorage sync blocked:", e);
        }
        return true;
      }
    },
    logout: () => {
      set({ currentUser: null });
      try {
        localStorage.setItem("tf_current_user", "null");
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    updateProfile: (updatedData: Partial<User>) => {
      const { currentUser, users } = get();
      if (!currentUser) return;
      const updated = { ...currentUser, ...updatedData };
      const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
      set({ currentUser: updated, users: updatedUsers });
      try {
        localStorage.setItem("tf_current_user", JSON.stringify(updated));
        localStorage.setItem("tf_users", JSON.stringify(updatedUsers));
      } catch (e) {
        console.warn("localStorage sync blocked:", e);
      }
    },
    forgotPassword: async (email: string) => {
      console.log("Forgot password requested for: ", email);
    },
    resetPassword: async (password: string) => {
      console.log("Reset password to: ", password);
    }
  };
});
