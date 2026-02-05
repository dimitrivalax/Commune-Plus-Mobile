import { supabase } from '@/services/supabase'

/**
 * Derive a deterministic UUID from an email (for fallback when proposition_votes has no email column).
 * Same email always returns the same UUID so one person = one vote.
 * @param {string} email - Normalized email
 * @returns {Promise<string>} UUID string
 */
async function userIdFromEmail(email) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(email.toLowerCase().trim())
  )
  const hex = Array.from(new Uint8Array(buf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

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
   * Fetch a single proposition by ID with its comments and user's vote status.
   * Vote status is determined by user email (from getUserContact).
   * @param {string} id - The proposition ID
   * @param {string} [userEmail] - The current user's email (optional; if missing, has_voted will be false)
   * @returns {Promise<{data: any, error: any}>}
   */
  async getById(id, userEmail) {
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

    // Check if current user has voted (by email, or by user_id if schema has no email column)
    let hasVoted = false
    const emailNormalized =
      userEmail && typeof userEmail === 'string'
        ? userEmail.trim().toLowerCase()
        : null
    if (emailNormalized) {
      let { data: userVote, error: voteErr } = await supabase
        .from('proposition_votes')
        .select('id')
        .eq('proposition_id', id)
        .eq('email', emailNormalized)
        .maybeSingle()
      if (voteErr && voteErr.code === 'PGRST204' && voteErr.message?.includes('email')) {
        const uid = await userIdFromEmail(emailNormalized)
        const retry = await supabase
          .from('proposition_votes')
          .select('id')
          .eq('proposition_id', id)
          .eq('user_id', uid)
          .maybeSingle()
        userVote = retry.data
      }
      hasVoted = !!userVote
    }

    return {
      data: {
        ...proposition,
        comments: comments || [],
        has_voted: hasVoted
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
   * Vote for a proposition (identified by email).
   * @param {string} propositionId - The proposition ID
   * @param {string} userEmail - The user's email
   * @returns {Promise<{data: any, error: any}>}
   */
  async vote(propositionId, userEmail) {
    const emailNormalized =
      userEmail && typeof userEmail === 'string'
        ? userEmail.trim().toLowerCase()
        : null
    if (!emailNormalized) {
      return { data: null, error: { message: 'Email requis pour voter' } }
    }

    // 1. Check if already voted (by email, or by user_id if schema has no email)
    let { data: existingVote, error: checkErr } = await supabase
      .from('proposition_votes')
      .select('id')
      .eq('proposition_id', propositionId)
      .eq('email', emailNormalized)
      .maybeSingle()

    if (checkErr && checkErr.code === 'PGRST204' && checkErr.message?.includes('email')) {
      const uid = await userIdFromEmail(emailNormalized)
      const retry = await supabase
        .from('proposition_votes')
        .select('id')
        .eq('proposition_id', propositionId)
        .eq('user_id', uid)
        .maybeSingle()
      existingVote = retry.data
    }
    if (existingVote) return { data: null, error: { message: 'Already voted' } }

    // 2. Insert vote (email, or user_id if schema has no email column)
    let votePayload = { proposition_id: propositionId, email: emailNormalized }
    let { error: voteError } = await supabase
      .from('proposition_votes')
      .insert([votePayload])

    if (voteError && voteError.code === 'PGRST204' && voteError.message?.includes('email')) {
      const uid = await userIdFromEmail(emailNormalized)
      votePayload = { proposition_id: propositionId, user_id: uid }
      const retry = await supabase.from('proposition_votes').insert([votePayload])
      voteError = retry.error
    }
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
   * Remove vote for a proposition (unvote), identified by email.
   * @param {string} propositionId - The proposition ID
   * @param {string} userEmail - The user's email
   * @returns {Promise<{data: any, error: any}>}
   */
  async unvote(propositionId, userEmail) {
    const emailNormalized =
      userEmail && typeof userEmail === 'string'
        ? userEmail.trim().toLowerCase()
        : null
    if (!emailNormalized) {
      return { data: null, error: { message: 'Email requis' } }
    }

    let { data: existingVote, error: findError } = await supabase
      .from('proposition_votes')
      .select('id')
      .eq('proposition_id', propositionId)
      .eq('email', emailNormalized)
      .maybeSingle()

    let deleteFilter = { proposition_id: propositionId, email: emailNormalized }
    if (findError && findError.code === 'PGRST204' && findError.message?.includes('email')) {
      const uid = await userIdFromEmail(emailNormalized)
      const retry = await supabase
        .from('proposition_votes')
        .select('id')
        .eq('proposition_id', propositionId)
        .eq('user_id', uid)
        .maybeSingle()
      findError = retry.error
      existingVote = retry.data
      deleteFilter = { proposition_id: propositionId, user_id: uid }
    }
    if (findError) return { data: null, error: findError }
    if (!existingVote) return { data: null, error: { message: 'No vote to remove' } }

    let deleteError
    if (deleteFilter.email !== undefined) {
      const res = await supabase
        .from('proposition_votes')
        .delete()
        .eq('proposition_id', propositionId)
        .eq('email', emailNormalized)
      deleteError = res.error
    } else {
      const res = await supabase
        .from('proposition_votes')
        .delete()
        .eq('proposition_id', propositionId)
        .eq('user_id', deleteFilter.user_id)
      deleteError = res.error
    }

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

      const body = {
        proposition_id: propositionId,
        type
      }
      if (commentContent != null && commentContent !== '') {
        body.comment_content = commentContent
      }
      await fetch(`${apiUrl}/api/propositions/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    } catch (error) {
      console.error('Failed to send notification via BackOffice API:', error)
    }
  }
}
