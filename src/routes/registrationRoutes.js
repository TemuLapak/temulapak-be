import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController.js';
import { RegistrationModel } from '../models/registrationModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

const getRegistrationOwnerId = async (req) => {
  const reg = await RegistrationModel.findById(req.params.id).catch(() => null);
  return reg?.msme?.profile_id ?? null;
};

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Pendaftaran booth event oleh UMKM dan persetujuan oleh Event Organizer (EO) atau Admin
 */

/**
 * @swagger
 * /registrations/{id}:
 *   get:
 *     summary: Ambil detail registrasi berdasarkan ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID registrasi event
 *     responses:
 *       200:
 *         description: Detail registrasi berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Bukan pemilik UMKM pendaftar atau Admin
 *       404:
 *         description: Data registrasi tidak ditemukan
 */
// Detail registrasi (pemilik UMKM pendaftar, EO pemilik event, atau admin)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getRegistrationOwnerId),
  RegistrationController.show
);

/**
 * @swagger
 * /registrations/msme/{msmeId}:
 *   get:
 *     summary: Ambil daftar registrasi event berdasarkan ID UMKM
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: msmeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *     responses:
 *       200:
 *         description: Daftar registrasi UMKM berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 */
// Daftar registrasi berdasarkan UMKM atau event
router.get('/msme/:msmeId', authMiddleware, RegistrationController.byMsme);

/**
 * @swagger
 * /registrations/event/{eventId}:
 *   get:
 *     summary: Ambil daftar pendaftar berdasarkan ID event (EO atau Admin)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID event
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter berdasarkan status registrasi
 *     responses:
 *       200:
 *         description: Daftar pendaftar event berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Khusus EO atau Admin
 */
router.get(
  '/event/:eventId',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  RegistrationController.byEvent
);

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Daftarkan UMKM ke booth event (MSME atau Admin)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - msme_id
 *               - event_id
 *             properties:
 *               msme_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *               event_id:
 *                 type: string
 *                 format: uuid
 *                 example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *     responses:
 *       201:
 *         description: Pendaftaran event berhasil dibuat
 *       400:
 *         description: Di luar periode pendaftaran, kuota penuh, atau input tidak valid
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Role tidak diizinkan
 *       404:
 *         description: Event atau UMKM tidak ditemukan
 *       409:
 *         description: UMKM sudah terdaftar pada event ini
 */
// Daftar booth event (msme / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  RegistrationController.store
);

/**
 * @swagger
 * /registrations/{id}/status:
 *   patch:
 *     summary: Perbarui status registrasi booth event (EO atau Admin)
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID registrasi event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, cancelled]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Status registrasi berhasil diperbarui
 *       400:
 *         description: Status wajib diisi atau tidak valid
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Bukan EO pemilik event atau Admin
 *       404:
 *         description: Data registrasi tidak ditemukan
 */
// Approve / reject / update status registrasi (eo / admin)
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  RegistrationController.updateStatus
);

export default router;