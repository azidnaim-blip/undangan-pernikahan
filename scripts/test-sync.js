const http = require('http');

function postState(state) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(state);
    const req = http.request(
      'http://127.0.0.1:3000/api/customer-display',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(JSON.parse(body)));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getState() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000/api/customer-display', (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

async function testSync() {
  console.log('Testing cross-device Customer Display State synchronization...\n');

  // Step 1: Simulate POS adding items
  const activeOrderState = {
    status: 'ACTIVE_ORDER',
    cart: [
      {
        cartItemId: 'item-1',
        productId: 'prod-1',
        productName: 'Signature Flat White',
        unitPrice: 32000,
        quantity: 2,
        subtotal: 64000,
        modifiers: [],
        notes: 'Less Sugar',
      },
    ],
    customerName: 'Budi Santoso',
    orderType: 'DINE_IN',
    subtotal: 64000,
    discount: 5000,
    grandTotal: 59000,
    timestamp: Date.now(),
  };

  const postRes = await postState(activeOrderState);
  console.log('POST /api/customer-display result:', postRes);

  const getRes = await getState();
  console.log('GET /api/customer-display retrieved status:', getRes.status);
  console.log('Customer name:', getRes.customerName);
  console.log('Grand total:', getRes.grandTotal);
  console.log('Items in cart:', getRes.cart.length);

  if (getRes.status === 'ACTIVE_ORDER' && getRes.grandTotal === 59000 && getRes.cart[0].productName === 'Signature Flat White') {
    console.log('\n✓ Cross-device sync verified successfully!');
  } else {
    console.error('\n❌ Sync mismatch detected!');
  }

  // Reset to IDLE
  await postState({
    status: 'IDLE',
    cart: [],
    customerName: '',
    orderType: 'DINE_IN',
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
    paymentMethod: null,
    completedOrder: null,
    timestamp: Date.now(),
  });
  console.log('Reset display back to IDLE successfully.');
}

testSync().catch(console.error);
