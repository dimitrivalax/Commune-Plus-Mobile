import { supabase } from '@/services/supabase'

export const ReservationService = {
  /**
   * Fetch all reservations with hall details
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAll() {
    return await supabase
      .from('reservations_salles')
      .select(`
        *,
        salle:salles(id, nom)
      `)
      .order('date', { ascending: false })
  },

  /**
   * Fetch a single reservation by ID
   * @param {string} id - The ID of the reservation
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id) {
    return await supabase
      .from('reservations_salles')
      .select(`
        *,
        salle:salles(id, nom)
      `)
      .eq('id', id)
      .single()
  },

  /**
   * Create a new reservation
   * @param {object} reservationData - The reservation data
   * @returns {Promise<{data: any, error: any}>}
   */
  async create(reservationData) {
    return await supabase
      .from('reservations_salles')
      .insert([reservationData])
      .select()
  },

  /**
   * Update a reservation
   * @param {string} id - The reservation ID
   * @param {string} email - The user's email (for security check)
   * @param {object} updates - The data to update
   * @returns {Promise<{data: any, error: any}>}
   */
  async update(id, email, updates) {
    return await supabase
      .from('reservations_salles')
      .update(updates)
      .eq('id', id)
      .eq('email', email.toLowerCase())
      .select()
      .single()
  },

  /**
   * Delete a reservation
   * @param {string} id - The reservation ID
   * @param {string} email - The user's email (for security check)
   * @returns {Promise<{error: any}>}
   */
  async delete(id, email) {
    return await supabase
      .from('reservations_salles')
      .delete()
      .eq('id', id)
      .eq('email', email.toLowerCase())
  },

  /**
   * Fetch available halls (salles), optionally filtered by commune
   * @param {string} [communeId] - Optional commune ID to filter by
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getSalles(communeId = null) {
    let query = supabase
      .from('salles')
      .select('id, nom')
      
    if (communeId) {
      query = query.eq('commune_id', communeId)
    }
    
    return await query.order('nom', { ascending: true })
  }
}
