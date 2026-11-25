import { RegistrationModel } from '../models/registrationModel.js';
import { EventModel } from '../models/eventModel.js';
import { MsmeModel } from '../models/msmeModel.js';
import {
  ROLES,
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_VALUES
} from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';

export const RegistrationService = {
  async registerForEvent({ msmeId, eventId }) {
    if (!msmeId || !eventId) {
      throw createHttpError(400, 'msme_id dan event_id wajib diisi');
    }

    // 1. Pastikan UMKM ada
    const msme = await MsmeModel.findById(msmeId).catch(() => null);
    if (!msme) {
      throw createHttpError(404, 'Data UMKM tidak ditemukan');
    }

    // 2. Pastikan Event ada
    const event = await EventModel.findById(eventId).catch(() => null);
    if (!event) {
      throw createHttpError(404, 'Event tidak ditemukan');
    }

    // 3. Cek apakah UMKM sudah pernah mendaftar pada event ini
    const existing = await RegistrationModel.findByMsmeAndEvent(msmeId, eventId);
    if (existing) {
      throw createHttpError(409, 'UMKM sudah terdaftar pada event ini');
    }

    // 4. Validasi periode pendaftaran
    const now = new Date();
    if (now < new Date(event.registration_start) || now > new Date(event.registration_end)) {
      throw createHttpError(400, 'Pendaftaran event berada di luar periode yang dibuka');
    }

    // 5. Validasi kuota booth
    const activeRegistrations = await RegistrationModel.countByEventId(eventId, {
      excludeStatuses: [
        REGISTRATION_STATUSES.CANCELLED,
        REGISTRATION_STATUSES.REJECTED
      ]
    });
    if (activeRegistrations >= event.booth_quota) {
      throw createHttpError(400, 'Kuota booth event sudah penuh');
    }

    // 6. Simpan registrasi dengan status awal 'pending'
    return RegistrationModel.create({
      msme_id: msmeId,
      event_id: eventId,
      status: REGISTRATION_STATUSES.PENDING
    });
  },

  async updateStatus({ registrationId, status, actor }) {
    if (!REGISTRATION_STATUS_VALUES.includes(status)) {
      throw createHttpError(
        400,
        `Status registrasi tidak valid (${REGISTRATION_STATUS_VALUES.join(', ')})`
      );
    }

    const registration = await RegistrationModel.findById(registrationId).catch(() => null);
    if (!registration) {
      throw createHttpError(404, 'Data registrasi tidak ditemukan');
    }

    // Jika diubah oleh EO, pastikan EO tersebut pemilik event
    if (actor?.role === ROLES.EO && registration.event?.profile_id !== actor.id) {
      throw createHttpError(403, 'Anda hanya dapat mengubah status pendaftar pada event milik Anda');
    }

    // Jika disetujui (approved), cek lagi agar kuota tidak melewati booth_quota
    if (
      status === REGISTRATION_STATUSES.APPROVED &&
      registration.status !== REGISTRATION_STATUSES.APPROVED
    ) {
      const approvedCount = await RegistrationModel.countByEventId(registration.event_id, {
        excludeStatuses: [
          REGISTRATION_STATUSES.PENDING,
          REGISTRATION_STATUSES.CANCELLED,
          REGISTRATION_STATUSES.REJECTED
        ]
      });
      const quota = registration.event?.booth_quota ?? 0;
      if (approvedCount >= quota) {
        throw createHttpError(400, 'Kuota booth yang disetujui sudah penuh');
      }
    }

    return RegistrationModel.updateStatus(registrationId, status);
  }
};