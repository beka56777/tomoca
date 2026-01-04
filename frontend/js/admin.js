// frontend/js/admin.js
// Functions used by admin/dashboard/tickets/ticket pages.
// Add ?admin=YOUR_SECRET in URL to enable admin actions
(function () {
  const API_BASE = 'https://tomoca.onrender.com';
  
  // Get admin secret from URL or localStorage
  function getAdminSecret() {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('admin');
    
    if (secret) {
      // Store in localStorage for convenience
      localStorage.setItem('adminSecret', secret);
      return secret;
    }
    
    // Try to get from localStorage
    return localStorage.getItem('adminSecret') || '';
  }
  
  const ADMIN_SECRET = getAdminSecret();
  const adminHeaders = ADMIN_SECRET ? { 
    'x-admin-secret': ADMIN_SECRET,
    'Content-Type': 'application/json'
  } : {};
  
  // Fetch all tickets with filters and pagination
  async function fetchTickets({ status = '', department = '', q = '', page = 1, limit = 20 } = {}) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (department) params.append('department', department);
      if (q) params.append('q', q);
      params.append('page', page);
      params.append('limit', limit);
      
      const res = await fetch(`${API_BASE}/tickets?${params.toString()}`, { 
        headers: adminHeaders 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return { 
        success: false, 
        error: error.message,
        tickets: [],
        total: 0
      };
    }
  }
  
  // Fetch single ticket by ID
  async function fetchTicketById(id) {
    try {
      const res = await fetch(`${API_BASE}/ticket?id=${encodeURIComponent(id)}`, { 
        headers: adminHeaders 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return { 
        success: false, 
        error: error.message,
        ticket: null
      };
    }
  }
  
  // Update ticket status or other fields
  async function updateTicketStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/update-ticket`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ 
          id: id, 
          updates: { status: status } 
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }
  
  // Delete ticket
  async function deleteTicket(id) {
    try {
      const res = await fetch(`${API_BASE}/ticket?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  }
  
  // Fetch all tickets without pagination (for dashboard stats)
  async function fetchAllTickets() {
    try {
      const res = await fetch(`${API_BASE}/tickets?limit=1000`, { 
        headers: adminHeaders 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Transform to match dashboard expectations
      const tickets = data.tickets || [];
      const formattedTickets = tickets.map(ticket => ({
        id: ticket.id || ticket.ticketId,
        name: ticket.name || 'Anonymous',
        department: ticket.department || 'General',
        status: ticket.status?.toLowerCase().replace(' ', '_') || 'open',
        urgency: ticket.urgency?.toLowerCase() || 'medium',
        message: ticket.message || ticket.issue || 'No description provided',
        createdAt: ticket.createdAt || ticket.created_at || Date.now(),
        telegramId: ticket.telegramId || null,
        contact: ticket.contact || 'N/A'
      }));
      
      return {
        success: true,
        tickets: formattedTickets,
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      return { 
        success: false, 
        error: error.message,
        tickets: [],
        total: 0
      };
    }
  }
  
  // Export to window
  window._admin = {
    fetchTickets,
    fetchTicketById,
    updateTicketStatus,
    deleteTicket,
    fetchAllTickets, // Add this function
    fetchRecentTickets: (limit = 10) => fetchTickets({ limit, page: 1 }), // Keep for compatibility
    updateTicket: updateTicketStatus, // Alias for compatibility
    getAdminSecret: () => ADMIN_SECRET // Expose for other scripts
  };
  
  // Also expose globally for inline onclick handlers
  window.updateTicketStatus = updateTicketStatus;
  window.deleteTicket = deleteTicket;
})();