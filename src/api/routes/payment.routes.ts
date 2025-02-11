// routes/payment.routes.ts
import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Public webhook endpoint (needs to be accessible by Razorpay)
router.post("/webhook", paymentController.handleWebhook);

// Protected routes (require authentication)
// router.use(authMiddleware);

// Payment routes
router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);

export default router;