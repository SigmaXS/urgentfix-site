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
    assert.equal((await handler({ ...event, body: JSON.stringify({ form: 'request', name: 'Test', phone: '+37360000000', address: 'x'.repeat(201) }) })).statusCode, 400);
    global.fetch = async (url, options) => {
      const message = JSON.parse(options.body);
      assert.match(message.text, /Адрес: Strada Test 5, Chișinău/);
      return { ok: true, json: async () => ({ ok: true, result: { message_id: 43 } }) };
    };
    assert.deepEqual(
      JSON.parse((await handler({ ...event, body: JSON.stringify({ form: 'request', name: 'Test', phone: '+37360000000', address: 'Strada Test 5, Chișinău' }) })).body),
      { ok: true, receipt: '43' }
    );
    delete process.env.URGENTFIX_TELEGRAM_BOT_TOKEN;
    assert.equal((await handler(event)).statusCode, 503);
  } finally {
    global.fetch = savedFetch;
    delete process.env.URGENTFIX_TELEGRAM_BOT_TOKEN;
    delete process.env.URGENTFIX_TELEGRAM_CHAT_ID;
  }
});

test('contact conversions count only contact link clicks, including nested icons', () => {
  const source = fs.readFileSync(require.resolve('../js/script.js'), 'utf8');
  const events = [];
  let onClick;
  const context = vm.createContext({
    document: { addEventListener(type, handler) { if (type === 'click') onClick = handler; } },
    window: {}, console, gtag: (...args) => events.push(args)
  });
  vm.runInContext(source, context);
  context.initContactConversions();
  assert.equal(events.length, 0);
  for (const href of ['tel:+37378293919', 'https://wa.me/37378293919', 'viber://chat?number=%2B37378293919', 'https://t.me/+37378293919']) {
    onClick({ target: { closest: () => ({ getAttribute: () => href }) } });
  }
  assert.equal(events.length, 4);
  assert.ok(events.every(event => event[2].send_to === 'AW-18463953925/18oDCMHcuoEdEIWopuRE'));
  for (const href of ['#request', '/ro/', 'https://g.page/r/CXLsH_fV30fXEBM/review']) {
    onClick({ target: { closest: () => ({ getAttribute: () => href }) } });
  }
  onClick({ target: { closest: () => null } });
  assert.equal(events.length, 4);
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
  assert.equal(events.length, 2);
  assert.equal(events[0][0], 'set');
  assert.equal(events[0][1], 'user_data');
  assert.equal(events[0][2].phone_number, '+37360000000');
  assert.equal(events[1][2].transaction_id, 'urgentfix-42');
});
