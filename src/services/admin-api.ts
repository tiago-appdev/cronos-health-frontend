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

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: "patient" | "doctor" | "admin";
  created_at: string;
  updated_at: string;
  profile?: PatientProfile | DoctorProfile;
}

export interface PatientProfile {
  id: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface DoctorProfile {
  id: string;
  specialty?: string;
  license_number?: string;
  phone?: string;
  work_schedule?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export const adminApi = {
  // Get all users with their profiles
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  // Get specific user with profile
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user and their profile
  updateUser: async (
    id: string,
    userData?: UserUpdateData,
    profileData?: Partial<PatientProfile | DoctorProfile>
  ): Promise<{ user: User; profile?: PatientProfile | DoctorProfile }> => {
    const response = await api.put(`/admin/users/${id}`, {
      userData,
      profileData,
    });
    return response.data;
  },

  // Delete user and their profile
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Create patient profile for existing user
  createPatientProfile: async (
    id: string,
    profileData: Partial<PatientProfile>
  ): Promise<PatientProfile> => {
    const response = await api.post(`/admin/users/${id}/patient-profile`, profileData);
    return response.data;
  },

  // Create doctor profile for existing user
  createDoctorProfile: async (
    id: string,
    profileData: Partial<DoctorProfile>
  ): Promise<DoctorProfile> => {
    const response = await api.post(`/admin/users/${id}/doctor-profile`, profileData);
    return response.data;
  },
};