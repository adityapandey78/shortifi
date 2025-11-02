import { Router } from "express";
import { 
  getLinkAnalyticsController,
  getUserAnalyticsController,
  getUserStatsController,
  getLinkAnalyticsByPeriodController,
  generateQRCodeController
} from "../controllers/analytics.controller.js";

const router = Router();

// Analytics routes
router.get("/link/:id", getLinkAnalyticsController);
router.get("/link/:id/period", getLinkAnalyticsByPeriodController);
router.get("/user", getUserAnalyticsController);
router.get("/stats", getUserStatsController);

// QR Code generation
router.get("/qrcode/:id", generateQRCodeController);

export default router;
