import { Router } from "express";
import hotelController from "../controllers/hotel.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { validateHotel } from "../../middlewares/hotel.validation.middleware";
import { upload } from "../../middlewares/multer.middleware";

const router = Router();

// Public routes
router.get("/", hotelController.getAllHotels);
router.get("/search", hotelController.searchHotels);
router.get("/stats", hotelController.getHotelStats);
router.get("/:id", hotelController.getHotelById);

// Protected routes (require authentication)
// router.use(authMiddleware);

// Admin only routes
router.post("/", [
    adminMiddleware,
    upload, // Use the updated upload middleware
    // validateHotel,
  ], hotelController.create);


// router.put("/:id", [adminMiddleware, validateHotel], hotelController.updateHotel);
// In your routes file
router.put("/:id", [
  adminMiddleware,
  upload,  // Add the upload middleware
  // validateHotel
], hotelController.updateHotel);
router.delete("/:id", adminMiddleware, hotelController.deleteHotel);
router.patch("/:id/status", adminMiddleware, hotelController.updateHotelStatus);
router.post("/bulk-delete", adminMiddleware, hotelController.bulkDeleteHotels);

export default router;