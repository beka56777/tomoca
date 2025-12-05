// backend/controllers/ticketsController.js
const storage = require('../lib/storage-json');
const telegram = require('../lib/telegram');

// generate ID helper (same format you're used to)
function generateTicketId() {
  return 'TOM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function formatTelegramMessage(ticket) {
  return `
🆕 <b>NEW IT SUPPORT TICKET</b>

🎫 <b>Ticket ID:</b> <code>${ticket.id}</code>
👤 <b>Name:</b> ${ticket.name}
🏢 <b>Department:</b> ${ticket.department}
🚨 <b>Urgency:</b> ${ticket.urgency}
📝 <b>Issue:</b>
${ticket.issue}

⏰ <b>Submitted:</b> ${new Date(ticket.createdAt).toLocaleString()}
  `.trim();
}

module.exports = {
  // Public create ticket (POST /submit-ticket)
  async createTicket(req, res) {
    try {
      const { name, department, urgency, issue } = req.body;
      if (!name || !department || !urgency || !issue) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      const ticketId = generateTicketId();
      const createdAt = new Date().toISOString();

      const ticket = {
        id: ticketId,
        name,
        department,
        urgency,
        issue,
        status: 'open',
        createdAt,
        updatedAt: createdAt,
        notes: []
      };

      // save to JSON storage
      await storage.saveTicket(ticket);

      // notify via Telegram (don't fail if telegram fails)
      try {
        const text = formatTelegramMessage(ticket);
        await telegram.sendMessage(text);
      } catch (tgErr) {
        console.error('Telegram send error (ticket saved):', tgErr && (tgErr.response || tgErr) || tgErr);
      }

      return res.json({ success: true, ticketId, message: 'Ticket submitted successfully to IT team' });
    } catch (err) {
      console.error('createTicket error:', err);
      return res.status(500).json({ success: false, message: 'Error submitting ticket. Please try again or contact IT directly.' });
    }
  },

  // Public tracking endpoint (GET /track-ticket?id=...)
  async trackTicketPublic(req, res) {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ success: false, message: 'id is required' });

      const ticket = await storage.getTicketById(id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

      // return limited public view
      const publicTicket = {
        id: ticket.id,
        status: ticket.status,
        department: ticket.department,
        urgency: ticket.urgency,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        issuePreview: ticket.issue ? (ticket.issue.length > 400 ? ticket.issue.slice(0, 400) + '...' : ticket.issue) : ''
      };

      return res.json({ success: true, ticket: publicTicket });
    } catch (err) {
      console.error('trackTicketPublic error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching ticket.' });
    }
  },

  // Admin: list tickets (GET /tickets)
  async listTickets(req, res) {
    try {
      const { q = '', status = '', department = '', limit = 50, page = 1 } = req.query;
      const params = { q, status, department, limit: parseInt(limit, 10) || 50, page: parseInt(page, 10) || 1 };
      const data = await storage.listTickets(params);
      return res.json(Object.assign({ success: true }, data));
    } catch (err) {
      console.error('listTickets error:', err);
      return res.status(500).json({ success: false, message: 'Error reading tickets.' });
    }
  },

  // Admin: get single ticket (GET /ticket?id=...)
  async getTicket(req, res) {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ success: false, message: 'id is required' });

      const ticket = await storage.getTicketById(id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

      return res.json({ success: true, ticket });
    } catch (err) {
      console.error('getTicket error:', err);
      return res.status(500).json({ success: false, message: 'Error fetching ticket.' });
    }
  },

  // Admin: update ticket (POST /update-ticket) body { id, updates: { status, assignTo, notes } }
  async updateTicket(req, res) {
    try {
      const { id, updates } = req.body;
      if (!id || !updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, message: 'id and updates required' });
      }

      const existing = await storage.getTicketById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Ticket not found' });

      const updated = await storage.updateTicket(id, updates);

      // optional notification to Telegram about status change
      try {
        const msg = `<b>Ticket ${updated.id} updated</b>\nStatus: ${updated.status || 'n/a'}`;
        await telegram.sendMessage(msg);
      } catch (tgErr) {
        console.error('telegram notify update error:', tgErr && (tgErr.response || tgErr) || tgErr);
      }

      return res.json({ success: true, ticket: updated });
    } catch (err) {
      console.error('updateTicket error:', err);
      return res.status(500).json({ success: false, message: 'Error updating ticket.' });
    }
  }
};
