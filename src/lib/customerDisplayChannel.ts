export interface CustomerDisplayItem {
  cartItemId: string;
  productId: string;
  productName: string;
  image?: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  modifiers: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }[];
  notes: string;
}

export interface CustomerDisplayState {
  status: 'IDLE' | 'ACTIVE_ORDER' | 'PAYMENT' | 'SUCCESS';
  cart: CustomerDisplayItem[];
  customerName: string;
  orderType: 'DELIVERY' | 'DINE_IN' | 'TAKEAWAY';
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod?: 'CASH' | 'QRIS' | null;
  completedOrder?: {
    orderNumber: string;
    customerName: string;
    total: number;
    change: number;
    itemsCount: number;
  } | null;
  timestamp?: number;
}

const CHANNEL_NAME = 'brewpoint_customer_display';
const STORAGE_KEY = 'brewpoint_customer_display_state';

export const initialCustomerDisplayState: CustomerDisplayState = {
  status: 'IDLE',
  cart: [],
  customerName: '',
  orderType: 'DINE_IN',
  subtotal: 0,
  discount: 0,
  grandTotal: 0,
  paymentMethod: null,
  completedOrder: null,
};

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported or failed to initialize', e);
    }
  }
  return broadcastChannel;
}

export function broadcastCustomerDisplay(state: CustomerDisplayState) {
  if (typeof window === 'undefined') return;

  const payload: CustomerDisplayState = {
    ...state,
    timestamp: Date.now(),
  };

  // 1. Send via native BroadcastChannel (0ms latency, works across tabs and windows on same PC)
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      console.warn('Broadcast postMessage error', e);
    }
  }

  // 2. Storage fallback (for cross-window storage event listener)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or security errors
  }

  // 3. Server API sync (for cross-device synchronization between laptop POS & smartphone customer display)
  fetch('/api/customer-display', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export function subscribeCustomerDisplay(callback: (state: CustomerDisplayState) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let lastTimestamp = 0;

  const handleUpdate = (state: CustomerDisplayState) => {
    if (state && (!state.timestamp || state.timestamp >= lastTimestamp)) {
      if (state.timestamp) lastTimestamp = state.timestamp;
      callback(state);
    }
  };

  // 1. BroadcastChannel listener (same origin, 0ms)
  const channel = getBroadcastChannel();
  const handleMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object') {
      handleUpdate(event.data as CustomerDisplayState);
    }
  };

  // 2. Storage listener
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        handleUpdate(parsed as CustomerDisplayState);
      } catch {
        // Ignore JSON parse error
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);

  // 3. Cross-device server polling (adaptive 2s for tablets/smartphones on separate network/devices)
  const syncWithServer = async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch('/api/customer-display', { cache: 'no-store' });
      if (res.ok) {
        const remoteState: CustomerDisplayState = await res.json();
        if (remoteState && remoteState.timestamp && remoteState.timestamp > lastTimestamp) {
          handleUpdate(remoteState);
        }
      }
    } catch {
      // offline fallback
    }
  };

  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      syncWithServer();
    }
  };

  syncWithServer();
  const pollInterval = setInterval(syncWithServer, 2000);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return unsubscribe cleanup function
  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(pollInterval);
  };
}

export function getCachedCustomerDisplayState(): CustomerDisplayState {
  if (typeof window === 'undefined') return initialCustomerDisplayState;
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Fallback
  }
  return initialCustomerDisplayState;
}
