// backend/lib/storage-firestore.js
// Lightweight stub wrapper for Firestore migration (not active by default).
// Implement this if you want to migrate from JSON to Firestore.

module.exports = {
  async saveTicket() { throw new Error('Not implemented. Use storage-json for now.'); },
  async getTicketById() { throw new Error('Not implemented.'); },
  async listTickets() { throw new Error('Not implemented.'); },
  async updateTicket() { throw new Error('Not implemented.'); }
};
