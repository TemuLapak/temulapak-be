import { supabase } from '../config/supabase.js';

export const RegistrationModel = {
  async findById(id) {
    const { data, error } = await supabase
      .from('event_registration')
      .select(`
        id,
        msme_id,
        event_id,
        status,
        registered_at,
        msme:msme!event_registration_msme_id_fkey (
          id,
          profile_id,
          msme_name,
          category,
          city,
          province
        ),
        event:event!event_registration_event_id_fkey (
          id,
          profile_id,
          event_name,
          location,
          city,
          province,
          start_date,
          end_date,
          booth_price,
          booth_quota
        ),
        payments (
          id,
          amount,
          gateway,
          gateway_ref,
          method,
          status,
          paid_at,
          expires_at,
          registration_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByMsmeAndEvent(msmeId, eventId) {
    const { data, error } = await supabase
      .from('event_registration')
      .select(`
        id,
        msme_id,
        event_id,
        status,
        registered_at
      `)
      .eq('msme_id', msmeId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async findByMsmeId(msmeId) {
    const { data, error } = await supabase
      .from('event_registration')
      .select(`
        id,
        msme_id,
        event_id,
        status,
        registered_at,
        event:event!event_registration_event_id_fkey (
          id,
          event_name,
          theme,
          location,
          city,
          province,
          start_date,
          end_date,
          booth_price,
          banner
        ),
        payments (
          id,
          amount,
          status,
          paid_at,
          expires_at
        )
      `)
      .eq('msme_id', msmeId)
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async findByEventId(eventId, { status } = {}) {
    let query = supabase
      .from('event_registration')
      .select(`
        id,
        msme_id,
        event_id,
        status,
        registered_at,
        msme:msme!event_registration_msme_id_fkey (
          id,
          profile_id,
          msme_name,
          category,
          city,
          province
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async countByEventId(eventId, { excludeStatuses = [] } = {}) {
    let query = supabase
      .from('event_registration')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    for (const st of excludeStatuses) {
      query = query.neq('status', st);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('event_registration')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('event_registration')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};