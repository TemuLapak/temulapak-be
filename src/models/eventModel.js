import { supabase } from '../config/supabase.js';

export const EventModel = {
  async findAll({ city, province, theme } = {}) {
    let query = supabase
      .from('event')
      .select(`
        id,
        profile_id,
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
        banner,
        organizer:profiles!event_profile_id_fkey (
          id,
          name,
          phone,
          role
        )
      `)
      .order('start_date', { ascending: true });

    if (city) query = query.eq('city', city);
    if (province) query = query.eq('province', province);
    if (theme) query = query.eq('theme', theme);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('event')
      .select(`
        id,
        profile_id,
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
        banner,
        organizer:profiles!event_profile_id_fkey (
          id,
          name,
          phone,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByProfileId(profileId) {
    const { data, error } = await supabase
      .from('event')
      .select(`
        id,
        profile_id,
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
      `)
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(payload) {
    // payload: { profile_id, event_name, description, theme, location, city, province, start_date, end_date, registration_start, registration_end, booth_price, booth_quota, banner }
    const { data, error } = await supabase
      .from('event')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateById(id, payload) {
    const { data, error } = await supabase
      .from('event')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteById(id) {
    const { error } = await supabase
      .from('event')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};