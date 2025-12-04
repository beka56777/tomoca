const storage = require("../lib/storage-json");

// PUBLIC — track a ticket by ID (NO ADMIN SECRET)
async function trackTicketPublic(req, res) {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ticket id is required"
      });
    }

    const ticket = await storage.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    return res.json({
      success: true,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        department: ticket.department,
        urgency: ticket.urgency,
        status: ticket.status || "Open",
        createdAt: ticket.createdAt,
        issue: ticket.issue
      }
    });
  } catch (err) {
    console.error("trackTicketPublic error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

module.exports = {
  trackTicketPublic
};
