import api from '../lib/api'

/**
 * Authentication Service
 * Handles all auth-related API calls to the backend JSON API
 */

/**
 * Register a new user
 * POST /api/auth/register
 * @param {Object} data - { name, email, password }
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
export const register = async (data) => {
  const response = await api.post('/api/auth/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

/**
 * Login user
 * POST /api/auth/login
 * @param {Object} data - { email, password }
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
export const login = async (data) => {
  const response = await api.post('/api/auth/login', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 * @returns {Promise<{success: boolean, user?: Object}>}
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me')
  return response.data
}

/**
 * Logout user
 * POST /api/auth/logout
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const logout = async () => {
  const response = await api.post('/api/auth/logout')
  return response.data
}

/**
 * Resend email verification link
 * POST /api/auth/resend-verification
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resendVerification = async () => {
  const response = await api.post('/api/auth/resend-verification')
  return response.data
}

/**
 * Verify email with token
 * GET /api/auth/verify-email?token=xxx&email=xxx
 * @param {string} token - Verification token
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyEmail = async (token, email) => {
  const response = await api.get(`/api/auth/verify-email?token=${token}&email=${email}`)
  return response.data
}

/**
 * Initiate Google OAuth login
 * GET /api/auth/google
 * @returns {Promise<{success: boolean, redirectUrl: string}>}
 */
export const googleLogin = async () => {
  const response = await api.get('/api/auth/google')
  if (response.data.success && response.data.redirectUrl) {
    // Redirect to Google OAuth page
    window.location.href = response.data.redirectUrl
  }
  return response.data
}

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback?code=xxx&state=xxx
 * @param {string} code - Authorization code
 * @param {string} state - OAuth state
 * @returns {Promise<{success: boolean, user?: Object, message: string}>}
 */
export const googleCallback = async (code, state) => {
  const response = await api.get(`/api/auth/google/callback?code=${code}&state=${state}`)
  return response.data
}
