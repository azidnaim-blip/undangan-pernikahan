const http = require('http');

const routes = [
  '/',
  '/pos',
  '/customer-display',
  '/kds',
  '/dashboard',
  '/shift',
  '/inventory',
  '/reports',
  '/settings',
  '/team',
  '/api/customer-display',
  '/api/categories',
  '/api/products',
  '/api/shift',
  '/api/orders'
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, (res) => {
      resolve({ path, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
    req.setTimeout(35000, () => {
      req.destroy();
      resolve({ path, error: 'TIMEOUT' });
    });
  });
}

async function run() {
  console.log('Testing all endpoints on http://127.0.0.1:3000...\n');
  let hasError = false;
  for (const r of routes) {
    const result = await checkRoute(r);
    if (result.status === 200) {
      console.log(`[PASS] ${result.path} -> ${result.status}`);
    } else {
      console.log(`[FAIL] ${result.path} -> ${result.status || result.error}`);
      hasError = true;
    }
  }
  if (!hasError) {
    console.log('\n✓ ALL 14 ENDPOINTS RETURNED 200 OK!');
  } else {
    console.log('\n❌ SOME ENDPOINTS ENCOUNTERED ERRORS!');
  }
}

run();
