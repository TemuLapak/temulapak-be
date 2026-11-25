import { PaymentModel } from '../models/paymentModel.js';
import { RegistrationModel } from '../models/registrationModel.js';
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
  REGISTRATION_STATUSES
} from '../utils/enum.js';
import { createHttpError } from '../utils/httpError.js';

export const PaymentService = {
  async createPayment({ registrationId, amount, gateway, gatewayRef, method, expiresAt }) {
    if (!registrationId) {
      throw createHttpError(400, 'registration_id wajib diisi');
    }

    const registration = await RegistrationModel.findById(registrationId).catch(() => null);
    if (!registration) {
      throw createHttpError(404, 'Data registrasi tidak ditemukan');
    }

    if (
      registration.status === REGISTRATION_STATUSES.CANCELLED ||
      registration.status === REGISTRATION_STATUSES.REJECTED
    ) {
      throw createHttpError(
        400,
        'Tidak dapat membuat pembayaran untuk registrasi yang dibatalkan/ditolak'
      );
    }

    const finalAmount =
      amount != null ? Number(amount) : Number(registration.event?.booth_price ?? 0);
    if (Number.isNaN(finalAmount) || finalAmount < 0) {
      throw createHttpError(400, 'Nominal pembayaran tidak valid');
    }

    return PaymentModel.create({
      registration_id: registrationId,
      amount: finalAmount,
      gateway: gateway ?? null,
      gateway_ref: gatewayRef ?? null,
      method: method ?? null,
      status: PAYMENT_STATUSES.PENDING,
      expires_at: expiresAt ?? null
    });
  },

  async confirmPaid({ paymentId, method, paidAt }) {
    const payment = await PaymentModel.findById(paymentId).catch(() => null);
    if (!payment) {
      throw createHttpError(404, 'Data pembayaran tidak ditemukan');
    }

    if (payment.status === PAYMENT_STATUSES.PAID) {
      return payment;
    }

    const updatedPayment = await PaymentModel.markAsPaid(paymentId, {
      method: method ?? payment.method,
      paid_at: paidAt || new Date().toISOString()
    });

    if (updatedPayment.registration_id) {
      await RegistrationModel.updateStatus(
        updatedPayment.registration_id,
        REGISTRATION_STATUSES.APPROVED
      );
    }

    return updatedPayment;
  },

  async handleWebhook({ gatewayRef, status, method, paidAt }) {
    if (!gatewayRef || !status) {
      throw createHttpError(400, 'gateway_ref dan status wajib diisi');
    }

    if (!PAYMENT_STATUS_VALUES.includes(status)) {
      throw createHttpError(
        400,
        `Status pembayaran tidak valid (${PAYMENT_STATUS_VALUES.join(', ')})`
      );
    }

    const payment = await PaymentModel.findByGatewayRef(gatewayRef).catch(() => null);
    if (!payment) {
      throw createHttpError(404, 'Pembayaran dengan gateway_ref tersebut tidak ditemukan');
    }

    const updatePayload = { status };
    if (method) updatePayload.method = method;
    if (status === PAYMENT_STATUSES.PAID) {
      updatePayload.paid_at = paidAt || payment.paid_at || new Date().toISOString();
    }

    const updatedPayment = await PaymentModel.updateById(payment.id, updatePayload);

    if (status === PAYMENT_STATUSES.PAID && updatedPayment.registration_id) {
      await RegistrationModel.updateStatus(
        updatedPayment.registration_id,
        REGISTRATION_STATUSES.APPROVED
      );
    }

    return updatedPayment;
  }
};