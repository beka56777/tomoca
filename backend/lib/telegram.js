// backend/lib/telegram.js
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.warn('WARNING: Telegram token or chat id not set in environment variables.');
}

async function sendMessage(text, parse_mode = 'HTML') {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('Telegram credentials missing');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: CHAT_ID,
    text,
    parse_mode
  };

  try {
    const r = await axios.post(url, payload);
    return r.data;
  } catch (err) {
    // bubble up the useful message
    throw err.response?.data || err.message || err;
  }
}

module.exports = { sendMessage };
