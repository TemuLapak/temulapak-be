import { ROLES, ROLE_VALUES } from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';

export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, 'Pengguna belum terautentikasi'));
    }

    if (!ROLE_VALUES.includes(req.user.role)) {
      return next(createHttpError(403, 'Role pengguna tidak dikenali'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createHttpError(403, `Akses ditolak. Diperlukan role: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
}

export function ownerOrAdminMiddleware(getOwnerProfileId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Pengguna belum terautentikasi'
        });
      }

      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      const ownerProfileId = await getOwnerProfileId(req);
      if (!ownerProfileId) {
        return res.status(404).json({
          success: false,
          message: 'Data tidak ditemukan'
        });
      }

      if (ownerProfileId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengakses atau mengubah data ini'
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}