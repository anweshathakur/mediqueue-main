import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, (req, res) => notificationController.getNotifications(req, res));
router.patch("/read-all", requireAuth, (req, res) => notificationController.markAllAsRead(req, res));
router.patch("/:id/read", requireAuth, (req, res) => notificationController.markAsRead(req, res));

export default router;
