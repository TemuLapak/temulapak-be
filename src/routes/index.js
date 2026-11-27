import { Router } from 'express';
import profileRoutes from './profileRoutes.js';
import msmeRoutes from './msmeRoutes.js';
import eventRoutes from './eventRoutes.js';
import registrationRoutes from './registrationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import verificationRoutes from './verificationRoutes.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Cek status kesehatan server TemuLapak API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server aktif dan berjalan normal
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TemuLapak API is running'
  });
});

router.use('/profiles', profileRoutes);
router.use('/msmes', msmeRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/payments', paymentRoutes);
router.use('/verifications', verificationRoutes);

export default router;