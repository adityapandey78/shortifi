import axios from 'axios'

/**
 * Axios instance configured for API calls to the backend server
 * The backend uses cookie-based authentication (access_token, refresh_token)
 * In development, Vite proxy intercepts /api/* requests and forwards to backend
 * In production, set VITE_API_URL to your backend URL
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Empty = same origin (uses Vite proxy in dev)
  withCredentials: true, // Critical: Send httpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  // Don't follow redirects automatically - we'll handle them
  maxRedirects: 0,
  validateStatus: (status) => {
    // Accept 2xx, 3xx redirects as valid responses
    return status >= 200 && status < 400
  },
})

/**
 * Request interceptor
 * Logs requests in development and ensures cookies are sent
 */
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handles redirects and common HTTP errors
 */
api.interceptors.response.use(
  (response) => {
    // Backend uses redirects for success/error flows
    // Status 302/301 means the operation succeeded but backend wants to redirect
    if (response.status === 302 || response.status === 301) {
      const redirectLocation = response.headers.location
      if (import.meta.env.DEV) {
        console.log(`[API] Redirect to: ${redirectLocation}`)
      }
    }
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      // Handle 401 Unauthorized - user needs to login
      if (status === 401) {
        console.warn('[API] Unauthorized - redirecting to login')
        window.location.href = '/login'
        return Promise.reject(new Error('Unauthorized'))
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.warn('[API] Resource not found')
        return Promise.reject(new Error('Resource not found'))
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('[API] Server error:', status, data)
        return Promise.reject(new Error('Server error occurred'))
      }
    }
    
    // Network error or request timeout
    if (error.request && !error.response) {
      console.error('[API] Network error - backend server may be down')
      return Promise.reject(new Error('Cannot connect to server'))
    }
    
    return Promise.reject(error)
  }
)

export default api
