import { Request, Response } from "express";
import { queueService } from "../services/queueService";
import { hasClinicAccess, getDoctorClinicId, getQueueEntryClinicId } from "../utils/clinicIsolation";

export class QueueController {
  async getDoctorQueue(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId || (req.query.doctorId as string) || "1";
      
      // Multi-tenancy check: verify doctor's clinic belongs to requesting user's clinic
      const docClinicId = await getDoctorClinicId(doctorId);
      if (docClinicId && !hasClinicAccess(req.user, docClinicId)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You cannot access queue data for a doctor at another clinic.",
        });
      }

      const queue = await queueService.getDoctorQueue(doctorId);
      return res.status(200).json(queue);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to retrieve doctor queue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async callPatient(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
      }

      // Multi-tenancy check: verify queue entry belongs to caller's clinic
      const qClinicId = await getQueueEntryClinicId(queueEntryId);
      if (qClinicId && !hasClinicAccess(req.user, qClinicId)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You cannot manage queue entries belonging to another clinic.",
        });
      }

      const updated = await queueService.callNextPatient(queueEntryId);
      return res.status(200).json({
        message: "Patient called successfully",
        queueEntry: updated,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to call patient",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async startConsultation(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
      }

      // Multi-tenancy check
      const qClinicId = await getQueueEntryClinicId(queueEntryId);
      if (qClinicId && !hasClinicAccess(req.user, qClinicId)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You cannot manage queue entries belonging to another clinic.",
        });
      }

      const result = await queueService.startConsultation(queueEntryId);
      return res.status(200).json({
        message: "Consultation started successfully",
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to start consultation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async completeConsultation(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
      }

      // Multi-tenancy check
      const qClinicId = await getQueueEntryClinicId(queueEntryId);
      if (qClinicId && !hasClinicAccess(req.user, qClinicId)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied. You cannot manage queue entries belonging to another clinic.",
        });
      }

      const result = await queueService.completeConsultation(queueEntryId);
      return res.status(200).json({
        message: "Consultation completed successfully",
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to complete consultation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getMyQueueStatus(req: Request, res: Response) {
    try {
      const authenticatedUserIdentifier = req.user?.email || req.user?.id || "demo123@gmail.com";
      const status = await queueService.getMyQueueStatus(authenticatedUserIdentifier);
      return res.status(200).json(status);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch queue status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const queueController = new QueueController();
