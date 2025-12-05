// backend/controllers/ticketsController.js
const Ticket = require('../models/Ticket');

// --------------------------------------
// FETCH SINGLE TICKET
// --------------------------------------
async function getTicket(id) {
  return await Ticket.findOne({ ticketId: id });
}

// --------------------------------------
// FETCH ALL TICKETS
// --------------------------------------
async function getAllTickets() {
  return await Ticket.find({});
}

// --------------------------------------
// UPDATE TICKET STATUS
// --------------------------------------
async function updateTicketStatus(id, newStatus) {
  const ticket = await Ticket.findOneAndUpdate(
    { ticketId: id },
    { status: newStatus, updated_at: new Date() },
    { new: true }
  );

  return ticket; // null if not found
}

// --------------------------------------
// SAVE NEW TICKET
// --------------------------------------
async function saveNewTicket(ticketData) {
  const ticket = new Ticket(ticketData);
  await ticket.save();
  return ticket;
}

module.exports = {
  getTicket,
  getAllTickets,
  updateTicketStatus,
  saveNewTicket
};
