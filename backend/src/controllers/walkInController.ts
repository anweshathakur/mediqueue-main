import { Request, Response, NextFunction } from 'express';
import { walkInService } from '../services/walkInService';

export class WalkInController {
  async createWalkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await walkInService.registerWalkIn(req.body);
      res.status(201).json({
        success: true,
        message: 'Walk-in registered successfully',
        data: patient,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to register walk-in',
      });
    }
  }

  async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await walkInService.getQueue();
      res.status(200).json({
        success: true,
        count: queue.length,
        data: queue,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await walkInService.updateQueueStatus(id, status);
      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  async deleteWalkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await walkInService.removeWalkIn(id);
      res.status(200).json({
        success: true,
        message: 'Walk-in removed from queue',
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
}

export const walkInController = new WalkInController();
