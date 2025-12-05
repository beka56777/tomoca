// backend/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const ticketRoutes = require("./routes/tickets");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Telegram credentials
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Generate unique ticket ID
function generateTicketId() {
  return (
    "TOM-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substr(2, 5).toUpperCase()
  );
}

// Send Telegram Message
async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Telegram Error:", error.response?.data || error.message);
    throw error;
  }
}

// ----------------------------
// HEALTH CHECK
// ----------------------------
app.get("/", (req, res) => {
  res.json({
    status: "active",
    message: "Tomoca IT Support Backend Running",
  });
});

// ----------------------------
// SUBMIT TICKET
// ----------------------------
// --------------------------------------
// SUBMIT TICKET — SAVES TO JSON + Telegram
// --------------------------------------
app.post("/submit-ticket", async (req, res) => {
  try {
    const { name, department, urgency, issue } = req.body;

    if (!name || !department || !urgency || !issue) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const ticketId = generateTicketId();
    const timestamp = new Date().toLocaleString();

    // Build ticket object
    const ticketData = {
      ticketId,
      name,
      department,
      urgency,
      issue,
      status: "open",
      created_at: timestamp,
      updated_at: timestamp
    };

    // Save to tickets.json
    const { saveNewTicketToJson } = require("./controllers/ticketsController");
    await saveNewTicketToJson(ticketData);

    // Send to Telegram
    const telegramMessage = `
🆕 <b>NEW IT SUPPORT TICKET</b>

🎫 <b>Ticket ID:</b> <code>${ticketId}</code>
👤 <b>Name:</b> ${name}
🏢 <b>Department:</b> ${department}
🚨 <b>Urgency:</b> ${urgency}
📝 <b>Issue:</b>
${issue}

⏰ <b>Submitted:</b> ${timestamp}
    `.trim();

    await sendTelegramMessage(telegramMessage);

    // respond
    res.json({
      success: true,
      ticketId,
      message: "Ticket submitted successfully!"
    });

  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting ticket."
    });
  }
});


// ----------------------------
// EXTRA ROUTES (tracking, history, update)
// ----------------------------
app.use("/", ticketRoutes);

// ----------------------------
// START SERVER
// ----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Tomoca Support Backend running on port ${PORT}`);
});
