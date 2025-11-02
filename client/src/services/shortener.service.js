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

/**
 * Get analytics for a specific link
 * GET /api/analytics/link/:id
 * @param {number} id - Link ID
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getLinkAnalytics = async (id) => {
  const response = await api.get(`/api/analytics/link/${id}`)
  return response.data
}

/**
 * Get overall stats for user
 * GET /api/analytics/stats
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getUserStats = async () => {
  const response = await api.get('/api/analytics/stats')
  return response.data
}

/**
 * Get QR code for a link
 * GET /api/analytics/qrcode/:id?format=dataurl
 * @param {number} id - Link ID
 * @returns {Promise<{success: boolean, data: {qrCode: string, shortUrl: string}}>}
 */
export const getQRCode = async (id) => {
  const response = await api.get(`/api/analytics/qrcode/${id}?format=dataurl`)
  return response.data
}

/**
 * Download QR code as PNG
 * @param {number} id - Link ID
 * @param {string} filename - Desired filename
 */
export const downloadQRCode = async (id, filename = 'qrcode.png') => {
  const response = await api.get(`/api/analytics/qrcode/${id}?format=png`, {
    responseType: 'blob',
  })
  
  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

