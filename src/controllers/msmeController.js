import { MsmeModel } from '../models/msmeModel.js';
import { MSME_CATEGORIES } from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const MsmeController = {
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const msme = await MsmeModel.findById(id).catch(() => null);

      if (!msme) {
        throw createHttpError(404, 'Data UMKM tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Detail data UMKM berhasil diambil',
        data: msme
      });
    } catch (err) {
      next(err);
    }
  },

  async byProfile(req, res, next) {
    try {
      const profileId = req.params.profileId || req.user?.id;
      if (!profileId) {
        throw createHttpError(400, 'profile_id wajib disertakan');
      }

      const msme = await MsmeModel.findByProfileId(profileId);
      if (!msme) {
        throw createHttpError(404, 'UMKM untuk profil ini belum terdaftar');
      }

      return sendSuccess(res, {
        message: 'Data UMKM berdasarkan profil berhasil diambil',
        data: msme
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const profileId = req.user?.id || req.body.profile_id;
      const { msme_name, description, category, city, province } = req.body;

      if (!profileId || !msme_name || !category) {
        throw createHttpError(400, 'profile_id, msme_name, dan category wajib diisi');
      }

      if (!MSME_CATEGORIES.includes(category)) {
        throw createHttpError(
          400,
          `Kategori UMKM tidak valid (${MSME_CATEGORIES.join(', ')})`
        );
      }

      // Karena msme.profile_id bersifat UNIQUE, cek dulu apakah sudah ada
      const existing = await MsmeModel.findByProfileId(profileId);
      if (existing) {
        throw createHttpError(409, 'Profil ini sudah memiliki data UMKM');
      }

      const created = await MsmeModel.create({
        profile_id: profileId,
        msme_name,
        description: description ?? null,
        category,
        city: city ?? null,
        province: province ?? null
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Data UMKM berhasil dibuat',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await MsmeModel.findById(id).catch(() => null);
      if (!existing) {
        throw createHttpError(404, 'Data UMKM tidak ditemukan');
      }

      if (req.body.category !== undefined && !MSME_CATEGORIES.includes(req.body.category)) {
        throw createHttpError(
          400,
          `Kategori UMKM tidak valid (${MSME_CATEGORIES.join(', ')})`
        );
      }

      const allowedFields = ['msme_name', 'description', 'category', 'city', 'province'];
      const payload = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          payload[field] = req.body[field];
        }
      }

      const updated = await MsmeModel.updateById(id, payload);
      return sendSuccess(res, {
        message: 'Data UMKM berhasil diperbarui',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // --- Endpoint produk UMKM (msme_product) ---
  async listProducts(req, res, next) {
    try {
      const { id } = req.params;
      const products = await MsmeModel.getProductsByMsmeId(id);

      return sendSuccess(res, {
        message: 'Daftar produk UMKM berhasil diambil',
        data: products
      });
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req, res, next) {
    try {
      const { id } = req.params; // msme.id
      const { product_name } = req.body;

      if (!product_name) {
        throw createHttpError(400, 'product_name wajib diisi');
      }

      const msme = await MsmeModel.findById(id).catch(() => null);
      if (!msme) {
        throw createHttpError(404, 'Data UMKM tidak ditemukan');
      }

      const created = await MsmeModel.addProduct({
        msme_id: id,
        product_name
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Produk UMKM berhasil ditambahkan',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id, productId } = req.params;
      await MsmeModel.removeProduct(productId, id);

      return sendSuccess(res, {
        message: 'Produk UMKM berhasil dihapus'
      });
    } catch (err) {
      next(err);
    }
  }
};