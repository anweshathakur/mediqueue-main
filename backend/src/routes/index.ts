import { Router } from 'express';
import walkInRoutes from './walkInRoutes';
import queueRoutes from './queueRoutes';
import appointmentRoutes from './appointmentRoutes';
import { appointmentController } from '../controllers/appointmentController';

const router = Router();

router.use('/queue', queueRoutes);
router.use('/walk-ins', walkInRoutes);
router.use('/walkins', walkInRoutes);
router.use('/appointments', appointmentRoutes);
router.get('/clinics', (req, res) => appointmentController.getClinics(req, res));
router.get('/doctors', (req, res) => appointmentController.getDoctors(req, res));

export default router;


