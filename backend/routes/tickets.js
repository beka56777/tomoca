// backend/routes/tickets.js
const express = require("express");
const router = express.Router();

const {
  getTicket,
  getAllTickets,
  updateTicketStatus,
  saveNewTicketToJson
} = require("../controllers/ticketsController");

// --------------------------------------
// READ SINGLE TICKET  (GET /ticket?id=XYZ)
// --------------------------------------
router.get("/ticket", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing ticket ID" });

    const ticket = await getTicket(id);
    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------
// FULL TICKET LIST (GET /tickets)
// --------------------------------------
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------
// UPDATE TICKET (POST /update-ticket)
// --------------------------------------
router.post("/update-ticket", async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const updated = await updateTicketStatus(id, status);
    if (!updated)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    res.json({ success: true, message: "Ticket updated", ticket: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------------------
// SAVE TICKET AFTER SUBMIT-TICKET (CALLED FROM SERVER.JS)
// --------------------------------------
router.post("/save-ticket", async (req, res) => {
  try {
    const ticket = req.body;
    await saveNewTicketToJson(ticket);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
