import { ProfileModel } from '../models/profileModel.js';
import { ROLE_VALUES } from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const ProfileController = {
  async me(req, res, next) {
    try {
      const id = req.user?.id || req.query.id;
      if (!id) {
        throw createHttpError(400, 'id profil wajib disertakan');
      }

      const profile = await ProfileModel.findById(id).catch(() => null);
      if (!profile) {
        throw createHttpError(404, 'Profil tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Profil saya berhasil diambil',
        data: profile
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const profile = await ProfileModel.findById(id).catch(() => null);

      if (!profile) {
        throw createHttpError(404, 'Profil tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Detail profil berhasil diambil',
        data: profile
      });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req, res, next) {
    try {
      const id = req.user?.id || req.body.id;
      const { name, phone, role } = req.body;

      if (!id || !name) {
        throw createHttpError(400, 'id dan name wajib diisi');
      }

      if (role !== undefined && !ROLE_VALUES.includes(role)) {
        throw createHttpError(400, `Role tidak valid (${ROLE_VALUES.join(', ')})`);
      }

      const payload = { id, name };
      if (phone !== undefined) payload.phone = phone;
      if (role !== undefined) payload.role = role;

      const profile = await ProfileModel.upsert(payload);
      return sendSuccess(res, {
        message: 'Profil berhasil disimpan',
        data: profile
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const id = req.params.id || req.user?.id;
      const { name, phone, role } = req.body;

      if (!id) {
        throw createHttpError(400, 'id profil wajib disertakan');
      }

      if (role !== undefined && !ROLE_VALUES.includes(role)) {
        throw createHttpError(400, `Role tidak valid (${ROLE_VALUES.join(', ')})`);
      }

      const existing = await ProfileModel.findById(id).catch(() => null);
      if (!existing) {
        throw createHttpError(404, 'Profil tidak ditemukan');
      }

      const payload = {};
      if (name !== undefined) payload.name = name;
      if (phone !== undefined) payload.phone = phone;
      if (role !== undefined) payload.role = role;

      const updated = await ProfileModel.updateById(id, payload);
      return sendSuccess(res, {
        message: 'Profil berhasil diperbarui',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};