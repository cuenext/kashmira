const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

async function unusedPort() {
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  return port;
}

function request(port, pathname) {
  return new Promise((resolve, reject) => {
    // Keep the raw path: URL normalization would hide encoded traversal attempts.
    const req = http.get({ hostname: '127.0.0.1', port, path: pathname }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
      response.on('error', reject);
    });
    req.setTimeout(5000, () => req.destroy(new Error('Preview request timed out')));
    req.on('error', reject);
  });
}

(async () => {
  const port = await unusedPort();
  const child = spawn(process.execPath, ['scripts/serve.cjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => finish(new Error('Preview did not start: ' + stderr)), 5000);
      const ready = () => { if (stdout.includes('Local preview:')) finish(); };
      const exited = code => finish(new Error('Preview exited before starting (' + code + '): ' + stderr));
      function finish(error) {
        clearTimeout(timeout);
        child.stdout.off('data', ready);
        child.off('error', finish);
        child.off('exit', exited);
        error ? reject(error) : resolve();
      }
      child.stdout.on('data', ready);
      child.once('error', finish);
      child.once('exit', exited);
      ready();
    });

    for (const [pathname, type] of [
      ['/', 'text/html'],
      ['/assets/app.css', 'text/css'],
      ['/assets/app.js', 'text/javascript'],
      ['/assets/fonts/nunito-latin.woff2', 'font/woff2']
    ]) {
      const response = await request(port, pathname);
      assert.equal(response.status, 200, pathname + ' remains available');
      assert.ok(response.headers['content-type'].startsWith(type), pathname + ' retains its MIME type');
      assert.equal(response.headers['cache-control'], 'no-store', pathname + ' disables preview caching');
    }

    for (const [pathname, status] of [
      ['/%00', 400],
      ['/%E0%A4%A', 400],
      ['/%2e%2e%2fpackage.json', 403]
    ]) {
      const response = await request(port, pathname).catch(error => ({ status: error.code || error.message }));
      assert.equal(response.status, status, pathname + ' returns a controlled response instead of stopping the server\n' + stderr);
      const healthy = await request(port, '/index.html');
      assert.equal(healthy.status, 200, 'Preview stays available after ' + pathname);
      assert.match(healthy.body.toString(), /<!doctype html>/i, 'Subsequent requests return the actual page');
    }
    assert.equal(stderr, '', 'Malformed requests do not cause uncaught errors');
    console.log('PASS isolated preview server: encoded null, malformed encoding, traversal, continued availability, MIME types and no-store');
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const closed = once(child, 'close');
      child.kill();
      await closed;
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
