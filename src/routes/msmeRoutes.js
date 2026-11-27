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

// Lihat UMKM berdasarkan profile_id
router.get('/by-profile/:profileId', MsmeController.byProfile);

// Detail UMKM & daftar produknya
router.get('/:id', MsmeController.show);
router.get('/:id/products', MsmeController.listProducts);

// Buat data UMKM baru (msme / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  MsmeController.store
);

// Update data UMKM (pemilik UMKM atau admin)
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.update
);

// Kelola produk UMKM (pemilik UMKM atau admin)
router.post(
  '/:id/products',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.createProduct
);

router.delete(
  '/:id/products/:productId',
  authMiddleware,
  ownerOrAdminMiddleware(getMsmeOwnerId),
  MsmeController.deleteProduct
);

export default router;