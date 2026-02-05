import { supabase } from '@/services/supabase'

export const SignalementService = {
  /**
   * Create a new signalement.
   * If the table does not have user_id column yet (PGRST204), retries without user_id.
   * @param {object} data - The signalement data
   * @returns {Promise<{data: any[]|null, error: any}>}
   */
  async create(data) {
    let { data: resultData, error } = await supabase
      .from('signalements')
      .insert([data])
      .select()

    if (error && error.code === 'PGRST204' && error.message?.includes('user_id')) {
      console.warn(
        'Column user_id does not exist yet, retrying without it. Please run the migration SQL.'
      )
      const dataWithoutUserId = { ...data }
      delete dataWithoutUserId.user_id
      const retry = await supabase
        .from('signalements')
        .insert([dataWithoutUserId])
        .select()
      if (retry.error) return { data: null, error: retry.error }
      return { data: retry.data, error: null }
    }

    if (error) return { data: null, error }
    return { data: resultData, error: null }
  },

  /**
   * Fetch signalements for the current user in the given commune only.
   * Same pattern as reservations: filter by email and commune (city_id).
   * @param {string} communeId - Current commune ID (from getCityIdFromDatabase)
   * @param {string} userEmail - Current user email (from getUserContact)
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getMySignalementsInCommune(communeId, userEmail) {
    if (!communeId || !userEmail) {
      return { data: [], error: null }
    }

    const normalizedEmail = userEmail.trim().toLowerCase()
    return await supabase
      .from('signalements')
      .select('*')
      .eq('city_id', communeId)
      .eq('email', normalizedEmail)
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
