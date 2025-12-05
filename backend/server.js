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
app.post("/submit-ticket", async (req, res) => {
  try {
    const { name, department, urgency, issue } = req.body;

    if (!name || !department || !urgency || !issue) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const ticketId = generateTicketId();
    const timestamp = new Date().toLocaleString();

    const ticketObj = {
      ticketId,
      name,
      department,
      urgency,
      issue,
      status: "Pending",
      submitted_at: timestamp,
      updated_at: timestamp,
    };

    // Format message
    const message = `
🆕 <b>NEW IT SUPPORT TICKET</b>

🎫 <b>Ticket ID:</b> <code>${ticketId}</code>
👤 <b>Name:</b> ${name}
🏢 <b>Department:</b> ${department}
🚨 <b>Urgency:</b> ${urgency}
📝 <b>Issue:</b>
${issue}

⏰ <b>Submitted:</b> ${timestamp}
    `.trim();

    // Notify IT Team
    await sendTelegramMessage(message);

    // Save ticket to JSON file
    await axios.post(
      `${process.env.RENDER_EXTERNAL_URL}/save-ticket`,
      ticketObj
    );

    res.json({
      success: true,
      ticketId,
      message: "Ticket submitted successfully",
    });
  } catch (err) {
    console.error("Submit Ticket Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Try again.",
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
