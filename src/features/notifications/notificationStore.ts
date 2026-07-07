import { create } from "zustand";
import { Notification } from "../../types";

const safeLocalStorage = typeof window !== "undefined" && typeof localStorage !== "undefined" ? localStorage : {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {}
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    userId: "user-1",
    title: "Task Assigned",
    description: "Sarah Connor assigned task 'Upgrade Database Drivers' to you.",
    isRead: false,
    type: "assignment",
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    id: "not-2",
    userId: "user-1",
    title: "Comment Mention",
    description: "John Doe mentioned you in 'Apollo Platform v2.0' design doc comments.",
    isRead: false,
    type: "mention",
    createdAt: "2026-07-02T11:15:00Z"
  }
];

interface NotificationState {
  notifications: Notification[];
  addNotification: (notif: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let initialNotifications = INITIAL_NOTIFICATIONS;

  try {
    const saved = safeLocalStorage.getItem("tf_notifications");
    if (saved && saved !== "undefined" && saved !== "null") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) initialNotifications = parsed;
    }
  } catch (e) {
    console.warn("safeLocalStorage read blocked in notificationStore:", e);
  }

  return {
    notifications: initialNotifications,
    addNotification: (notif: Notification) => {
      const { notifications } = get();
      const updated = [notif, ...notifications];
      set({ notifications: updated });
      try {
        safeLocalStorage.setItem("tf_notifications", JSON.stringify(updated));
      } catch (e) {
        console.warn("safeLocalStorage sync blocked:", e);
      }
    },
    markNotificationAsRead: (id: string) => {
      const { notifications } = get();
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      set({ notifications: updated });
      try {
        safeLocalStorage.setItem("tf_notifications", JSON.stringify(updated));
      } catch (e) {
        console.warn("safeLocalStorage sync blocked:", e);
      }
    },
    markAllNotificationsAsRead: () => {
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated });
      try {
        safeLocalStorage.setItem("tf_notifications", JSON.stringify(updated));
      } catch (e) {
        console.warn("safeLocalStorage sync blocked:", e);
      }
    },
    clearNotification: (id: string) => {
      const { notifications } = get();
      const updated = notifications.filter(n => n.id !== id);
      set({ notifications: updated });
      try {
        safeLocalStorage.setItem("tf_notifications", JSON.stringify(updated));
      } catch (e) {
        console.warn("safeLocalStorage sync blocked:", e);
      }
    }
  };
});
