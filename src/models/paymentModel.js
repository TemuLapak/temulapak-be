import { supabase } from '../config/supabase.js';

export const PaymentModel = {
  async findById(id) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        gateway,
        gateway_ref,
        method,
        status,
        paid_at,
        expires_at,
        registration_id,
        registration:event_registration!payments_registration_id_fkey (
          id,
          msme_id,
          event_id,
          status,
          registered_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByRegistrationId(registrationId) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        gateway,
        gateway_ref,
        method,
        status,
        paid_at,
        expires_at,
        registration_id
      `)
      .eq('registration_id', registrationId)
      .order('id', { ascending: false });

    if (error) throw error;
    return data;
  },

  async findByGatewayRef(gatewayRef) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        gateway,
        gateway_ref,
        method,
        status,
        paid_at,
        expires_at,
        registration_id
      `)
      .eq('gateway_ref', gatewayRef)
      .single();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateById(id, payload) {
    const { data, error } = await supabase
      .from('payments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id, { method, paid_at = new Date().toISOString() } = {}) {
    const updatePayload = {
      status: 'paid',
      paid_at
    };
    if (method) updatePayload.method = method;

    const { data, error } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};