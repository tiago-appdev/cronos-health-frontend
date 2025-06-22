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

  // Get detailed medical records (includes doctor info for prescriptions and tests)
  getDetailedRecords: async (patientId: number) => {
    const patientIdStr = patientId.toString();
    const response = await api.get(`/medical-records/patient/${patientIdStr}`);
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

export const patientHistoryApi = {
  // Get patient medical history summary
  getSummary: async () => {
    const response = await api.get("/medical-history/summary");
    return response.data;
  },

  // Get patient consultations
  getConsultations: async () => {
    const response = await api.get("/medical-history/consultations");
    return response.data;
  },

  // Get patient prescriptions
  getPrescriptions: async () => {
    const response = await api.get("/medical-history/prescriptions");
    return response.data;
  },

  // Get patient tests
  getTests: async () => {
    const response = await api.get("/medical-history/tests");
    return response.data;
  },

  // Get patient notes
  getNotes: async () => {
    const response = await api.get("/medical-history/notes");
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

// Profile API
export const profileApi = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get("/profile/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await api.put("/profile/me", data);
    return response.data;
  },
};

// Admin API to get doctor information
export const adminApi = {
  // Get user by ID (includes doctor profile)
  getUserById: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Get all users (includes doctors)
  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
};
