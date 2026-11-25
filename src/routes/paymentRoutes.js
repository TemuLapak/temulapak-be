import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

// Webhook pembayaran dari payment gateway (tanpa Bearer user token; validasi signature/payload bisa ditambah di middleware)
router.post('/webhook', PaymentController.webhook);

// Detail & riwayat pembayaran per registrasi
router.get('/:id', authMiddleware, PaymentController.show);
router.get('/registration/:registrationId', authMiddleware, PaymentController.byRegistration);

// Buat tagihan pembayaran (msme / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  PaymentController.store
);

// Konfirmasi lunas manual / admin
router.patch(
  '/:id/paid',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  PaymentController.markPaid
);

export default router;