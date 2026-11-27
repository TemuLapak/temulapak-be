import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware, ownerOrAdminMiddleware } from '../middlewares/permissionMiddleware.js';
import { ROLES } from '../utils/enum.js';

const router = Router();

// Profil user yang sedang login
router.get('/me', authMiddleware, ProfileController.me);

// Buat / perbarui profil sendiri (upsert)
router.put('/me', authMiddleware, ProfileController.upsert);

// Daftar/detail profil tertentu (hanya admin atau pemilik profil)
router.get(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware((req) => req.params.id),
  ProfileController.show
);

// Update profil berdasarkan ID (hanya pemilik profil atau admin)
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware((req) => req.params.id),
  ProfileController.update
);

export default router;