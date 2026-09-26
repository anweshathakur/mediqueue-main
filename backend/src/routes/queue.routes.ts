import { Router } from 'express';
import { queueController } from '../controllers';

const router = Router();

router.get('/queue', (req, res, next) => queueController.getQueue(req, res, next));
router.post('/queue', (req, res, next) => queueController.addPatient(req, res, next));

export default router;
