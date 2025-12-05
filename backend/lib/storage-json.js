// backend/lib/storage-json.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "tickets.json");

// Ensure file exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]", "utf8");
}

async function readTickets() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

async function writeTickets(tickets) {
  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));
}

module.exports = {
  readTickets,
  writeTickets
};
