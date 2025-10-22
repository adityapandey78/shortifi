import api from '../lib/api'

/**
 * URL Shortener Service
 * Handles all shortener-related API calls to the backend JSON API
 */

/**
 * Get all short links for the authenticated user
 * GET /api/links
 * @returns {Promise<{success: boolean, links: Array}>}
 */
export const getAllLinks = async () => {
  const response = await api.get('/api/links')
  return response.data
}

/**
 * Create a new short link
 * POST /api/links
 * @param {Object} data - { url, shortCode? }
 * @returns {Promise<{success: boolean, message: string, link: Object}>}
 */
export const createShortLink = async (data) => {
  const response = await api.post('/api/links', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

/**
 * Get a specific short link by ID
 * GET /api/links/:id
 * @param {number} id - Link ID
 * @returns {Promise<{success: boolean, link: Object}>}
 */
export const getShortLink = async (id) => {
  const response = await api.get(`/api/links/${id}`)
  return response.data
}

/**
 * Update a short link
 * PUT /api/links/:id
 * @param {number} id - Link ID
 * @param {Object} data - { url, shortCode }
 * @returns {Promise<{success: boolean, message: string, link: Object}>}
 */
export const updateShortLink = async (id, data) => {
  const response = await api.put(`/api/links/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

/**
 * Delete a short link
 * DELETE /api/links/:id
 * @param {number} id - Link ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteShortLink = async (id) => {
  const response = await api.delete(`/api/links/${id}`)
  return response.data
}
