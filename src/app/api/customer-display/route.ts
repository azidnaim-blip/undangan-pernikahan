import { NextResponse } from 'next/server';

// Global in-memory cache for customer display state across devices
let currentCustomerDisplayState: any = {
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
};

export async function GET() {
  return NextResponse.json(currentCustomerDisplayState, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    currentCustomerDisplayState = {
      ...body,
      timestamp: Date.now(),
    };
    return NextResponse.json({ success: true, timestamp: currentCustomerDisplayState.timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid state' }, { status: 400 });
  }
}
