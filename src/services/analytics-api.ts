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

export interface SystemStats {
  totalPatients: number;
  totalDoctors: number;
  monthlyAppointments: number;
  attendanceRate: number;
  upcomingAppointments: number;
  totalSurveys: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

export interface AppointmentDistribution {
  specialty: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  monthName: string;
  total: number;
  completed: number;
  canceled: number;
}

export interface DoctorMetric {
  doctorName: string;
  specialty: string;
  totalAppointments: number;
  completedAppointments: number;
  completionRate: number;
  averageRating: string;
}

export interface PatientMetrics {
  totalActivePatients: number;
  patientsWithAppointments: number;
  patientsWithSurveys: number;
  surveyResponseRate: number;
}

export const analyticsApi = {
  // Get overall system statistics
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await api.get("/analytics/stats");
    return response.data;
  },

  // Get recent system activity
  getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
    const response = await api.get(`/analytics/recent-activity?limit=${limit}`);
    return response.data;
  },

  // Get appointment distribution by specialty
  getAppointmentDistribution: async (): Promise<AppointmentDistribution[]> => {
    const response = await api.get("/analytics/appointment-distribution");
    return response.data;
  },

  // Get monthly appointment trends
  getMonthlyTrends: async (months = 6): Promise<MonthlyTrend[]> => {
    const response = await api.get(`/analytics/monthly-trends?months=${months}`);
    return response.data;
  },

  // Get doctor performance metrics
  getDoctorMetrics: async (): Promise<DoctorMetric[]> => {
    const response = await api.get("/analytics/doctor-metrics");
    return response.data;
  },

  // Get patient engagement metrics
  getPatientMetrics: async (): Promise<PatientMetrics> => {
    const response = await api.get("/analytics/patient-metrics");
    return response.data;
  },
};