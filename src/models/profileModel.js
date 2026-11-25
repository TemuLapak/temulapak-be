import { supabase } from '../config/supabase.js';

export const ProfileModel = {
  async findById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, phone, role')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(payload) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' })
      .select('id, name, phone, role')
      .single();

    if (error) throw error;
    return data;
  },

  async updateById(id, payload) {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select('id, name, phone, role')
      .single();

    if (error) throw error;
    return data;
  }
};