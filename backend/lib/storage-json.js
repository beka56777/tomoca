const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "tickets.json");

// ensure file exists
if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

function readTickets() {
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

function getTicketById(id) {
  const tickets = readTickets();
  return tickets.find(t => t.id === id);
}

module.exports = {
  getTicketById
};
