const http = require('http');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json });
      });
    });

    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('TIMEOUT'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('=== BREWPOINT FULL API HEALTH AUDIT ===\n');
  const tests = [
    { name: 'GET /api/products', url: 'http://localhost:3000/api/products' },
    { name: 'GET /api/categories', url: 'http://localhost:3000/api/categories' },
    { name: 'GET /api/orders', url: 'http://localhost:3000/api/orders' },
    { name: 'GET /api/orders?status=PENDING,IN_PROGRESS', url: 'http://localhost:3000/api/orders?status=PENDING,IN_PROGRESS' },
    { name: 'GET /api/shift', url: 'http://localhost:3000/api/shift' },
    { name: 'GET /api/shift?all=true', url: 'http://localhost:3000/api/shift?all=true' },
    { name: 'GET /api/inventory', url: 'http://localhost:3000/api/inventory' },
    { name: 'GET /api/reports?range=today (OWNER)', url: 'http://localhost:3000/api/reports?range=today', headers: { 'x-user-role': 'OWNER' } },
    { name: 'GET /api/reports?range=today (CASHIER - security hidden)', url: 'http://localhost:3000/api/reports?range=today', headers: { 'x-user-role': 'CASHIER' } },
    { name: 'GET /api/settings', url: 'http://localhost:3000/api/settings' },
    { name: 'GET /api/users', url: 'http://localhost:3000/api/users' },
    { name: 'GET /api/dashboard', url: 'http://localhost:3000/api/dashboard' },
    { name: 'GET /api/customer-display', url: 'http://localhost:3000/api/customer-display' },
    { 
      name: 'POST /api/customer-display', 
      url: 'http://localhost:3000/api/customer-display',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { status: 'IDLE', cart: [], customerName: '', grandTotal: 0 }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await request(t.url, { method: t.method || 'GET', headers: t.headers }, t.body);
      if (res.status >= 200 && res.status < 300) {
        console.log(`[PASS] ${t.name} -> ${res.status}`);
        passed++;
      } else {
        console.log(`[FAIL] ${t.name} -> ${res.status}`);
        console.log('   Response:', res.body.slice(0, 150));
        failed++;
      }
    } catch (err) {
      console.log(`[ERR]  ${t.name} -> ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
