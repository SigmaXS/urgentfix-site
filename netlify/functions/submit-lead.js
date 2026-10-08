const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false });
  if (!event.body || event.body.length > 10000) return reply(400, { ok: false });
  let data;
  try { data = JSON.parse(event.body); } catch { return reply(400, { ok: false }); }
  if (!data || typeof data !== 'object' || data.website) return reply(400, { ok: false });
  const valid = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if (!valid(data.name, 100) || !valid(data.phone, 30) ||
      !/^[+\d\s().-]+$/.test(data.phone) ||
      data.phone.replace(/\D/g, '').length < 8 || data.phone.replace(/\D/g, '').length > 15 ||
      !['request', 'callback'].includes(data.form) ||
      (data.service !== undefined && (typeof data.service !== 'string' || data.service.length > 150)) ||
      (data.description !== undefined && (typeof data.description !== 'string' || data.description.length > 2000))) {
    return reply(400, { ok: false });
  }
  const token = process.env.URGENTFIX_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.URGENTFIX_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return reply(503, { ok: false });
  const lines = ['Заявка с сайта UrgentFix',
    `Тип: ${data.form === 'callback' ? 'Обратный звонок' : 'Заявка'}`,
    `Имя: ${data.name.trim()}`, `Телефон: ${data.phone.trim()}`];
  if (data.service) lines.push(`Услуга: ${data.service.trim()}`);
  if (data.description) lines.push(`Проблема: ${data.description.trim()}`);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
      signal: AbortSignal.timeout(8000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true || !result.result?.message_id) return reply(502, { ok: false });
    return reply(200, { ok: true, receipt: String(result.result.message_id) });
  } catch {
    // Never log Telegram credentials or client contact details.
    return reply(502, { ok: false });
  }
};
