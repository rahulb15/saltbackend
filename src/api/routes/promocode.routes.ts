
// routes/promocode.routes.ts
import { Router } from "express";
import promocodeController from "../controllers/promocode.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();

// Public routes
router.post("/validate", promocodeController.validatePromocode);

// Protected routes
// router.use(authMiddleware);
router.get("/",adminMiddleware, promocodeController.getAll);

// Admin only routes
// router.use(adminMiddleware);
router.post("/", adminMiddleware, promocodeController.create);
router.put("/:id",adminMiddleware, promocodeController.update);
router.delete("/:id",adminMiddleware, promocodeController.delete);

export default router;