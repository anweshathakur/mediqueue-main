import { Request, Response, NextFunction } from 'express';
import { queueService } from '../services';

export class QueueController {
  async getQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const queue = await queueService.getQueue();
      res.status(200).json({ success: true, data: queue });
    } catch (err) {
      next(err);
    }
  }

  async addPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await queueService.addPatient(req.body);
      res.status(201).json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  }
}

export const queueController = new QueueController();
