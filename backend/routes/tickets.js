// backend/routes/tickets.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/ticketsController");

/* ============================================================
   PUBLIC — Track a single ticket
   Your frontend calls:  GET /track-ticket?id=TOM-123
   ============================================================ */
router.get("/track-ticket", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id)
      return res.status(400).json({ success: false, message: "id is required" });

    const ticket = await controller.getTicket(id);
    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error("GET /track-ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================================================
   PUBLIC — Get all tickets
   ============================================================ */
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await controller.getAllTickets();
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error("GET /tickets error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================================================
   ADMIN — Get one ticket
   ============================================================ */
router.get("/admin/ticket", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id)
      return res.status(400).json({ success: false, message: "id is required" });

    const ticket = await controller.getTicket(id);
    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error("GET /admin/ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================================================
   ADMIN — Update ticket
   EXPECTS:
   {
      "id": "TOM-123",
      "updates": { "status": "Resolved" }
   }
   ============================================================ */
router.post("/update-ticket", async (req, res) => {
  try {
    const { id, updates } = req.body;

    if (!id || !updates)
      return res.status(400).json({ success: false, message: "id and updates required" });

    const updated = await controller.updateTicketStatus(id, updates.status);

    if (!updated)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    return res.json({ success: true, ticket: updated });
  } catch (err) {
    console.error("POST /update-ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================================================
   SAVE TICKET FROM TELEGRAM BOT
   (server.js calls this)
   ============================================================ */
router.post("/save-ticket", async (req, res) => {
  try {
    const ticket = req.body;

    if (!ticket || !ticket.ticketId)
      return res.status(400).json({ success: false, message: "Invalid ticket" });

    await controller.saveNewTicketToJson(ticket);

    return res.json({ success: true });
  } catch (err) {
    console.error("POST /save-ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
