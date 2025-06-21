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

export const medicalRecordsApi = {
  // Get patient records
  getPatientRecords: async (patientId: string) => {
    const response = await api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  },

  // Create medical record
  createRecord: async (data: {
    patientId: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
  }) => {
    const response = await api.post("/medical-records", data);
    return response.data;
  },

  // Add prescription
  addPrescription: async (
    recordId: string,
    data: {
      medication: string;
      dosage: string;
      frequency: string;
      duration?: string;
    }
  ) => {
    const response = await api.post(
      `/medical-records/${recordId}/prescriptions`,
      data
    );
    return response.data;
  },

  // Add medical test
  addTest: async (
    recordId: string,
    data: {
      testName: string;
      testDate?: string;
      results?: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(`/medical-records/${recordId}/tests`, data);
    return response.data;
  },

  // Add patient note
  addNote: async (data: { patientId: string; note: string }) => {
    const response = await api.post("/medical-records/notes", data);
    return response.data;
  },

  // Get patient notes
  getPatientNotes: async (patientId: string) => {
    const response = await api.get(`/medical-records/notes/${patientId}`);
    return response.data;
  },
};

export const appointmentsApi = {
  // Get all appointments
  getAppointments: async () => {
    const response = await api.get("/appointments");
    return response.data;
  },

  // Get available doctors
  getDoctors: async () => {
    const response = await api.get("/appointments/doctors");
    return response.data;
  },

  // Create appointment
  createAppointment: async (data: {
    doctorId: string;
    appointmentDate: string;
  }) => {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (
    id: string,
    data: {
      appointmentDate?: string;
      status?: "scheduled" | "completed" | "canceled";
    }
  ) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

export const authApi = {
  // Login
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Register
  register: async (data: {
    name: string;
    email: string;
    password: string;
    userType: "patient" | "doctor";
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/user");
    return response.data;
  },
};

export const messagesApi = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get("/messages/conversations");
    return response.data;
  },

  // Get messages for a specific conversation
  getConversationMessages: async (conversationId: string, limit = 50, offset = 0) => {
    const response = await api.get(`/messages/conversations/${conversationId}`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Send a message
  sendMessage: async (data: {
    conversationId: string;
    text: string;
    messageType?: string;
    replyToMessageId?: string;
  }) => {
    const response = await api.post("/messages", data);
    return response.data;
  },

  // Create or get conversation with another user
  createOrGetConversation: async (otherUserId: string) => {
    const response = await api.post("/messages/conversations", { otherUserId });
    return response.data;
  },

  // Search for users
  searchUsers: async (searchTerm: string, userType?: string) => {
    const response = await api.get("/messages/users/search", {
      params: { q: searchTerm, type: userType }
    });
    return response.data;
  },

  // Get related users (doctors/patients with appointments)
  getRelatedUsers: async () => {
    const response = await api.get("/messages/users/related");
    return response.data;
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string, conversationId?: string) => {
    const response = await api.put(`/messages/${messageId}/read`, { conversationId });
    return response.data;
  },

  // Edit a message
  editMessage: async (messageId: string, text: string) => {
    const response = await api.put(`/messages/${messageId}`, { text });
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get("/messages/unread-count");
    return response.data;
  },

  // Check for new messages
  checkNewMessages: async (lastCheckTime: string) => {
    const response = await api.get("/messages/check-new", {
      params: { lastCheck: lastCheckTime }
    });
    return response.data;
  },
};

export const medicalStaffApi = {
  // Get all medical staff
  getMedicalStaff: async () => {
    const response = await api.get("/medical-staff");
    return response.data;
  },
  // Get medical staff by ID
  getMedicalStaffById: async (id: string) => {
    const response = await api.get(`/medical-staff/${id}`);
    return response.data;
  },
};