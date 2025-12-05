// backend/controllers/ticketsController.js
const { readTickets, writeTickets } = require("../lib/storage-json");

// --------------------------------------
// FETCH SINGLE TICKET
// --------------------------------------
async function getTicket(id) {
  const tickets = await readTickets();
  return tickets.find(t => t.ticketId === id);
}

// --------------------------------------
// FETCH ALL TICKETS
// --------------------------------------
async function getAllTickets() {
  return await readTickets();
}

// --------------------------------------
// UPDATE TICKET STATUS
// --------------------------------------
async function updateTicketStatus(id, newStatus) {
  const tickets = await readTickets();
  const ticket = tickets.find(t => t.ticketId === id);

  if (!ticket) return null;

  ticket.status = newStatus;
  ticket.updated_at = new Date().toISOString();

  await writeTickets(tickets);
  return ticket;
}

// --------------------------------------
// SAVE NEW TICKET FROM /submit-ticket
// --------------------------------------
async function saveNewTicketToJson(ticket) {
  const tickets = await readTickets();
  tickets.push(ticket);
  await writeTickets(tickets);
}

module.exports = {
  getTicket,
  getAllTickets,
  updateTicketStatus,
  saveNewTicketToJson
};
