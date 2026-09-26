import { Router } from 'express';
import walkInRoutes from './walkInRoutes';

const router = Router();

router.use('/', walkInRoutes);

export default router;
