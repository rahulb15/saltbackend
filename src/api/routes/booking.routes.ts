
// // routes/booking.routes.ts
// import { Router } from "express";
// import bookingController from "../controllers/booking.controller";
// import { authMiddleware } from "../../middlewares/auth.middleware";
// import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

// const router = Router();

// // Protected routes (all booking routes require authentication)
// router.use(authMiddleware);

// // User booking routes
// router.get("/my-bookings", bookingController.getUserBookings);
// router.post("/", bookingController.create);
// router.get("/:id", bookingController.getBookingById);
// router.post("/:id/cancel", bookingController.cancelBooking);
// router.post("/:id/payment", bookingController.processPayment);

// // Admin only routes
// router.get("/", adminMiddleware, bookingController.getAllBookings);
// // router.put("/:id", adminMiddleware, bookingController.updateBooking);
// // router.patch("/:id/status", adminMiddleware, bookingController.updateBookingStatus);
// // router.post("/:id/refund", adminMiddleware, bookingController.processRefund);

// export default router;

// routes/booking.routes.ts
import { Router } from "express";
import bookingController from "../controllers/booking.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Public routes (if any)
router.get("/status/:reservationNo", bookingController.getBookingStatus);

// User routes (require authentication)
// router.use(authMiddleware);

// Booking creation and management
router.post("/create", bookingController.createBooking);
router.get("/my-bookings", bookingController.getUserBookings);
router.get("/:bookingNumber", bookingController.getBookingByNumber);
router.post("/cancel/:reservationNo", bookingController.cancelBooking);
router.patch("/:bookingNumber/payment", bookingController.updatePaymentStatus);

// Admin routes
// router.use(adminMiddleware);

// Admin specific routes
router.get("/", bookingController.getBookings);

// Future admin routes (commented for future implementation)
/*
router.put("/:id", bookingController.updateBooking);
router.patch("/:id/status", bookingController.updateBookingStatus);
router.post("/:id/refund", bookingController.processRefund);
*/

export default router;