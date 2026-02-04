import { supabase } from '@/services/supabase'

export const PropositionService = {
  /**
   * Fetch all propositions for a commune
   * @param {string} communeId - The ID of the commune
   * @param {string} sortBy - The field to sort by ('updated_at' or 'votes_count')
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getAll(communeId, sortBy = 'updated_at') {
    return await supabase
      .from('propositions')
      .select('*')
      .eq('commune_id', communeId)
      .eq('is_archived', false)
      .order(sortBy, { ascending: false })
  },

  /**
   * Fetch a single proposition by ID with its comments and user's vote status
   * @param {string} id - The proposition ID
   * @param {string} userId - The current user's ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id, userId) {
    // Get proposition
    const { data: proposition, error: propError } = await supabase
      .from('propositions')
      .select('*')
      .eq('id', id)
      .single()

    if (propError) return { data: null, error: propError }

    // Get comments
    const { data: comments, error: commError } = await supabase
      .from('proposition_comments')
      .select('*')
      .eq('proposition_id', id)
      .order('created_at', { ascending: true })

    // Check if current user has voted
    const { data: userVote, error: voteError } = await supabase
      .from('proposition_votes')
      .select('id')
      .eq('proposition_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    return {
      data: {
        ...proposition,
        comments: comments || [],
        has_voted: !!userVote
      },
      error: null
    }
  },

  /**
   * Create a new proposition
   * @param {object} propositionData - The proposition data
   * @returns {Promise<{data: any, error: any}>}
   */
  async create(propositionData) {
    return await supabase
      .from('propositions')
      .insert([propositionData])
      .select()
      .single()
  },

  /**
   * Update a proposition
   * @param {string} id - The proposition ID
   * @param {object} updates - The data to update
   * @returns {Promise<{data: any, error: any}>}
   */
  async update(id, updates) {
    return await supabase
      .from('propositions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  },

  /**
   * Delete a proposition
   * @param {string} id - The proposition ID
   * @returns {Promise<{error: any}>}
   */
  async delete(id) {
    return await supabase
      .from('propositions')
      .delete()
      .eq('id', id)
  },

  /**
   * Vote for a proposition
   * @param {string} propositionId - The proposition ID
   * @param {string} userId - The user ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async vote(propositionId, userId) {
    // 1. Check if already voted (redundant with UNIQUE constraint but cleaner error handling)
    const { data: existingVote } = await supabase
      .from('proposition_votes')
      .select('id')
      .eq('proposition_id', propositionId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingVote) return { data: null, error: { message: 'Already voted' } }

    // 2. Insert vote
    const { error: voteError } = await supabase
      .from('proposition_votes')
      .insert([{ proposition_id: propositionId, user_id: userId }])

    if (voteError) return { data: null, error: voteError }

    // 3. Increment vote count on proposition
    const { data, error } = await supabase.rpc('increment_votes', { proposition_id: propositionId })
    
    // If RPC doesn't exist, fallback to manual increment (less atomic but works for now)
    if (error) {
        const { data: prop } = await supabase.from('propositions').select('votes_count').eq('id', propositionId).single()
        return await supabase
            .from('propositions')
            .update({ votes_count: (prop.votes_count || 0) + 1 })
            .eq('id', propositionId)
            .select()
            .single()
    }

    if (data || !error) {
      // Trigger notification in background
      this.notify(propositionId, 'vote').catch(err => console.error('Notify error:', err))
    }

    return { data, error }
  },

  /**
   * Remove vote for a proposition (unvote)
   * @param {string} propositionId - The proposition ID
   * @param {string} userId - The user ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async unvote(propositionId, userId) {
    const { data: existingVote, error: findError } = await supabase
      .from('proposition_votes')
      .select('id')
      .eq('proposition_id', propositionId)
      .eq('user_id', userId)
      .maybeSingle()

    if (findError) return { data: null, error: findError }
    if (!existingVote) return { data: null, error: { message: 'No vote to remove' } }

    const { error: deleteError } = await supabase
      .from('proposition_votes')
      .delete()
      .eq('proposition_id', propositionId)
      .eq('user_id', userId)

    if (deleteError) return { data: null, error: deleteError }

    const { data: prop } = await supabase
      .from('propositions')
      .select('votes_count')
      .eq('id', propositionId)
      .single()

    const newCount = Math.max(0, (prop?.votes_count ?? 1) - 1)
    const { data, error } = await supabase
      .from('propositions')
      .update({ votes_count: newCount, updated_at: new Date().toISOString() })
      .eq('id', propositionId)
      .select()
      .single()

    return { data, error }
  },

  /**
   * Add a comment to a proposition
   * @param {object} commentData - The comment data (proposition_id, user_firstname, user_lastname, user_email, content)
   * @returns {Promise<{data: any, error: any}>}
   */
  async addComment(commentData) {
    const result = await supabase
      .from('proposition_comments')
      .insert([commentData])
      .select()
      .single()
    
    if (result.data && !result.error) {
       // Trigger notification in background
       this.notify(commentData.proposition_id, 'comment', commentData.content).catch(err => console.error('Notify error:', err))
    }
    
    return result
  },

  /**
   * Notify the creator of a proposition about a new vote or comment
   * @param {string} propositionId - The proposition ID
   * @param {'vote' | 'comment'} type - The notification type
   * @param {string} [commentContent] - The comment content
   */
  async notify(propositionId, type, commentContent) {
    try {
      const apiUrl = import.meta.env.VITE_BACKOFFICE_API_URL
      if (!apiUrl) {
        console.warn('VITE_BACKOFFICE_API_URL not defined, skipping notification')
        return
      }

      await fetch(`${apiUrl}/api/propositions/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposition_id: propositionId,
          type,
          comment_content: commentContent
        })
      })
    } catch (error) {
      console.error('Failed to send notification via BackOffice API:', error)
    }
  }
}
