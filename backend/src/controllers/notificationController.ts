import { Request, Response } from "express";
import { notificationService } from "../services/notificationService";

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const patientId = req.user?.email || req.user?.id || (req.query.patient_id as string) || "demo123@gmail.com";
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
      const updated = await notificationService.markAsRead(id);
      if (!updated) {
        return res.status(404).json({ message: "Notification not found" });
      }
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
      const patientId = req.user?.email || req.user?.id || (req.body?.patient_id as string) || "demo123@gmail.com";
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
