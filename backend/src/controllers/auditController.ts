import { Request, Response } from "express";
import { auditService } from "../services/auditService";

export class AuditController {
  async getAuditLogs(req: Request, res: Response) {
    try {
      const clinicId = req.query.clinic_id as string;
      const action = req.query.action as string;
      const resourceType = req.query.resource_type as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const logs = await auditService.getLogs({
        clinic_id: clinicId,
        action,
        resource_type: resourceType,
        limit,
      });

      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to retrieve audit logs",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const auditController = new AuditController();
