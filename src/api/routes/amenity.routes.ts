// routes/amenity.routes.ts
import { Router } from "express";
import amenityController from "../controllers/amenity.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Public routes
router.get("/", amenityController.getAll);
router.get("/:id", amenityController.getById);

// Admin only routes
router.use(adminMiddleware);
router.post("/", amenityController.create);
router.put("/:id", amenityController.update);
router.delete("/:id", amenityController.delete);
// router.patch("/:id/toggle-status", amenityController.toggleStatus);
// router.post("/bulk-delete", amenityController.bulkDelete);

export default router;