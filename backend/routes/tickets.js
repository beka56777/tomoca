// backend/routes/tickets.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketsController');
const adminAuth = require('../middleware/auth');

// Public endpoint (same as you had) - create ticket
router.post('/submit-ticket', controller.createTicket);

// Admin endpoints (protected)
router.get('/tickets', adminAuth, controller.listTickets);
router.get('/ticket', adminAuth, controller.getTicket);
router.post('/update-ticket', adminAuth, controller.updateTicket);

module.exports = router;
