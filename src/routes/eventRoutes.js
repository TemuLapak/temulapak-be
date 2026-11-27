import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';
import { EventModel } from '../models/eventModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

const getEventOwnerId = async (req) => {
  const event = await EventModel.findById(req.params.id).catch(() => null);
  return event?.profile_id ?? null;
};

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Manajemen event bazar/pameran oleh Event Organizer (EO) dan Admin
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Ambil daftar semua event (publik)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kota
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter berdasarkan provinsi
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *           enum: [culinary, fashion, craft, technology, agriculture, creative_economy, business, general]
 *         description: Filter berdasarkan tema event
 *     responses:
 *       200:
 *         description: Daftar event berhasil diambil
 */
router.get('/', EventController.index);

/**
 * @swagger
 * /events/mine:
 *   get:
 *     summary: Ambil daftar event milik EO/Admin yang sedang login
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar event milik pengguna berhasil diambil
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
 *       403:
 *         description: Akses ditolak (khusus EO / Admin)
 */
router.get(
  '/mine',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  EventController.myEvents
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Ambil detail event berdasarkan ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID event
 *     responses:
 *       200:
 *         description: Detail event berhasil diambil
 *       404:
 *         description: Event tidak ditemukan
 */
router.get('/:id', EventController.show);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Buat event baru (EO atau Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_name
 *               - location
 *               - city
 *               - province
 *               - start_date
 *               - end_date
 *               - registration_start
 *               - registration_end
 *               - booth_quota
 *             properties:
 *               event_name:
 *                 type: string
 *                 example: Jogja Culinary Fest 2026
 *               description:
 *                 type: string
 *                 example: Festival kuliner UMKM se-DIY
 *               theme:
 *                 type: string
 *                 enum: [culinary, fashion, craft, technology, agriculture, creative_economy, business, general]
 *                 default: general
 *               location:
 *                 type: string
 *                 example: Stadion Mandala Krida
 *               city:
 *                 type: string
 *                 example: Yogyakarta
 *               province:
 *                 type: string
 *                 example: DI Yogyakarta
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-10T09:00:00Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-12T21:00:00Z
 *               registration_start:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-11-25T00:00:00Z
 *               registration_end:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-05T23:59:59Z
 *               booth_price:
 *                 type: number
 *                 example: 250000
 *               booth_quota:
 *                 type: integer
 *                 example: 50
 *               banner:
 *                 type: string
 *                 example: https://example.com/banner.jpg
 *     responses:
 *       201:
 *         description: Event berhasil dibuat
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Role tidak diizinkan
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  EventController.store
);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Perbarui sebagian data event (Pemilik event atau Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_name:
 *                 type: string
 *               description:
 *                 type: string
 *               theme:
 *                 type: string
 *                 enum: [culinary, fashion, craft, technology, agriculture, creative_economy, business, general]
 *               location:
 *                 type: string
 *               city:
 *                 type: string
 *               province:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               registration_start:
 *                 type: string
 *                 format: date-time
 *               registration_end:
 *                 type: string
 *                 format: date-time
 *               booth_price:
 *                 type: number
 *               booth_quota:
 *                 type: integer
 *               banner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event berhasil diperbarui
 *       403:
 *         description: Bukan pemilik event atau Admin
 *       404:
 *         description: Event tidak ditemukan
 */
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getEventOwnerId),
  EventController.update
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Hapus event (Pemilik event atau Admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event berhasil dihapus
 *       403:
 *         description: Bukan pemilik event atau Admin
 *       404:
 *         description: Event tidak ditemukan
 */
router.delete(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getEventOwnerId),
  EventController.destroy
);

export default router;