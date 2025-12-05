// backend/lib/telegram.js
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  // we'll log but not throw — controllers will handle errors gracefully
  console.warn('Telegram credentials not set (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID). Telegram notifications will fail.');
}

async function sendMessage(text, parse_mode = 'HTML') {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('Telegram credentials missing');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = { chat_id: CHAT_ID, text, parse_mode };

  const res = await axios.post(url, payload);
  return res.data;
}

module.exports = { sendMessage };
