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
    // create empty array file
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
  }
}

function normalizeId(id) {
  return String(id || '').trim();
}

async function readAll() {
  await ensureDataFile();
  const raw = await fs.readFile(TICKETS_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (err) {
    // reset on parse error
    await fs.writeFile(TICKETS_FILE, '[]', 'utf8');
    return [];
  }
}

async function writeAll(items) {
  await ensureDataFile();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

module.exports = {
  async saveTicket(ticket) {
    if (!ticket || !ticket.id) throw new Error('Ticket must have id');
    const items = await readAll();
    // add newest first
    items.unshift(ticket);
    await writeAll(items);
    return ticket;
  },

  async getTicketById(id) {
    if (!id) return null;
    const items = await readAll();
    return items.find(t => normalizeId(t.id) === normalizeId(id)) || null;
  },

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
    const lim = Math.max(1, parseInt(limit, 10) || 50);
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const start = (pg - 1) * lim;
    const paged = filtered.slice(start, start + lim);

    return { tickets: paged, total, page: pg, limit: lim };
  },

  async updateTicket(id, updates = {}) {
    if (!id) throw new Error('id required');
    const items = await readAll();
    const idx = items.findIndex(t => normalizeId(t.id) === normalizeId(id));
    if (idx === -1) return null;
    const existing = items[idx];

    // merge allowed fields only
    const allowed = Object.assign({}, existing);
    if (updates.status) allowed.status = updates.status;
    if (updates.assignTo) allowed.assignTo = updates.assignTo;
    if (updates.notes) {
      const existingNotes = Array.isArray(existing.notes) ? existing.notes : [];
      const newNotes = Array.isArray(updates.notes) ? updates.notes : [updates.notes];
      allowed.notes = existingNotes.concat(newNotes.map(n => ({
        text: typeof n === 'string' ? n : (n.text || ''),
        by: (n.by || 'admin'),
        when: (n.when || new Date().toISOString())
      })));
    }
    allowed.updatedAt = new Date().toISOString();

    items[idx] = allowed;
    await writeAll(items);
    return allowed;
  },

  async replaceAll(newItems = []) {
    await writeAll(Array.isArray(newItems) ? newItems : []);
    return true;
  }
};
