import { Router } from 'express';
import queueRoutes from './queue.routes';

const router = Router();

router.use('/', queueRoutes);

export default router;
