import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/users/refresh`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Types from OpenAPI spec
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface SkillResponse {
  skill_id: number;
  skill_name: string;
}

export interface UserResponse {
  full_name: string;
  email: string;
  job_title: string;
  user_id: number;
  skills: SkillResponse[];
}

export interface UserCreate {
  full_name: string;
  email: string;
  job_title: string;
  password: string;
  skill_ids?: number[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface JobPositionResponse {
  position_id: number;
  job_title: string;
  created_at: string;
  updated_at: string;
  required_skills: SkillResponse[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  size: number;
  pages: number;
  items: T[];
}

// Job Recommendation Types
interface SkillInfo {
  skill_id: number;
  skill_name: string;
}

interface JobSkills {
  matching: SkillInfo[];
  recommended: SkillInfo[];
}

interface JobRecommendation {
  position_id: number;
  job_title: string;
  log_likelihood: number;
  similarity_score?: number;
  skills: JobSkills;
}

interface JobScore {
  job_id: number;
  title: string;
  skills: string[];
  lls_score: number;
  cosine_score?: number;
  algorithm?: string;
}

export interface TopRecommendationResponse {
  algorithm: string;
  description: string;
  job: JobRecommendation;
  all_job_scores: JobScore[];
  user_skills: string[];
  total_jobs_analyzed: number;
  recommendation_date: string;
}

// Auth API
export const authApi = {
  register: async (data: UserCreate) => {
    const response = await api.post<UserResponse>('/users/register', data);
    return response.data;
  },

  login: async (data: UserLogin) => {
    const response = await api.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>('/users/login', data);
    
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  },
};

// Skills API
export const skillsApi = {
  getSkills: async (page = 1, size = 10, search?: string) => {
    const response = await api.get<PaginatedResponse<SkillResponse>>('/skills/', {
      params: { page, size, ...(search ? { search } : {}) },
    });
    return response.data;
  },

  createSkill: async (skill_name: string) => {
    const response = await api.post<SkillResponse>('/skills/', undefined, {
      params: { skill_name },
    });
    return response.data;
  },

  addUserSkill: async (skill_id: number) => {
    const response = await api.post(`/skills/user/${skill_id}`);
    return response.data;
  },

  removeUserSkill: async (skill_id: number) => {
    const response = await api.delete(`/skills/user/${skill_id}`);
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  getJobs: async (page = 1, size = 10) => {
    const response = await api.get<PaginatedResponse<JobPositionResponse>>('/jobs/', {
      params: { page, size },
    });
    return response.data;
  },

  createJob: async (job_title: string, skill_ids: number[]) => {
    const response = await api.post<JobPositionResponse>('/jobs/', skill_ids, {
      params: { job_title },
    });
    return response.data;
  },

  getJobRecommendations: async () => {
    const response = await api.get<JobPositionResponse[]>('/jobs/recommendations');
    return response.data;
  },

  getTopRecommendation: async () => {
    const response = await api.get<TopRecommendationResponse>('/jobs/top-recommendation');
    return response.data;
  },

  getLLRRecommendation: async () => {
    const response = await api.get<TopRecommendationResponse>('/jobs/llr-recommendation');
    return response.data;
  },

  getCosineRecommendation: async () => {
    const response = await api.get<TopRecommendationResponse>('/jobs/cosine-recommendation');
    return response.data;
  },
};

export default api; 