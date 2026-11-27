import { RegistrationModel } from '../models/registrationModel.js';
import { RegistrationService } from '../services/registrationService.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/responHelper.js';

export const RegistrationController = {
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.findById(id).catch(() => null);

      if (!registration) {
        throw createHttpError(404, 'Data registrasi tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Detail registrasi berhasil diambil',
        data: registration
      });
    } catch (err) {
      next(err);
    }
  },

  async byMsme(req, res, next) {
    try {
      const { msmeId } = req.params;
      const registrations = await RegistrationModel.findByMsmeId(msmeId);

      return sendSuccess(res, {
        message: 'Daftar registrasi UMKM berhasil diambil',
        data: registrations
      });
    } catch (err) {
      next(err);
    }
  },

  async byEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { status } = req.query;
      const registrations = await RegistrationModel.findByEventId(eventId, { status });

      return sendSuccess(res, {
        message: 'Daftar pendaftar event berhasil diambil',
        data: registrations
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const { msme_id, event_id } = req.body;

      const created = await RegistrationService.registerForEvent({
        msmeId: msme_id,
        eventId: event_id
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pendaftaran event berhasil dibuat',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw createHttpError(400, 'status wajib diisi');
      }

      const updated = await RegistrationService.updateStatus({
        registrationId: id,
        status,
        actor: req.user
      });

      return sendSuccess(res, {
        message: 'Status registrasi berhasil diperbarui',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};