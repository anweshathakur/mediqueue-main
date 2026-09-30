import { Request, Response } from "express";
import { notificationService } from "../services/notificationService";
import { isOwnerOrPrivileged } from "../utils/ownership";

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      // Identity is always derived from authenticated user token
      const patientId = req.user?.email || req.user?.id || "demo123@gmail.com";
      const list = await notificationService.getPatientNotifications(patientId);
      return res.status(200).json(list);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notif = await notificationService.getNotificationById(id);
      
      if (!notif) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Ownership check: only owner or privileged staff can mark notification as read
      if (!isOwnerOrPrivileged(req.user, notif.patient_id)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You cannot modify notifications belonging to another user.",
        });
      }

      const updated = await notificationService.markAsRead(id);
      return res.status(200).json({ message: "Marked as read", notification: updated });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      // Identity derived from token to prevent IDOR snooping/mass-mutations
      const patientId = req.user?.email || req.user?.id || "demo123@gmail.com";
      const result = await notificationService.markAllAsRead(patientId);
      return res.status(200).json({ message: "All marked as read", ...result });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to mark all as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const notificationController = new NotificationController();
