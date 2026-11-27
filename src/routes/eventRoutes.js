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

// Publik: daftar & detail event
router.get('/', EventController.index);

// Event milik EO/user yang sedang login (letakkan sebelum /:id agar tidak bentrok)
router.get(
  '/mine',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  EventController.myEvents
);

router.get('/:id', EventController.show);

// Buat event baru (eo / admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.EO, ROLES.ADMIN),
  EventController.store
);

// Update & hapus event (pemilik event atau admin)
router.patch(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getEventOwnerId),
  EventController.update
);

router.delete(
  '/:id',
  authMiddleware,
  ownerOrAdminMiddleware(getEventOwnerId),
  EventController.destroy
);

export default router;