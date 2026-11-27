import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController.js';
import { VerificationModel } from '../models/verificationModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

const getVerificationOwnerId = async (req) => {
  const item = await VerificationModel.findById(req.params.id).catch(() => null);
  return item?.profile_id ?? null;
};

/**
 * @swagger
 * tags:
 *   name: Verifications
 *   description: Pengajuan dokumen verifikasi akun/UMKM/EO dan proses review oleh Admin
 */

/**
 * @swagger
 * /verifications:
 *   get:
 *     summary: Ambil daftar pengajuan verifikasi (Admin)
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter berdasarkan status verifikasi
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [identity, business_license, event_permit, tax_id]
 *         description: Filter berdasarkan jenis dokumen verifikasi
 *       - in: query
 *         name: profile_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter berdasarkan UUID profil pengguna
 *     responses:
 *       200:
 *         description: Daftar verifikasi berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Khusus Admin
 */
// Daftar verifikasi (admin melihat semua; bisa difilter ?status=&type=&profile_id=)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  VerificationController.index
);

/**
 * @swagger
 * /verifications/{id}:
 *   get:
 *     summary: Ambil detail pengajuan verifikasi berdasarkan ID (Pemilik dokumen atau Admin)
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID pengajuan verifikasi
 *     responses:
 *       200:
 *         description: Detail verifikasi berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Bukan pemilik dokumen atau Admin
 *       404:
 *         description: Data verifikasi tidak ditemukan
 */
// Detail verifikasi (pemilik dokumen atau admin)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getVerificationOwnerId),
  VerificationController.show
);

/**
 * @swagger
 * /verifications:
 *   post:
 *     summary: Ajukan dokumen verifikasi baru (MSME, EO, atau Admin)
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - document
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *                 description: Opsional jika sudah login (diambil otomatis dari token)
 *               type:
 *                 type: string
 *                 enum: [identity, business_license, event_permit, tax_id]
 *                 example: business_license
 *               document:
 *                 type: string
 *                 example: https://storage.example.com/documents/nib-umkm.pdf
 *     responses:
 *       201:
 *         description: Pengajuan verifikasi berhasil dikirim
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Role tidak diizinkan
 */
// Ajukan dokumen verifikasi (msme / eo / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.EO, ROLES.ADMIN),
  VerificationController.store
);

/**
 * @swagger
 * /verifications/{id}/review:
 *   patch:
 *     summary: Review dan tetapkan status pengajuan verifikasi (Admin)
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID pengajuan verifikasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               reviewed_by:
 *                 type: string
 *                 format: uuid
 *                 description: Opsional jika sudah login (diambil otomatis dari token)
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *               notes:
 *                 type: string
 *                 example: Dokumen NIB valid dan sesuai dengan data profil
 *     responses:
 *       200:
 *         description: Hasil review verifikasi berhasil disimpan
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Khusus Admin
 *       404:
 *         description: Data verifikasi tidak ditemukan
 */
// Review dokumen verifikasi (hanya admin)
router.patch(
  '/:id/review',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  VerificationController.review
);

export default router;