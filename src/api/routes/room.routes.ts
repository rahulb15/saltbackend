import { Router } from "express";
import roomController from "../controllers/room.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import { roomUpload } from "../../middlewares/room.upload.middleware";

const router = Router();

// Public routes - Order matters!
// Put specific routes before parameterized routes
router.get("/listings/:hotelId", roomController.getRoomListings); // Move this up
router.get("/compare-listings/:hotelId", roomController.compareRoomListings);
router.get("/hotel/:hotelId", roomController.getRoomsByHotel);
router.get("/", roomController.getAll);
router.get("/:roomId/availability", roomController.checkAvailability);
router.get("/:id", roomController.getById); // Move generic ID route to the end

// Protected routes
// router.use(authMiddleware);

// Admin routes with file upload
router.post("/", [
    adminMiddleware,
    roomUpload
], roomController.create);
// Add this new route to your existing router
router.post("/select-room/:hotelId", adminMiddleware, roomController.selectRoom);


router.put("/:id", [
    adminMiddleware,
    roomUpload
], roomController.update);

router.delete("/:id", adminMiddleware, roomController.delete);
router.patch("/:id/status", adminMiddleware, roomController.updateStatus);
router.post("/bulk-delete", adminMiddleware, roomController.bulkDelete);

export default router;