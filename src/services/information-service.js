import { supabase } from '@/services/supabase'

export const InformationService = {
  /**
   * Fetch all municipal information
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAll() {
    return await supabase
      .from('municipal_info')
      .select('*')
      .order('created_at', { ascending: false })
  },

  /**
   * Fetch a single municipal information item by ID
   * @param {string} id - The ID of the item
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id) {
    return await supabase
      .from('municipal_info')
      .select('*')
      .eq('id', id)
      .single()
  }
}
