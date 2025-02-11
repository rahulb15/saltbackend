// routes/dashboard.routes.ts
import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Protect all dashboard routes with authentication
// router.use(authMiddleware);
// router.use(adminMiddleware);

// Dashboard statistics endpoints
router.get("/stats", dashboardController.getStats);
router.get("/booking-trends", dashboardController.getBookingTrends);
router.get("/room-bookings", dashboardController.getRoomBookings);
router.get("/today-bookings", dashboardController.getTodayBookings);
router.get("/revenue", dashboardController.getRevenueStats);
router.get("/customers", dashboardController.getCustomerStats);

export default router;