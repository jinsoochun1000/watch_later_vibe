// Real Oracle + Redis smoke test. Creates and deletes only its own temporary post.
const base = process.env.SMOKE_BASE_URL || 'http://localhost:8080';
const authHeaders = { 'X-Watchlater-Client': '1', Origin: 'http://localhost:5173' };
let cookie = '';
async function auth(path, body) {
  const response = await fetch(`${base}/api/auth/${path}`, {
    method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json', Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.getSetCookie()[0];
  if (setCookie) cookie = setCookie.split(';')[0];
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const session = await auth('login', { username: process.env.SMOKE_USERNAME || 'stk1', password: process.env.SMOKE_PASSWORD || 'stk1' });
const headers = { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' };
let created;
try {
  const title = `한글 연동 검증 ${Date.now()}`;
  const response = await fetch(`${base}/api/posts`, { method: 'POST', headers, body: JSON.stringify({ title, videoUrl: 'https://youtu.be/dQw4w9WgXcQ', content: 'Oracle UTF-8 저장 확인', status: 'NEW' }) });
  if (response.status !== 201) throw new Error(`Create: ${response.status}`);
  created = await response.json();
  if (created.title !== title) throw new Error('UTF-8 title roundtrip failed');
  const list = await (await fetch(`${base}/api/posts`)).json();
  if (!list.some(post => post.id === created.id && post.title === title)) throw new Error('Oracle list roundtrip failed');
  const update = await fetch(`${base}/api/posts/${created.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...created, title: '수정 완료', status: 'DONE' }) });
  const updated = await update.json();
  if (!update.ok || updated.title !== '수정 완료' || updated.status !== 'DONE') throw new Error('Update failed');
  const stale = await fetch(`${base}/api/posts/${created.id}`, { method: 'PUT', headers, body: JSON.stringify(created) });
  if (stale.status !== 409) throw new Error('Stale update was not rejected');
  const oldCookie = cookie;
  const refreshed = await auth('refresh');
  if (!refreshed.accessToken || cookie === oldCookie) throw new Error('Refresh rotation failed');
  const reused = await fetch(`${base}/api/auth/refresh`, { method: 'POST', headers: { ...authHeaders, Cookie: oldCookie } });
  if (reused.status !== 401) throw new Error('Consumed refresh token was accepted');
  await auth('logout');
  const loggedOut = await fetch(`${base}/api/auth/refresh`, { method: 'POST', headers: { ...authHeaders, Cookie: cookie } });
  if (loggedOut.status !== 401) throw new Error('Refresh succeeded after logout');
  const anonymous = await fetch(`${base}/api/posts/${created.id}`, { method: 'DELETE' });
  if (anonymous.status !== 401) throw new Error('Anonymous deletion was not rejected');
  console.log('PASS: login, Oracle UTF-8 CRUD, version conflict, Redis rotation/replay rejection, logout, anonymous protection');
} finally {
  if (created) {
    const removed = await fetch(`${base}/api/posts/${created.id}`, { method: 'DELETE', headers });
    if (removed.status !== 204) throw new Error('Smoke test post cleanup failed');
    console.log('PASS: deleted only the post created by this smoke test');
  }
}
