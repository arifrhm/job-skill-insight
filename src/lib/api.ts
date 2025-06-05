// Debug environment variables
console.log("All env variables:", import.meta.env)
console.log("VITE_BASE_URL:", import.meta.env.VITE_BASE_URL)

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'

console.log("Final BASE_URL:", BASE_URL)

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  username: string
  email: string
  password: string
  job_title: string
  skills: string[]
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
  }
}

interface RegisterResponse {
  user_id: number
  username: string
  email: string
  job_title: string
  skills: string[]
}

interface SkillRecommendationRequest {
  job_title: string
  current_skills: string[]
}

interface Skill {
  skill_id: number
  skill_name: string
}

interface Position {
  position_id: number
  job_title: string
  job_detail_link: string
  skills: Skill[]
}

export const fetchApi = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`
  console.log("Making request to:", url)
  console.log("Request options:", options)
  
  // Get access token from localStorage
  const accessToken = localStorage.getItem('access_token')
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Example API functions
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),
}

// Auth API functions
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/api/v1/auth/login', credentials),
  
  register: (credentials: RegisterCredentials) =>
    api.post<RegisterResponse>('/api/v1/auth/register', credentials),
  
  logout: () => api.post<void>('/api/v1/auth/logout', {}),
  
  refreshToken: (refreshToken: string) =>
    api.post<{ access_token: string }>('/api/v1/auth/refresh', { refresh_token: refreshToken }),
}

// Skills API functions
export const skillsApi = {
  recommendSkills: (request: SkillRecommendationRequest) =>
    api.post<Position[]>('/api/v1/recommend-skills', request),
} 