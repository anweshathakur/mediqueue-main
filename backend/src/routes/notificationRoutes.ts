import { Router } from "express";
import { notificationController } from "../controllers/notificationController";

const router = Router();

router.get("/", (req, res) => notificationController.getNotifications(req, res));
router.patch("/read-all", (req, res) => notificationController.markAllAsRead(req, res));
router.patch("/:id/read", (req, res) => notificationController.markAsRead(req, res));

export default router;
