import { Router } from 'express';
import profileRoutes from './profileRoutes.js';
import msmeRoutes from './msmeRoutes.js';
import eventRoutes from './eventRoutes.js';
import registrationRoutes from './registrationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import verificationRoutes from './verificationRoutes.js';

const router = Router();

router.use('/profiles', profileRoutes);
router.use('/msmes', msmeRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/payments', paymentRoutes);
router.use('/verifications', verificationRoutes);

export default router;