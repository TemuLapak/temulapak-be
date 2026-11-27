import { VerificationModel } from '../models/verificationModel.js';
import { VerificationService } from '../services/verificationService.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/responHelper.js';

export const VerificationController = {
  async index(req, res, next) {
    try {
      const { status, type, profile_id } = req.query;
      const verifications = await VerificationModel.findAll({
        status,
        type,
        profileId: profile_id
      });

      return sendSuccess(res, {
        message: 'Daftar verifikasi berhasil diambil',
        data: verifications
      });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const verification = await VerificationModel.findById(id).catch(() => null);

      if (!verification) {
        throw createHttpError(404, 'Data verifikasi tidak ditemukan');
      }

      return sendSuccess(res, {
        message: 'Detail verifikasi berhasil diambil',
        data: verification
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const profileId = req.user?.id || req.body.profile_id;
      const { type, document } = req.body;

      const created = await VerificationService.submitVerification({
        profileId,
        type,
        document
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pengajuan verifikasi berhasil dikirim',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async review(req, res, next) {
    try {
      const { id } = req.params;
      const reviewerId = req.user?.id || req.body.reviewed_by;
      const { status, notes } = req.body;

      const reviewed = await VerificationService.reviewVerification({
        verificationId: id,
        reviewerId,
        status,
        notes
      });

      return sendSuccess(res, {
        message: 'Hasil review verifikasi berhasil disimpan',
        data: reviewed
      });
    } catch (err) {
      next(err);
    }
  }
};