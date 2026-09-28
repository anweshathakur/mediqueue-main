import { Router } from 'express';
import walkInRoutes from './walkInRoutes';
import queueRoutes from './queueRoutes';

const router = Router();

router.use('/queue', queueRoutes);
router.use('/walk-ins', walkInRoutes);
router.use('/walkins', walkInRoutes);

export default router;

