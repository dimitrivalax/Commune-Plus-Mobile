import { supabase } from '@/services/supabase'

export const SignalementService = {
  /**
   * Fetch all signalements for a specific user
   * @param {string} userId - The ID of the user
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAll(userId) {
    return await supabase
      .from('signalements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  /**
   * Fetch a single signalement by ID
   * @param {string} id - The ID of the signalement
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id) {
    return await supabase
      .from('signalements')
      .select('*')
      .eq('id', id)
      .single()
  },

  /**
   * Update a signalement
   * @param {string} id - The ID of the signalement
   * @param {object} updates - The data to update
   * @returns {Promise<{data: any, error: any}>}
   */
  async update(id, updates) {
    return await supabase
      .from('signalements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  /**
   * Archive a signalement
   * @param {string} id - The ID of the signalement
   * @returns {Promise<{data: any, error: any}>}
   */
  async archive(id) {
    return await supabase
      .from('signalements')
      .update({ status: 'archive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
  }
}
