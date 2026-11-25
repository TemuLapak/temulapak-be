import { EventModel } from '../models/eventModel.js';
import { EVENT_THEMES } from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const EventController = {
  async index(req, res, next) {
    try {
      const { city, province, theme } = req.query;
      const events = await EventModel.findAll({ city, province, theme });

      return sendSuccess(res, {
        message: 'Daftar event berhasil diambil',
        data: events
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const event = await EventModel.findById(id).catch(() => null);

      if (!event) {
        throw createHttpError(404, 'Event tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Detail event berhasil diambil',
        data: event
      });
    } catch (err) {
      next(err);
    }
  },

  async myEvents(req, res, next) {
    try {
      const profileId = req.user?.id || req.body.profile_id;
      if (!profileId) {
        throw createHttpError(400, 'profile_id wajib disertakan');
      }

      const events = await EventModel.findByProfileId(profileId);
      return sendSuccess(res, {
        message: 'Daftar event saya berhasil diambil',
        data: events
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const profileId = req.user?.id || req.body.profile_id;
      const {
        event_name,
        description,
        theme,
        location,
        city,
        province,
        start_date,
        end_date,
        registration_start,
        registration_end,
        booth_price,
        booth_quota,
        banner
      } = req.body;

      if (
        !profileId ||
        !event_name ||
        !location ||
        !city ||
        !province ||
        !start_date ||
        !end_date ||
        !registration_start ||
        !registration_end ||
        booth_quota == null
      ) {
        throw createHttpError(400, 'Field wajib event belum lengkap');
      }

      const selectedTheme = theme || 'general';
      if (!EVENT_THEMES.includes(selectedTheme)) {
        throw createHttpError(
          400,
          `Tema event tidak valid (${EVENT_THEMES.join(', ')})`
        );
      }

      const parsedQuota = Number(booth_quota);
      const parsedPrice = booth_price != null ? Number(booth_price) : 0;

      if (
        Number.isNaN(parsedQuota) ||
        parsedQuota < 0 ||
        Number.isNaN(parsedPrice) ||
        parsedPrice < 0
      ) {
        throw createHttpError(400, 'booth_quota dan booth_price harus berupa angka yang valid');
      }

      const created = await EventModel.create({
        profile_id: profileId,
        event_name,
        description: description ?? null,
        theme: selectedTheme,
        location,
        city,
        province,
        start_date,
        end_date,
        registration_start,
        registration_end,
        booth_price: parsedPrice,
        booth_quota: parsedQuota,
        banner: banner ?? null
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Event berhasil dibuat',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await EventModel.findById(id).catch(() => null);
      if (!existing) {
        throw createHttpError(404, 'Event tidak ditemukan');
      }

      if (req.body.theme !== undefined && !EVENT_THEMES.includes(req.body.theme)) {
        throw createHttpError(
          400,
          `Tema event tidak valid (${EVENT_THEMES.join(', ')})`
        );
      }

      const allowedFields = [
        'event_name',
        'description',
        'theme',
        'location',
        'city',
        'province',
        'start_date',
        'end_date',
        'registration_start',
        'registration_end',
        'booth_price',
        'booth_quota',
        'banner'
      ];

      const payload = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === 'booth_quota' || field === 'booth_price') {
            const num = Number(req.body[field]);
            if (Number.isNaN(num) || num < 0) {
              throw createHttpError(400, `${field} harus berupa angka yang valid`);
            }
            payload[field] = num;
          } else {
            payload[field] = req.body[field];
          }
        }
      }

      const updated = await EventModel.updateById(id, payload);
      return sendSuccess(res, {
        message: 'Event berhasil diperbarui',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await EventModel.findById(id).catch(() => null);
      if (!existing) {
        throw createHttpError(404, 'Event tidak ditemukan');
      }

      await EventModel.deleteById(id);
      return sendSuccess(res, {
        message: 'Event berhasil dihapus'
      });
    } catch (err) {
      next(err);
    }
  }
};