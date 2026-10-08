const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { handler } = require('../netlify/functions/submit-lead');

test('server confirms delivery only after Telegram accepts the message', async () => {
  process.env.URGENTFIX_TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.URGENTFIX_TELEGRAM_CHAT_ID = '123';
  const savedFetch = global.fetch;
  const event = { httpMethod: 'POST', body: JSON.stringify({ form: 'callback', name: 'Test', phone: '+37360000000' }) };
  try {
    global.fetch = async () => ({ ok: false, json: async () => ({ ok: false }) });
    assert.equal((await handler(event)).statusCode, 502);
    global.fetch = async () => { throw new Error('Network unavailable'); };
    assert.equal((await handler(event)).statusCode, 502);
    global.fetch = async (url, options) => {
      const message = JSON.parse(options.body);
      assert.equal(message.chat_id, '123');
      assert.match(message.text, /\+37360000000/);
      return { ok: true, json: async () => ({ ok: true, result: { message_id: 42 } }) };
    };
    assert.deepEqual(JSON.parse((await handler(event)).body), { ok: true, receipt: '42' });
    assert.equal((await handler({ ...event, body: '{' })).statusCode, 400);
    assert.equal((await handler({ ...event, body: JSON.stringify({ form: 'callback', name: 'Test', phone: '123' }) })).statusCode, 400);
    assert.equal((await handler({ ...event, body: JSON.stringify({ form: 'callback', name: 'Test', phone: '+37360000000', website: 'spam' }) })).statusCode, 400);
    delete process.env.URGENTFIX_TELEGRAM_BOT_TOKEN;
    assert.equal((await handler(event)).statusCode, 503);
  } finally {
    global.fetch = savedFetch;
    delete process.env.URGENTFIX_TELEGRAM_BOT_TOKEN;
    delete process.env.URGENTFIX_TELEGRAM_CHAT_ID;
  }
});

test('form preserves inputs on failure, blocks duplicate submits and counts delivered leads', async () => {
  const source = fs.readFileSync(require.resolve('../js/script.js'), 'utf8');
  const events = [];
  let fetchCount = 0;
  let finish;
  const context = vm.createContext({
    document: { addEventListener() {}, documentElement: { lang: 'ru' } },
    window: {}, console, gtag: (...args) => events.push(args),
    fetch: async () => { fetchCount++; return new Promise(resolve => { finish = resolve; }); }
  });
  vm.runInContext(source, context);
  vm.runInContext('initIcons = () => {}', context);
  const error = { hidden: true };
  const button = { disabled: false, setAttribute() {}, removeAttribute() {} };
  const classes = new Set();
  const form = { dataset: {}, classList: { add: name => classes.add(name) }, querySelector: selector => selector === '[data-form-error]' ? error : selector === 'button[type="submit"]' ? button : { value: '' } };
  let shown = false;
  const success = { classList: { remove() { shown = true; } } };
  const data = { name: 'Test', phone: '+37360000000', form: 'callback' };
  const pending = context.submitLead(form, success, data);
  await context.submitLead(form, success, data);
  assert.equal(fetchCount, 1);
  assert.equal(button.disabled, true);
  finish({ ok: false, json: async () => ({ ok: false }) });
  await pending;
  assert.equal(shown, false);
  assert.equal(classes.has('hidden'), false);
  assert.equal(events.length, 0);
  assert.equal(error.hidden, false);
  assert.equal(button.disabled, false);
  const accepted = context.submitLead(form, success, data);
  finish({ ok: true, json: async () => ({ ok: true, receipt: '42' }) });
  await accepted;
  assert.equal(shown, true);
  assert.equal(events.length, 1);
  assert.equal(events[0][2].transaction_id, 'urgentfix-42');
});
