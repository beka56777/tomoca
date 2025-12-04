// backend/lib/storage-json.js
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(TICKETS_FILE);
  } catch (err) {
    // file or dir missing -> create empty array
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
  }
}

async function readAll() {
  await ensureDataFile();
  const raw = await fs.readFile(TICKETS_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    // If parse error, reset file
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
    return [];
  }
}

async function writeAll(items) {
  await ensureDataFile();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

function normalizeId(id) {
  return String(id || '').trim();
}

module.exports = {
  async saveTicket(ticket) {
    if (!ticket || !ticket.id) throw new Error('Ticket must have id');
    const items = await readAll();
    items.unshift(ticket); // newest first
    await writeAll(items);
    return ticket;
  },

  async getTicketById(id) {
    if (!id) return null;
    const items = await readAll();
    return items.find(t => normalizeId(t.id) === normalizeId(id)) || null;
  },

  // list with simple filtering & pagination
  async listTickets({ q = '', status = '', department = '', limit = 50, page = 1 } = {}) {
    const items = await readAll();
    let filtered = items;

    if (q) {
      const ql = q.toLowerCase();
      filtered = filtered.filter(t =>
        (t.id && t.id.toLowerCase().includes(ql)) ||
        (t.name && t.name.toLowerCase().includes(ql)) ||
        (t.issue && t.issue.toLowerCase().includes(ql))
      );
    }

    if (status) {
      const sl = status.toLowerCase();
      filtered = filtered.filter(t => (t.status || 'open').toLowerCase() === sl);
    }

    if (department) {
      const dl = department.toLowerCase();
      filtered = filtered.filter(t => (t.department || '').toLowerCase() === dl);
    }

    const total = filtered.length;
    const start = (Math.max(1, page) - 1) * Math.max(1, limit);
    const end = start + Math.max(1, limit);
    const paged = filtered.slice(start, end);

    return { tickets: paged, total };
  },

  async updateTicket(id, updates = {}) {
    if (!id) throw new Error('id required');
    const items = await readAll();
    const idx = items.findIndex(t => normalizeId(t.id) === normalizeId(id));
    if (idx === -1) return null;
    const updated = Object.assign({}, items[idx], updates, { updatedAt: new Date().toISOString() });
    items[idx] = updated;
    await writeAll(items);
    return updated;
  },

  // Optional: used to seed or clear data in dev
  async replaceAll(newItems = []) {
    await writeAll(Array.isArray(newItems) ? newItems : []);
    return true;
  }
};
