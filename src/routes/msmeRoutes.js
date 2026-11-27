import { Router } from 'express';
import { MsmeController } from '../controllers/msmeController.js';
import { MsmeModel } from '../models/msmeModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

const getMsmeOwnerId = async (req) => {
  const msme = await MsmeModel.findById(req.params.id).catch(() => null);
  return msme?.profile_id ?? null;
};

/**
 * @swagger
 * tags:
 *   name: MSMEs
 *   description: Manajemen profil UMKM (MSME) dan produk UMKM
 */

/**
 * @swagger
 * /msmes/by-profile/{profileId}:
 *   get:
 *     summary: Ambil data UMKM berdasarkan profile_id
 *     tags: [MSMEs]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID profil pemilik UMKM
 *     responses:
 *       200:
 *         description: Data UMKM berdasarkan profil berhasil diambil
 *       404:
 *         description: UMKM untuk profil ini belum terdaftar
 */
router.get('/by-profile/:profileId', MsmeController.byProfile);

/**
 * @swagger
 * /msmes/{id}:
 *   get:
 *     summary: Ambil detail UMKM berdasarkan ID
 *     tags: [MSMEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *     responses:
 *       200:
 *         description: Detail data UMKM berhasil diambil
 *       404:
 *         description: Data UMKM tidak ditemukan
 */
router.get('/:id', MsmeController.show);

/**
 * @swagger
 * /msmes/{id}/products:
 *   get:
 *     summary: Ambil daftar produk milik UMKM
 *     tags: [MSMEs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *     responses:
 *       200:
 *         description: Daftar produk UMKM berhasil diambil
 */
router.get('/:id/products', MsmeController.listProducts);

/**
 * @swagger
 * /msmes:
 *   post:
 *     summary: Buat data UMKM baru (MSME atau Admin)
 *     tags: [MSMEs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - msme_name
 *               - category
 *             properties:
 *               profile_id:
 *                 type: string
 *                 format: uuid
 *                 description: Opsional jika sudah login (diambil otomatis dari token)
 *               msme_name:
 *                 type: string
 *                 example: Bakpia Pathok Sari Rasa
 *               description:
 *                 type: string
 *                 example: Oleh-oleh khas Yogyakarta dengan berbagai varian rasa
 *               category:
 *                 type: string
 *                 enum: [culinary, fashion, craft, technology, agriculture, creative_economy, services, other]
 *                 example: culinary
 *               city:
 *                 type: string
 *                 example: Bantul
 *               province:
 *                 type: string
 *                 example: DI Yogyakarta
 *     responses:
 *       201:
 *         description: Data UMKM berhasil dibuat
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Belum terautentikasi
 *       403:
 *         description: Role tidak diizinkan
 *       409:
 *         description: Profil ini sudah memiliki data UMKM
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  MsmeController.store
);

/**
 * @swagger
 * /msmes/{id}:
 *   patch:
 *     summary: Perbarui sebagian data UMKM (Pemilik UMKM atau Admin)
 *     tags: [MSMEs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               msme_name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [culinary, fashion, craft, technology, agriculture, creative_economy, services, other]
 *               city:
 *                 type: string
 *               province:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data UMKM berhasil diperbarui
 *       400:
 *         description: Kategori UMKM tidak valid
 *       403:
 *         description: Bukan pemilik UMKM atau Admin
 *       404:
 *         description: Data UMKM tidak ditemukan
 */
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.update
);

/**
 * @swagger
 * /msmes/{id}/products:
 *   post:
 *     summary: Tambahkan produk baru ke UMKM (Pemilik UMKM atau Admin)
 *     tags: [MSMEs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: Bakpia Kacang Hijau Original
 *     responses:
 *       201:
 *         description: Produk UMKM berhasil ditambahkan
 *       400:
 *         description: product_name wajib diisi
 *       403:
 *         description: Bukan pemilik UMKM atau Admin
 *       404:
 *         description: Data UMKM tidak ditemukan
 */
router.post(
  '/:id/products',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.createProduct
);

/**
 * @swagger
 * /msmes/{id}/products/{productId}:
 *   delete:
 *     summary: Hapus produk UMKM (Pemilik UMKM atau Admin)
 *     tags: [MSMEs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID UMKM
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID produk UMKM
 *     responses:
 *       200:
 *         description: Produk UMKM berhasil dihapus
 *       403:
 *         description: Bukan pemilik UMKM atau Admin
 */
router.delete(
  '/:id/products/:productId',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.deleteProduct
);

export default router;