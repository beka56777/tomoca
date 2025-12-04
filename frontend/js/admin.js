// frontend/js/admin.js
// Functions used by admin/dashboard/tickets/ticket pages.
// Add ?admin=YOUR_SECRET in URL to enable admin actions
(function () {
  const API_BASE = 'https://tomoca.onrender.com';
  const ADMIN_SECRET = window._utils.getAdminSecretFromUrl();
  const adminHeaders = ADMIN_SECRET ? { 'x-admin-secret': ADMIN_SECRET } : {};

  async function fetchRecentTickets(limit = 10) {
    const res = await fetch(`${API_BASE}/tickets?limit=${limit}`, { headers: adminHeaders });
    return res.json();
  }

  async function fetchTickets({ status = '', department = '', q = '', page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (department) params.append('department', department);
    if (q) params.append('q', q);
    params.append('limit', limit);
    params.append('page', page);
    const res = await fetch(`${API_BASE}/tickets?${params.toString()}`, { headers: adminHeaders });
    return res.json();
  }

  async function fetchTicketById(id) {
    const res = await fetch(`${API_BASE}/ticket?id=${encodeURIComponent(id)}`, { headers: adminHeaders });
    return res.json();
  }

  async function updateTicket(id, updates = {}) {
    const res = await fetch(`${API_BASE}/update-ticket`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, adminHeaders),
      body: JSON.stringify({ id, updates })
    });
    return res.json();
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]; });
  }

  function urgencyColor(u) {
    if (!u) return '#777';
    const v = (u || '').toLowerCase();
    if (v.includes('critical') || v.includes('high')) return '#d32f2f';
    if (v.includes('medium')) return '#ff9800';
    return '#2e7d32';
  }

  function ticketRowHtml(t) {
    return `
      <div class="ticket-row" data-id="${t.id}" style="padding:12px;border-bottom:1px solid #f6f6f6;display:flex;justify-content:space-between;align-items:center;">
        <div style="max-width:72%">
          <div style="font-weight:700">${escapeHtml(t.name)} <span style="color:#777;font-weight:600">(${escapeHtml(t.department||'')})</span></div>
          <div style="font-size:0.92rem;color:#666;margin-top:6px;">${escapeHtml((t.issue||'').slice(0,180))}${(t.issue||'').length>180 ? '...' : ''}</div>
          <div style="margin-top:6px;font-size:0.86rem;color:#555">
            <span class="ticket-id">${t.id}</span> • ${window._utils.formatDate(t.createdAt || t.timestamp)} • <strong style="color:${urgencyColor(t.urgency)}">${t.urgency}</strong>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <a href="ticket.html?id=${encodeURIComponent(t.id)}&admin=${ADMIN_SECRET}" class="submit-btn" style="padding:8px 12px;font-size:0.9rem;">View</a>
          <button class="copy-id-btn submit-btn" data-id="${t.id}" style="padding:8px 10px;font-size:0.9rem;background:#6c757d;">Copy</button>
        </div>
      </div>
    `;
  }

  // Export to window
  window._admin = {
    fetchRecentTickets,
    fetchTickets,
    fetchTicketById,
    updateTicket,
    ticketRowHtml,
    urgencyColor
  };
})();
