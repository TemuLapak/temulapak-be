import { supabase } from '../config/supabase.js';

export const MsmeModel = {
  async findById(id) {
    const { data, error } = await supabase
      .from('msme')
      .select(`
        id,
        profile_id,
        msme_name,
        description,
        category,
        city,
        province,
        profile:profiles!msme_profile_id_fkey (
          id,
          name,
          phone
        ),
        products:msme_product (
          id,
          product_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByProfileId(profileId) {
    const { data, error } = await supabase
      .from('msme')
      .select(`
        id,
        profile_id,
        msme_name,
        description,
        category,
        city,
        province,
        products:msme_product (
          id,
          product_name
        )
      `)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('msme')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateById(id, payload) {
    const { data, error } = await supabase
      .from('msme')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProductsByMsmeId(msmeId) {
    const { data, error } = await supabase
      .from('msme_product')
      .select('id, msme_id, product_name')
      .eq('msme_id', msmeId);

    if (error) throw error;
    return data;
  },

  async addProduct({ msme_id, product_name }) {
    const { data, error } = await supabase
      .from('msme_product')
      .insert([{ msme_id, product_name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeProduct(productId, msmeId) {
    const { error } = await supabase
      .from('msme_product')
      .delete()
      .eq('id', productId)
      .eq('msme_id', msmeId);

    if (error) throw error;
    return true;
  }
};