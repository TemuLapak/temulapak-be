import { supabase } from '../config/supabase.js';

export const VerificationModel = {
  async findAll({ status, type, profileId } = {}) {
    let query = supabase
      .from('verification')
      .select(`
        id,
        profile_id,
        type,
        document,
        status,
        reviewed_by,
        notes,
        reviewed_at,
        applicant:profiles!verification_profile_id_fkey (
          id,
          name,
          phone,
          role
        ),
        reviewer:profiles!verification_reviewed_by_fkey (
          id,
          name
        )
      `)
      .order('id', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (profileId) query = query.eq('profile_id', profileId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('verification')
      .select(`
        id,
        profile_id,
        type,
        document,
        status,
        reviewed_by,
        notes,
        reviewed_at,
        applicant:profiles!verification_profile_id_fkey (
          id,
          name,
          phone
        ),
        reviewer:profiles!verification_reviewed_by_fkey (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('verification')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reviewById(id, { status, reviewed_by, notes = null, reviewed_at = new Date().toISOString() }) {
    const { data, error } = await supabase
      .from('verification')
      .update({
        status,
        reviewed_by,
        notes,
        reviewed_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};