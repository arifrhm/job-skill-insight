// Debug environment variables
console.log("All env variables:", import.meta.env)
console.log("VITE_BASE_URL:", import.meta.env.VITE_BASE_URL)

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000'

console.log("Final BASE_URL:", BASE_URL)

interface LoginCredentials {
  email: string
  password: string
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

export const fetchApi = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`
  console.log("Making request to:", url)
  console.log("Request options:", options)
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
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
  
  logout: () => api.post<void>('/api/v1/auth/logout', {}),
  
  refreshToken: (refreshToken: string) =>
    api.post<{ access_token: string }>('/api/v1/auth/refresh', { refresh_token: refreshToken }),
} 