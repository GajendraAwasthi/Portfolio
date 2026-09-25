import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const origin = process.env.PORTFOLIO_SMOKE_ORIGIN || 'http://localhost:3000';
const username = process.env.PORTFOLIO_SMOKE_USERNAME;
const password = process.env.PORTFOLIO_SMOKE_PASSWORD;
if (!username || !password) throw new Error('Set PORTFOLIO_SMOKE_USERNAME and PORTFOLIO_SMOKE_PASSWORD');

const request = (path, options = {}) => fetch(origin + path, { redirect: 'manual', ...options });
const jsonHeaders = { origin, 'content-type': 'application/json' };

let response = await request('/api/data/profile', {
  method: 'POST', headers: jsonHeaders, body: JSON.stringify({ data: {} }),
});
assert.equal(response.status, 401, 'unauthenticated writes are denied');
response = await request('/');
assert.equal(response.headers.get('x-frame-options'), 'DENY');
assert.equal(response.headers.get('x-content-type-options'), 'nosniff');

response = await request('/api/auth/login', {
  method: 'POST', headers: { ...jsonHeaders, origin: 'https://evil.example' },
  body: JSON.stringify({ username, password }),
});
assert.equal(response.status, 403, 'cross-origin login is denied');

response = await request('/api/auth/login', {
  method: 'POST', headers: jsonHeaders, body: JSON.stringify({ username, password }),
});
assert.equal(response.status, 200, 'valid login succeeds');
const setCookie = response.headers.get('set-cookie');
assert.match(setCookie, /HttpOnly/);
const cookie = setCookie.split(';')[0];
const token = cookie.split('=')[1];
const digest = createHash('sha256').update(token).digest('hex');
const authStore = JSON.parse(readFileSync('data/auth-store.json', 'utf8'));
assert.ok(authStore.auth_sessions.some((session) => session.session_token === digest));
assert.ok(!authStore.auth_sessions.some((session) => session.session_token === token));

response = await request('/api/auth/me', { headers: { cookie } });
assert.deepEqual(await response.json(), { authenticated: true });
response = await request('/admin', { headers: { cookie } });
assert.equal(response.status, 200, 'admin page is accessible');

response = await request('/api/data/profile', {
  method: 'POST', headers: { ...jsonHeaders, cookie }, body: JSON.stringify({ data: { name: 'invalid' } }),
});
assert.equal(response.status, 400, 'invalid content is denied');
response = await request('/api/data/profile', {
  method: 'POST', headers: { ...jsonHeaders, cookie, origin: 'https://evil.example' }, body: '{}',
});
assert.equal(response.status, 403, 'cross-origin writes are denied');

if (process.env.PORTFOLIO_SMOKE_DRAFT_CHECK === '1') {
  const filename = 'data/portfolio-store.json';
  const original = readFileSync(filename);
  const draftData = JSON.parse(original);
  const marker = 'AUDIT_PRIVATE_DRAFT_MARKER';
  const originalCount = draftData.education.length;
  draftData.education[0].degree = marker;
  draftData.education[0].is_active = false;
  try {
    writeFileSync(filename, JSON.stringify(draftData));
    response = await request('/api/data/education');
    assert.equal((await response.json()).education.length, originalCount - 1);
    response = await request('/api/data/education', { headers: { cookie } });
    assert.equal((await response.json()).education.length, originalCount);
    response = await request('/', { headers: { 'cache-control': 'no-cache' } });
    assert.equal(response.status, 200);
    assert.ok(!(await response.text()).includes(marker), 'draft is absent from rendered HTML and hydration data');
  } finally {
    writeFileSync(filename, original);
  }
}

response = await request('/api/auth/logout', { method: 'POST', headers: { origin, cookie } });
assert.equal(response.status, 200);
response = await request('/api/auth/me', { headers: { cookie } });
assert.deepEqual(await response.json(), { authenticated: false }, 'logout revokes the session');
console.log('HTTP security smoke passed');
