// routes/review.routes.ts
import { Router } from "express";
import reviewController from "../controllers/review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Public routes
router.get("/hotel/:hotelId", reviewController.getHotelReviews);
// router.get("/:id", reviewController.getReviewById);

// Protected routes
router.use(authMiddleware);
router.post("/", reviewController.createReview);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

// Admin routes
// router.patch("/:id/status", adminMiddleware, reviewController.updateReviewStatus);
router.post("/:id/respond", adminMiddleware, reviewController.respondToReview);

export default router;