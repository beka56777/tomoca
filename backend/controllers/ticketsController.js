// backend/controllers/ticketsController.js
const storage = require('../lib/storage-json');
const telegram = require('../lib/telegram');

function generateTicketId() {
  return 'TOM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function formatTelegramMessage(ticket) {
  // ticket: { id, name, department, urgency, issue, createdAt }
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
  // POST /submit-ticket
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

      // save to storage
      await storage.saveTicket(ticket);

      // send telegram notification (non-blocking failure handled)
      try {
        const text = formatTelegramMessage(ticket);
        await telegram.sendMessage(text);
      } catch (tgErr) {
        console.error('Telegram send error (ticket saved):', tgErr);
        // do not fail the request because of Telegram issues
      }

      return res.json({ success: true, ticketId, message: 'Ticket submitted successfully to IT team' });
    } catch (err) {
      console.error('createTicket error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error submitting ticket. Please try again or contact IT directly.'
      });
    }
  },

  // GET /tickets
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

  // GET /ticket?id=...
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

  // POST /update-ticket  body { id, updates: { status, notes: [...], assignTo } }
  async updateTicket(req, res) {
    try {
      const { id, updates } = req.body;
      if (!id || !updates || typeof updates !== 'object') {
        return res.status(400).json({ success: false, message: 'id and updates required' });
      }
      const existing = await storage.getTicketById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Ticket not found' });

      // merge updates safely
      const allowed = {};
      if (updates.status) allowed.status = updates.status;
      if (updates.assignTo) allowed.assignTo = updates.assignTo;
      if (updates.notes) {
        // append notes array items
        const currentNotes = Array.isArray(existing.notes) ? existing.notes : [];
        allowed.notes = currentNotes.concat(updates.notes.map(n => Object.assign({}, {
          text: n.text || n,
          by: n.by || 'admin',
          when: n.when || new Date().toISOString()
        })));
      }

      const updated = await storage.updateTicket(id, allowed);

      // optional: notify via telegram about status change
      try {
        const msg = `<b>Ticket ${updated.id} updated</b>\nStatus: ${updated.status}\nBy: admin`;
        await telegram.sendMessage(msg);
      } catch (tgErr) {
        console.error('telegram notify update error:', tgErr);
      }

      return res.json({ success: true, ticket: updated });
    } catch (err) {
      console.error('updateTicket error:', err);
      return res.status(500).json({ success: false, message: 'Error updating ticket.' });
    }
  }
};
