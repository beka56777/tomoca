// backend/routes/tickets.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketsController');
const adminAuth = require('../middleware/auth');

// Public endpoints
router.post('/submit-ticket', controller.createTicket);
router.get('/track-ticket', controller.trackTicketPublic);

// Admin (protected)
router.get('/tickets', adminAuth, controller.listTickets);
router.get('/ticket', adminAuth, controller.getTicket);
router.post('/update-ticket', adminAuth, controller.updateTicket);

module.exports = router;
