import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Manajemen profil pengguna (MSME, Event Organizer, dan Admin)
 */

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Ambil profil pengguna yang sedang login
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil saya berhasil diambil
 *       400:
 *         description: id profil wajib disertakan
 *       401:
 *         description: Belum terautentikasi
 *       404:
 *         description: Profil tidak ditemukan
 */
// Profil user yang sedang login
router.get('/me', authMiddleware, ProfileController.me);

/**
 * @swagger
 * /profiles/me:
 *   put:
 *     summary: Buat atau perbarui profil pengguna yang sedang login (upsert)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: Opsional jika sudah login (diambil otomatis dari token)
 *               name:
 *                 type: string
 *                 example: Hanifatul Nadiva
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 enum: [admin, msme, eo]
 *                 example: msme
 *     responses:
 *       200:
 *         description: Profil berhasil disimpan
 *       400:
 *         description: id dan name wajib diisi atau role tidak valid
 *       401:
 *         description: Belum terautentikasi
 */
// Buat / perbarui profil sendiri (upsert)
router.put('/me', authMiddleware, ProfileController.upsert);

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Ambil detail profil berdasarkan ID (Pemilik profil atau Admin)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID profil pengguna
 *     responses:
 *       200:
 *         description: Detail profil berhasil diambil
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Bukan pemilik profil atau Admin
 *       404:
 *         description: Profil tidak ditemukan
 */
// Daftar/detail profil tertentu (hanya admin atau pemilik profil)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware((req) => req.params.id),
  ProfileController.show
);

/**
 * @swagger
 * /profiles/{id}:
 *   patch:
 *     summary: Perbarui sebagian data profil berdasarkan ID (Pemilik profil atau Admin)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID profil pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hanifatul Nadiva
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 enum: [admin, msme, eo]
 *                 example: msme
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Role tidak valid
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Bukan pemilik profil atau Admin
 *       404:
 *         description: Profil tidak ditemukan
 */
// Update profil berdasarkan ID (hanya pemilik profil atau admin)
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware((req) => req.params.id),
  ProfileController.update
);

export default router;