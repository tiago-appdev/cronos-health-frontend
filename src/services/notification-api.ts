import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

export interface SurveyReminder {
  id: number;
  appointmentId: number;
  doctorName: string;
  appointmentDate: string;
  actionUrl: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationPreferences {
  surveyReminders: boolean;
  appointmentReminders: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  surveyReminders: number;
  appointmentReminders: number;
  notifications24h: number;
  notifications7d: number;
}

export const notificationApi = {
  // Get user notifications
  getNotifications: async (limit = 20, offset = 0, includeRead = false): Promise<Notification[]> => {
    const response = await api.get("/notifications", {
      params: { limit, offset, include_read: includeRead }
    });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/mark-all-read");
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get survey reminders
  getSurveyReminders: async (): Promise<SurveyReminder[]> => {
    const response = await api.get("/notifications/survey-reminders");
    return response.data;
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get("/notifications/preferences");
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await api.put("/notifications/preferences", preferences);
    return response.data.preferences;
  },

  // Get notification statistics (admin only)
  getStats: async (): Promise<NotificationStats> => {
    const response = await api.get("/notifications/stats");
    return response.data;
  },
  // Create notification (admin only)
  createNotification: async (notification: {
    userId: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    priority?: string;
    expiresAt?: string;
  }): Promise<Notification> => {
    const response = await api.post("/notifications", notification);
    return response.data.notification;
  },
};
