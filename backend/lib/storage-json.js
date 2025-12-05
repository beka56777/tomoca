// backend/lib/storage-json.js
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

// Ensure folder + file exist
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(TICKETS_FILE);
  } catch (err) {
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
  }
}

async function readTickets() {
  await ensureDataFile();
  const raw = await fs.readFile(TICKETS_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch {
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
    return [];
  }
}

async function writeTickets(tickets) {
  await ensureDataFile();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf8');
}

module.exports = {
  readTickets,
  writeTickets
};
