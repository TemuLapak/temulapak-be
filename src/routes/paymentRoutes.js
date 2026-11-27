import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Manajemen tagihan, konfirmasi pembayaran, dan webhook payment gateway
 */

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Terima notifikasi status pembayaran dari payment gateway (webhook)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gateway_ref
 *               - status
 *             properties:
 *               gateway_ref:
 *                 type: string
 *                 example: TRX-TEMULAPAK-001
 *               status:
 *                 type: string
 *                 enum: [pending, paid, failed, expired, refunded]
 *                 example: paid
 *               method:
 *                 type: string
 *                 example: qris
 *               paid_at:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-27T14:00:00Z
 *     responses:
 *       200:
 *         description: Webhook pembayaran diproses
 *       400:
 *         description: gateway_ref dan status wajib diisi
 *       404:
 *         description: Transaksi dengan gateway_ref tidak ditemukan
 */
// Webhook pembayaran dari payment gateway (tanpa Bearer user token; validasi signature/payload bisa ditambah di middleware)
router.post('/webhook', PaymentController.webhook);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Ambil detail pembayaran berdasarkan ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID pembayaran
 *     responses:
 *       200:
 *         description: Detail pembayaran berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       404:
 *         description: Data pembayaran tidak ditemukan
 */
router.get('/:id', authMiddleware, PaymentController.show);

/**
 * @swagger
 * /payments/registration/{registrationId}:
 *   get:
 *     summary: Ambil riwayat pembayaran berdasarkan ID registrasi event
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID registrasi event
 *     responses:
 *       200:
 *         description: Daftar pembayaran registrasi berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 */
router.get('/registration/:registrationId', authMiddleware, PaymentController.byRegistration);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Buat tagihan pembayaran baru untuk registrasi event (MSME atau Admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registration_id
 *             properties:
 *               registration_id:
 *                 type: string
 *                 format: uuid
 *                 example: 8f14e45f-ea97-4a1a-b88f-3b5c4d2e1f0a
 *               amount:
 *                 type: number
 *                 example: 250000
 *                 description: Opsional; jika kosong akan mengikuti booth_price event
 *               gateway:
 *                 type: string
 *                 example: midtrans
 *               gateway_ref:
 *                 type: string
 *                 example: ORDER-1732716000
 *               method:
 *                 type: string
 *                 example: bank_transfer
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-28T14:00:00Z
 *     responses:
 *       201:
 *         description: Tagihan pembayaran berhasil dibuat
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Role tidak diizinkan
 *       404:
 *         description: Registrasi tidak ditemukan
 */
// Buat tagihan pembayaran (msme / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  PaymentController.store
);

/**
 * @swagger
 * /payments/{id}/paid:
 *   patch:
 *     summary: Konfirmasi pembayaran lunas secara manual (Admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID pembayaran
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method:
 *                 type: string
 *                 example: manual_transfer
 *               paid_at:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-27T14:30:00Z
 *     responses:
 *       200:
 *         description: Pembayaran berhasil dikonfirmasi
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Khusus Admin
 *       404:
 *         description: Data pembayaran tidak ditemukan
 */
// Konfirmasi lunas manual / admin
router.patch(
  '/:id/paid',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  PaymentController.markPaid
);

export default router;