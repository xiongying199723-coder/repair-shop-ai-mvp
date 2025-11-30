// =====================================================
// SUPABASE DATABASE OPERATIONS
// Handles all interactions with Supabase backend
// =====================================================

/**
 * Database API for Supabase operations
 * Falls back to localStorage if Supabase is not available
 */
const SupabaseDB = {
  // =====================================================
  // LEADS OPERATIONS
  // =====================================================

  /**
   * Get all leads with optional filtering
   */
  async getLeads(filters = {}) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      // Fallback to localStorage
      return this._getLeadsFromLocalStorage(filters);
    }

    try {
      let query = client.from('leads').select('*');

      // Apply filters
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      // Order by created date descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      return this._getLeadsFromLocalStorage(filters);
    }
  },

  /**
   * Create a new lead
   */
  async createLead(leadData) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._createLeadInLocalStorage(leadData);
    }

    try {
      const { data, error } = await client
        .from('leads')
        .insert([{
          customer_name: leadData.customerName,
          phone: leadData.phone,
          email: leadData.email,
          car_make: leadData.carMake,
          car_model: leadData.carModel,
          car_year: leadData.carYear,
          issue: leadData.issue,
          status: leadData.status || 'New',
          source: leadData.source || 'Manual',
          quote_amount: leadData.quoteAmount || null,
          notes: leadData.notes || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add initial communication
      if (data) {
        await this.addCommunication(data.id, {
          sender: 'client',
          senderName: leadData.customerName,
          message: leadData.issue || 'Initial inquiry',
          type: 'initial_inquiry',
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating lead:', error);
      return this._createLeadInLocalStorage(leadData);
    }
  },

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId, newStatus, quoteAmount = null) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._updateLeadInLocalStorage(leadId, { status: newStatus, quoteAmount });
    }

    try {
      const updateData = { status: newStatus };
      if (quoteAmount !== null) {
        updateData.quote_amount = quoteAmount;
      }

      const { data, error } = await client
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      return this._updateLeadInLocalStorage(leadId, { status: newStatus, quoteAmount });
    }
  },

  /**
   * Delete a lead
   */
  async deleteLead(leadId) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._deleteLeadFromLocalStorage(leadId);
    }

    try {
      const { error } = await client
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return this._deleteLeadFromLocalStorage(leadId);
    }
  },

  // =====================================================
  // VOICE CALLS OPERATIONS
  // =====================================================

  /**
   * Get all voice calls
   */
  async getVoiceCalls(status = null) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._getVoiceCallsFromLocalStorage(status);
    }

    try {
      let query = client.from('voice_calls').select('*');

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching voice calls:', error);
      return this._getVoiceCallsFromLocalStorage(status);
    }
  },

  /**
   * Update voice call status
   */
  async updateVoiceCallStatus(callId, newStatus) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._updateVoiceCallInLocalStorage(callId, newStatus);
    }

    try {
      const { data, error } = await client
        .from('voice_calls')
        .update({ status: newStatus })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating voice call:', error);
      return this._updateVoiceCallInLocalStorage(callId, newStatus);
    }
  },

  /**
   * Create lead from voice call
   */
  async createLeadFromVoiceCall(callId) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._createLeadFromVoiceCallLocalStorage(callId);
    }

    try {
      // Call the database function
      const { data, error } = await client.rpc('create_lead_from_voice_call', {
        call_id: callId,
      });

      if (error) throw error;

      return data; // Returns the new lead ID
    } catch (error) {
      console.error('Error creating lead from voice call:', error);
      return this._createLeadFromVoiceCallLocalStorage(callId);
    }
  },

  // =====================================================
  // COMMUNICATIONS OPERATIONS
  // =====================================================

  /**
   * Get communications for a lead
   */
  async getCommunications(leadId) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._getCommunicationsFromLocalStorage(leadId);
    }

    try {
      const { data, error } = await client
        .from('communications')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching communications:', error);
      return this._getCommunicationsFromLocalStorage(leadId);
    }
  },

  /**
   * Add a communication to a lead
   */
  async addCommunication(leadId, commData) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return this._addCommunicationToLocalStorage(leadId, commData);
    }

    try {
      const { data, error } = await client
        .from('communications')
        .insert([{
          lead_id: leadId,
          sender: commData.sender,
          sender_name: commData.senderName,
          message: commData.message,
          type: commData.type || 'note',
          quote_amount: commData.quoteAmount || null,
          metadata: commData.metadata || null,
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding communication:', error);
      return this._addCommunicationToLocalStorage(leadId, commData);
    }
  },

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to new voice calls
   */
  subscribeToVoiceCalls(callback) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      console.log('Real-time subscriptions not available without Supabase');
      return null;
    }

    const subscription = client
      .channel('voice_calls_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_calls',
      }, (payload) => {
        console.log('New voice call received:', payload);
        callback(payload.new);
      })
      .subscribe();

    return subscription;
  },

  /**
   * Subscribe to lead updates
   */
  subscribeToLeads(callback) {
    const client = getSupabaseClient();

    if (!isSupabaseAvailable()) {
      return null;
    }

    const subscription = client
      .channel('leads_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads',
      }, (payload) => {
        console.log('Lead update received:', payload);
        callback(payload);
      })
      .subscribe();

    return subscription;
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(subscription) {
    if (subscription) {
      subscription.unsubscribe();
    }
  },

  // =====================================================
  // LOCALSTORAGE FALLBACK METHODS
  // =====================================================

  _getLeadsFromLocalStorage(filters) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');

    if (filters.status && filters.status !== 'All') {
      return leads.filter(lead => lead.status === filters.status);
    }

    return leads;
  },

  _createLeadInLocalStorage(leadData) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');

    const newLead = {
      id: Date.now(),
      customerName: leadData.customerName,
      phone: leadData.phone,
      email: leadData.email,
      carMake: leadData.carMake,
      carModel: leadData.carModel,
      carYear: leadData.carYear,
      issue: leadData.issue,
      status: leadData.status || 'New',
      source: leadData.source || 'Manual',
      quoteAmount: leadData.quoteAmount || null,
      timestamp: new Date().toISOString(),
      communications: [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sender: 'client',
        senderName: leadData.customerName,
        message: leadData.issue || 'Initial inquiry',
        type: 'initial_inquiry',
      }],
    };

    leads.push(newLead);
    localStorage.setItem('conneverse_leads', JSON.stringify(leads));

    return newLead;
  },

  _updateLeadInLocalStorage(leadId, updates) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');
    const leadIndex = leads.findIndex(lead => lead.id === leadId);

    if (leadIndex !== -1) {
      leads[leadIndex] = { ...leads[leadIndex], ...updates };
      localStorage.setItem('conneverse_leads', JSON.stringify(leads));
      return leads[leadIndex];
    }

    return null;
  },

  _deleteLeadFromLocalStorage(leadId) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');
    const filteredLeads = leads.filter(lead => lead.id !== leadId);
    localStorage.setItem('conneverse_leads', JSON.stringify(filteredLeads));
    return true;
  },

  _getVoiceCallsFromLocalStorage(status) {
    const calls = JSON.parse(localStorage.getItem('conneverse_missed_calls') || '[]');

    if (status) {
      return calls.filter(call => call.status === status);
    }

    return calls;
  },

  _updateVoiceCallInLocalStorage(callId, newStatus) {
    const calls = JSON.parse(localStorage.getItem('conneverse_missed_calls') || '[]');
    const callIndex = calls.findIndex(call => call.id === callId);

    if (callIndex !== -1) {
      calls[callIndex].status = newStatus;
      localStorage.setItem('conneverse_missed_calls', JSON.stringify(calls));
      return calls[callIndex];
    }

    return null;
  },

  _createLeadFromVoiceCallLocalStorage(callId) {
    const calls = JSON.parse(localStorage.getItem('conneverse_missed_calls') || '[]');
    const call = calls.find(c => c.id === callId);

    if (!call) return null;

    const leadData = {
      customerName: call.aiSummary.customerName,
      phone: call.phone,
      carMake: call.aiSummary.vehicle.make,
      carModel: call.aiSummary.vehicle.model,
      carYear: call.aiSummary.vehicle.year,
      issue: call.aiSummary.serviceNeeded,
      source: 'Voice AI',
      status: 'New',
      notes: call.aiSummary.notes,
    };

    const newLead = this._createLeadInLocalStorage(leadData);

    // Update call status
    this._updateVoiceCallInLocalStorage(callId, 'converted');

    return newLead.id;
  },

  _getCommunicationsFromLocalStorage(leadId) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');
    const lead = leads.find(l => l.id === leadId);

    return lead?.communications || [];
  },

  _addCommunicationToLocalStorage(leadId, commData) {
    const leads = JSON.parse(localStorage.getItem('conneverse_leads') || '[]');
    const leadIndex = leads.findIndex(l => l.id === leadId);

    if (leadIndex !== -1) {
      if (!leads[leadIndex].communications) {
        leads[leadIndex].communications = [];
      }

      const newComm = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sender: commData.sender,
        senderName: commData.senderName,
        message: commData.message,
        type: commData.type || 'note',
        quoteAmount: commData.quoteAmount || null,
      };

      leads[leadIndex].communications.push(newComm);
      localStorage.setItem('conneverse_leads', JSON.stringify(leads));

      return newComm;
    }

    return null;
  },
};
