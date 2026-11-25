import { Router } from 'express';
import { VerificationController } from '../controllers/verificationController.js';
import { VerificationModel } from '../models/verificationModel.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

const getVerificationOwnerId = async (req) => {
  const item = await VerificationModel.findById(req.params.id).catch(() => null);
  return item?.profile_id ?? null;
};

// Daftar verifikasi (admin melihat semua; bisa difilter ?status=&type=&profile_id=)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  VerificationController.index
);

// Detail verifikasi (pemilik dokumen atau admin)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getVerificationOwnerId),
  VerificationController.show
);

// Ajukan dokumen verifikasi (msme / eo / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.EO, ROLES.ADMIN),
  VerificationController.store
);

// Review dokumen verifikasi (hanya admin)
router.patch(
  '/:id/review',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  VerificationController.review
);

export default router;