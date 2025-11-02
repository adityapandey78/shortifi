import { 
  getLinkAnalytics, 
  getUserAnalytics, 
  getLinkAnalyticsByPeriod,
  getUserOverallStats 
} from "../services/analytics.services.js";
import { findShortLinkById } from "../services/shortner.services.js";
import QRCode from 'qrcode';

/**
 * Get analytics for a specific link
 * GET /api/analytics/link/:id
 */
export const getLinkAnalyticsController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const linkId = parseInt(req.params.id);
    
    if (isNaN(linkId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid link ID' 
      });
    }

    // Verify link ownership
    const link = await findShortLinkById(linkId);
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Link not found' 
      });
    }

    if (link.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view this link\'s analytics' 
      });
    }

    // Get analytics data
    const analytics = await getLinkAnalytics(linkId);
    
    return res.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

/**
 * Get analytics for all user's links
 * GET /api/analytics/user
 */
export const getUserAnalyticsController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const analytics = await getUserAnalytics(req.user.id);
    
    return res.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

/**
 * Get overall statistics for user
 * GET /api/analytics/stats
 */
export const getUserStatsController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const stats = await getUserOverallStats(req.user.id);
    
    return res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics',
      error: error.message 
    });
  }
};

/**
 * Get analytics for a specific time period
 * GET /api/analytics/link/:id/period?days=7
 */
export const getLinkAnalyticsByPeriodController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const linkId = parseInt(req.params.id);
    const days = parseInt(req.query.days) || 7;
    
    if (isNaN(linkId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid link ID' 
      });
    }

    // Verify link ownership
    const link = await findShortLinkById(linkId);
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Link not found' 
      });
    }

    if (link.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view this link\'s analytics' 
      });
    }

    // Get analytics data for period
    const analytics = await getLinkAnalyticsByPeriod(linkId, days);
    
    return res.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('Error fetching period analytics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

/**
 * Generate QR code for a short link
 * GET /api/qrcode/:id
 */
export const generateQRCodeController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const linkId = parseInt(req.params.id);
    
    if (isNaN(linkId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid link ID' 
      });
    }

    // Verify link ownership
    const link = await findShortLinkById(linkId);
    if (!link) {
      return res.status(404).json({ 
        success: false, 
        message: 'Link not found' 
      });
    }

    if (link.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to generate QR code for this link' 
      });
    }

    // Construct full short URL
    const shortUrl = `${req.protocol}://${req.get('host')}/${link.shortCode}`;
    
    // Get format from query (default: png)
    const format = req.query.format || 'png';
    
    if (format === 'svg') {
      // Generate SVG QR code
      const qrCodeSVG = await QRCode.toString(shortUrl, { 
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300
      });
      
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(qrCodeSVG);
    } else if (format === 'dataurl') {
      // Generate data URL (for embedding in HTML/React)
      const qrCodeDataURL = await QRCode.toDataURL(shortUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return res.json({ 
        success: true, 
        data: {
          qrCode: qrCodeDataURL,
          shortUrl,
          format: 'dataurl'
        }
      });
    } else {
      // Generate PNG (default)
      const qrCodeBuffer = await QRCode.toBuffer(shortUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300
      });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qrcode-${link.shortCode}.png"`);
      return res.send(qrCodeBuffer);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate QR code',
      error: error.message 
    });
  }
};
