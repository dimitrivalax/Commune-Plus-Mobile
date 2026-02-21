import { supabase } from '@/services/supabase'

const INITIAL_FUTURE = 10
const LOAD_MORE_SIZE = 10

export const InformationService = {
  /**
   * Fetch all municipal information for a commune (pour la page détail)
   * @param {string|null} communeId - ID de la commune
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAll(communeId = null) {
    if (!communeId) {
      return { data: [], error: null }
    }
    return await supabase
      .from('municipal_info')
      .select('*')
      .or(`commune_id.eq.${communeId},commune_id.is.null`)
      .order('event_date', { ascending: false })
  },

  /**
   * Chargement initial : uniquement les 10 prochaines infos (à partir d'aujourd'hui).
   * Le passé se charge au scroll vers le haut.
   * @param {string|null} communeId - ID de la commune
   * @param {string} todayIso - Date du jour au format YYYY-MM-DD
   * @returns {Promise<{data: any[], error: any, hasMoreOlder: boolean, hasMoreNewer: boolean}>}
   */
  async getInitial(communeId = null, todayIso = null) {
    if (!communeId) {
      return { data: [], error: null, hasMoreOlder: false, hasMoreNewer: false }
    }
    const today = todayIso || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .or(`commune_id.eq.${communeId},commune_id.is.null`)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(INITIAL_FUTURE)

    const list = data || []
    return {
      data: list,
      error,
      hasMoreOlder: true,
      hasMoreNewer: list.length === INITIAL_FUTURE
    }
  },

  /**
   * Charge des infos plus anciennes (event_date < beforeDateIso)
   * @param {string|null} communeId - ID de la commune
   * @param {string} beforeDateIso - Date limite (exclue)
   * @param {number} limit - Nombre d'éléments
   * @returns {Promise<{data: any[], error: any, hasMore: boolean}>}
   */
  async getOlderThan(communeId, beforeDateIso, limit = LOAD_MORE_SIZE) {
    if (!communeId) {
      return { data: [], error: null, hasMore: false }
    }
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .or(`commune_id.eq.${communeId},commune_id.is.null`)
      .lt('event_date', beforeDateIso)
      .order('event_date', { ascending: false })
      .limit(limit)
    const list = data || []
    const ascending = [...list].reverse()
    return { data: ascending, error, hasMore: list.length === limit }
  },

  /**
   * Charge des infos plus récentes (event_date > afterDateIso)
   * @param {string|null} communeId - ID de la commune
   * @param {string} afterDateIso - Date limite (exclue)
   * @param {number} limit - Nombre d'éléments
   * @returns {Promise<{data: any[], error: any, hasMore: boolean}>}
   */
  async getNewerThan(communeId, afterDateIso, limit = LOAD_MORE_SIZE) {
    if (!communeId) {
      return { data: [], error: null, hasMore: false }
    }
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .or(`commune_id.eq.${communeId},commune_id.is.null`)
      .gt('event_date', afterDateIso)
      .order('event_date', { ascending: true })
      .limit(limit)
    return { data: data || [], error, hasMore: (data || []).length === limit }
  },

  /**
   * Fetch a single municipal information item by ID, optionally restricted to a commune
   * @param {string} id - The ID of the item
   * @param {string|null} communeId - ID de la commune (si fourni, vérifie que l'info appartient à cette commune)
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id, communeId = null) {
    if (!communeId) {
      return { data: null, error: { message: 'Commune non sélectionnée' } }
    }
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .eq('id', id)
      .or(`commune_id.eq.${communeId},commune_id.is.null`)
      .single()
    return { data, error }
  }
}
