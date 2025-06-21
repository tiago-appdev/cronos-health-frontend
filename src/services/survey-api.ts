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

export interface SurveySubmission {
  appointmentId?: number;
  appointmentEaseRating: number;
  punctualityRating: number;
  medicalStaffRating: number;
  platformRating: number;
  wouldRecommend: "yes" | "no" | "maybe";
  additionalComments?: string;
}

export interface Survey {
  id: number;
  patient_id: number;
  appointment_id?: number;
  appointment_ease_rating: number;
  punctuality_rating: number;
  medical_staff_rating: number;
  platform_rating: number;
  would_recommend: "yes" | "no" | "maybe";
  additional_comments?: string;
  created_at: string;
  // Joined fields
  doctor_name?: string;
  doctor_specialty?: string;
  appointment_date?: string;
  patient_name?: string;
}

export interface SurveyStats {
  totalSurveys: number;
  averageRatings: {
    appointmentEase: string;
    punctuality: string;
    medicalStaff: string;
    platform: string;
  };
  recommendations: {
    yes: number;
    no: number;
    maybe: number;
  };
}

export const surveyApi = {
  // Submit a new survey (patients only)
  submitSurvey: async (surveyData: SurveySubmission): Promise<Survey> => {
    const response = await api.post("/surveys", surveyData);
    return response.data.survey;
  },

  // Get surveys submitted by current patient
  getMySurveys: async (): Promise<Survey[]> => {
    const response = await api.get("/surveys/my-surveys");
    return response.data;
  },

  // Get all surveys (admin only)
  getAllSurveys: async (limit = 50, offset = 0): Promise<Survey[]> => {
    const response = await api.get(`/surveys?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get survey statistics (admin only)
  getSurveyStats: async (): Promise<SurveyStats> => {
    const response = await api.get("/surveys/stats");
    return response.data;
  },
};