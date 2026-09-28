import { Request, Response } from "express";
import { queueService } from "../services/queueService";

export class QueueController {
  /**
   * GET /api/queue/:doctorId
   */
  async getDoctorQueue(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId || (req.query.doctorId as string) || "1";
      const queue = await queueService.getDoctorQueue(doctorId);
      return res.status(200).json(queue);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to retrieve doctor queue",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * POST /api/queue/:queueEntryId/call
   */
  async callPatient(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
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

  /**
   * POST /api/queue/:queueEntryId/start
   */
  async startConsultation(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
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

  /**
   * POST /api/queue/:queueEntryId/complete
   */
  async completeConsultation(req: Request, res: Response) {
    try {
      const { queueEntryId } = req.params;
      if (!queueEntryId) {
        return res.status(400).json({ message: "queueEntryId parameter is required" });
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

  /**
   * GET /api/queue/my
   */
  async getMyQueueStatus(req: Request, res: Response) {
    try {
      const patientId = (req.query.patient_id || req.query.id || req.query.phone || req.query.email) as string;
      const status = await queueService.getMyQueueStatus(patientId);
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
