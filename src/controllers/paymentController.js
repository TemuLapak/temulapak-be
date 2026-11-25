import { PaymentModel } from '../models/paymentModel.js';
import { RegistrationModel } from '../models/registrationModel.js';

export const PaymentController = {
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.findById(id);

      return res.status(200).json({
        success: true,
        data: payment
      });
    } catch (err) {
      if (err?.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Data pembayaran tidak ditemukan'
        });
      }
      next(err);
    }
  },

  async byRegistration(req, res, next) {
    try {
      const { registrationId } = req.params;
      const payments = await PaymentModel.findByRegistrationId(registrationId);

      return res.status(200).json({
        success: true,
        data: payments
      });
    } catch (err) {
      next(err);
    }
  },

  async store(req, res, next) {
    try {
      const {
        registration_id,
        amount,
        gateway,
        gateway_ref,
        method,
        expires_at
      } = req.body;

      if (!registration_id) {
        return res.status(400).json({
          success: false,
          message: 'registration_id wajib diisi'
        });
      }

      const registration = await RegistrationModel.findById(registration_id).catch(() => null);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registrasi tidak ditemukan'
        });
      }

      const finalAmount = amount ?? registration.event?.booth_price ?? 0;

      const created = await PaymentModel.create({
        registration_id,
        amount: Number(finalAmount),
        gateway: gateway ?? null,
        gateway_ref: gateway_ref ?? null,
        method: method ?? null,
        status: 'pending',
        expires_at: expires_at ?? null
      });

      return res.status(201).json({
        success: true,
        message: 'Tagihan pembayaran berhasil dibuat',
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  async markPaid(req, res, next) {
    try {
      const { id } = req.params;
      const { method, paid_at } = req.body;

      const updatedPayment = await PaymentModel.markAsPaid(id, { method, paid_at });

      if (updatedPayment.registration_id) {
        await RegistrationModel.updateStatus(updatedPayment.registration_id, 'approved');
      }

      return res.status(200).json({
        success: true,
        message: 'Pembayaran berhasil dikonfirmasi',
        data: updatedPayment
      });
    } catch (err) {
      next(err);
    }
  },

  async webhook(req, res, next) {
    try {
      const { gateway_ref, status, method, paid_at } = req.body;

      if (!gateway_ref || !status) {
        return res.status(400).json({
          success: false,
          message: 'gateway_ref dan status wajib diisi'
        });
      }

      const payment = await PaymentModel.findByGatewayRef(gateway_ref).catch(() => null);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi dengan gateway_ref tersebut tidak ditemukan'
        });
      }

      const updatePayload = { status };
      if (method) updatePayload.method = method;
      if (status === 'paid') {
        updatePayload.paid_at = paid_at || new Date().toISOString();
      }

      const updatedPayment = await PaymentModel.updateById(payment.id, updatePayload);

      if (status === 'paid' && updatedPayment.registration_id) {
        await RegistrationModel.updateStatus(updatedPayment.registration_id, 'paid');
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook pembayaran diproses',
        data: updatedPayment
      });
    } catch (err) {
      next(err);
    }
  }
};