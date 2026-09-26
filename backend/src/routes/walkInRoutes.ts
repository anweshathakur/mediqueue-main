import { Router } from 'express';
import { walkInController } from '../controllers/walkInController';

const router = Router();

router.post('/walkins', (req, res, next) => walkInController.createWalkIn(req, res, next));
router.get('/walkins', (req, res, next) => walkInController.getQueue(req, res, next));
router.get('/queue', (req, res, next) => walkInController.getQueue(req, res, next));
router.patch('/queue/:id/status', (req, res, next) => walkInController.updateStatus(req, res, next));
router.delete('/walkins/:id', (req, res, next) => walkInController.deleteWalkIn(req, res, next));

export default router;
