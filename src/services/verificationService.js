import { VerificationModel } from '../models/verificationModel.js';
import {
  VERIFICATION_TYPES,
  REGISTRATION_STATUSES
} from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';

const REVIEW_STATUSES = Object.freeze([
  REGISTRATION_STATUSES.APPROVED,
  REGISTRATION_STATUSES.REJECTED,
  REGISTRATION_STATUSES.PENDING
]);

export const VerificationService = {
  async submitVerification({ profileId, type, document }) {
    if (!profileId || !type || !document) {
      throw createHttpError(400, 'profile_id, type, dan document wajib diisi');
    }

    if (!VERIFICATION_TYPES.includes(type)) {
      throw createHttpError(
        400,
        `Tipe verifikasi tidak valid (${VERIFICATION_TYPES.join(', ')})`
      );
    }

    return VerificationModel.create({
      profile_id: profileId,
      type,
      document,
      status: REGISTRATION_STATUSES.PENDING
    });
  },

  async reviewVerification({ verificationId, reviewerId, status, notes }) {
    if (!reviewerId || !status) {
      throw createHttpError(400, 'reviewed_by dan status wajib diisi');
    }

    if (!REVIEW_STATUSES.includes(status)) {
      throw createHttpError(
        400,
        `Status review tidak valid (${REVIEW_STATUSES.join(', ')})`
      );
    }

    const existing = await VerificationModel.findById(verificationId).catch(() => null);
    if (!existing) {
      throw createHttpError(404, 'Data verifikasi tidak ditemukan');
    }

    return VerificationModel.reviewById(verificationId, {
      status,
      reviewed_by: reviewerId,
      notes: notes ?? null,
      reviewed_at: new Date().toISOString()
    });
  }
};