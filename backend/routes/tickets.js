// backend/routes/tickets.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/ticketsController");

// Public: get single ticket by id (frontend track.html calls this)
router.get("/ticket", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: "id is required" });

    const ticket = await controller.getTicket(id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error("GET /ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Public: list all tickets (used by history.html / admin read)
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await controller.getAllTickets();
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error("GET /tickets error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: get single ticket (protected by your admin middleware if you use it)
router.get("/admin/ticket", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: "id is required" });

    const ticket = await controller.getTicket(id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error("GET /admin/ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: update ticket (expects { id, status, assignTo, notes } in body)
router.post("/update-ticket", async (req, res) => {
  try {
    const { id, updates } = req.body;
    if (!id || !updates || typeof updates !== "object") {
      return res.status(400).json({ success: false, message: "id and updates required" });
    }

    const updated = await controller.updateTicketStatus(id, updates.status || undefined);

    // If controller returns null, ticket wasn't found
    if (!updated) return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error("POST /update-ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Helper: save-ticket (used by server.js version that calls /save-ticket)
router.post("/save-ticket", async (req, res) => {
  try {
    const ticket = req.body;
    if (!ticket || !ticket.ticketId) return res.status(400).json({ success: false, message: "invalid ticket" });

    await controller.saveNewTicketToJson(ticket);
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /save-ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
