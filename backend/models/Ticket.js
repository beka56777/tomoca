const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'open' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
