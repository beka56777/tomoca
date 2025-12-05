// backend/routes/tickets.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketsController');

// Public: get single ticket by id (frontend track.html calls this)
router.get('/ticket', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    const ticket = await controller.getTicket(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error('GET /ticket error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public: list all tickets (optional)
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await controller.getAllTickets();
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error('GET /tickets error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: update ticket (if you use middleware/auth, make sure it's applied in server.js)
router.post('/update-ticket', async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ success: false, message: 'id and status required' });

    const updated = await controller.updateTicketStatus(id, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Ticket not found' });

    return res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error('POST /update-ticket error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// helper route used by server.js earlier to save tickets (if you used saveNewTicketToJson via route)
router.post('/save-ticket', async (req, res) => {
  try {
    const ticket = req.body;
    await controller.saveNewTicketToJson(ticket);
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /save-ticket error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
