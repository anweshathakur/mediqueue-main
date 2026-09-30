import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { requireAuth } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { NotificationIdParamSchema } from "../validators/notificationValidator";

const router = Router();

router.get("/", requireAuth, (req, res) => notificationController.getNotifications(req, res));
router.patch("/read-all", requireAuth, (req, res) => notificationController.markAllAsRead(req, res));
router.patch("/:id/read", requireAuth, validate({ params: NotificationIdParamSchema }), (req, res) => notificationController.markAsRead(req, res));

export default router;
