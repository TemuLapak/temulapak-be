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

// Detail registrasi (pemilik UMKM pendaftar, EO pemilik event, atau admin)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getRegistrationOwnerId),
  RegistrationController.show
);

// Daftar registrasi berdasarkan UMKM atau event
router.get('/msme/:msmeId', authMiddleware, RegistrationController.byMsme);
router.get(
  '/event/:eventId',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  RegistrationController.byEvent
);

// Daftar booth event (msme / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.MSME, ROLES.ADMIN),
  RegistrationController.store
);

// Approve / reject / update status registrasi (eo / admin)
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  RegistrationController.updateStatus
);

export default router;