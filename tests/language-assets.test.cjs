const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('language routes load the same local assets as the homepage', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const assets = [...html.matchAll(/(?:src|href|poster)="(\/?(?:js|css|img)\/[^"?#]+)"/g)].map(m => m[1]);
  assert.ok(assets.length > 0);
  for (const route of ['/', '/ru', '/ru/', '/ro', '/ro/']) {
    for (const asset of assets) {
      const url = new URL(asset, `https://urgentfix.md${route}`);
      assert.equal(url.pathname, '/' + asset.replace(/^\//, ''), `${route}: ${asset}`);
      assert.ok(fs.existsSync(path.join(root, url.pathname.slice(1))), asset);
    }
  }
  const script = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
  for (const resource of ['settings', 'reviews']) {
    assert.ok(script.includes(`fetch('/content/${resource}.json'`));
  }
});
