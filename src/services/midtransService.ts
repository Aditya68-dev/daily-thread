import { Order } from '../types.ts';

export interface MidtransConfig {
  merchantId?: string;
  clientKey: string;
  isProduction: boolean;
}

// Client configuration is safe for browser bundle (Frontend ONLY)
// Server Key MUST NEVER be defined or imported here.
export const MIDTRANS_CONFIG: MidtransConfig = {
  clientKey: (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-RXwaDX-qwGpMD5X_',
  isProduction: (import.meta as any).env?.VITE_MIDTRANS_IS_PRODUCTION === 'true'
};

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
      embed?: (token: string, options: any) => void;
    };
  }
}

export const midtransService = {
  getConfig(): MidtransConfig {
    return {
      clientKey: (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY || MIDTRANS_CONFIG.clientKey,
      isProduction: (import.meta as any).env?.VITE_MIDTRANS_IS_PRODUCTION === 'true' || MIDTRANS_CONFIG.isProduction
    };
  },

  /**
   * Dynamically ensure Midtrans Snap.js script is loaded with valid Client Key
   */
  async ensureSnapLoaded(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (window.snap && typeof window.snap.pay === 'function') return true;

    const config = this.getConfig();
    const snapScriptUrl = config.isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    return new Promise((resolve) => {
      // Check existing script tag
      const existingScript = document.querySelector(`script[src*="snap/snap.js"]`) as HTMLScriptElement;
      if (existingScript) {
        if (window.snap) {
          resolve(true);
        } else {
          existingScript.addEventListener('load', () => resolve(true), { once: true });
          existingScript.addEventListener('error', () => resolve(false), { once: true });
          setTimeout(() => resolve(!!window.snap), 3000);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', config.clientKey);
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Gagal memuat script Midtrans Snap.js dari:', snapScriptUrl);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  },

  /**
   * Request real Midtrans Snap transaction token via secure backend API endpoint
   * Server Key is used solely on the server side (/api/midtrans/create-transaction).
   */
  async createTransaction(order: Order): Promise<{ token: string; redirect_url: string }> {
    const snapOrderId = order.orderNumber || `DT-ORD-${Date.now()}`;

    // Item details: sum of price * quantity must match gross_amount
    const items = (order.items || []).map((item, idx) => ({
      id: String(item.productId || `item-${idx + 1}`).substring(0, 50),
      price: Math.max(1, Math.round(Number(item.price) || 0)),
      quantity: Math.max(1, Number(item.quantity) || 1),
      name: (item.name || 'Produk Fashion').substring(0, 50)
    }));

    const itemsSubtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const shippingCost = Math.round(Number(order.shippingCost) || 0);

    if (shippingCost > 0) {
      items.push({
        id: 'SHIPPING_FEE',
        price: shippingCost,
        quantity: 1,
        name: `Ongkir: ${order.shippingMethod || 'Reguler'}`.substring(0, 50)
      });
    }

    const calculatedGrossAmount = itemsSubtotal + shippingCost;
    const finalGrossAmount = calculatedGrossAmount > 0 
      ? calculatedGrossAmount 
      : Math.round(Number(order.grandTotal) || 10000);

    const payload = {
      transaction_details: {
        order_id: snapOrderId,
        gross_amount: finalGrossAmount
      },
      customer_details: {
        first_name: (order.customerName || 'Customer').substring(0, 50),
        email: order.customerEmail || 'customer@dailythread.com',
        phone: (order.customerPhone || '081234567890').replace(/[^0-9]/g, '').substring(0, 15) || '081234567890',
        billing_address: {
          first_name: order.customerName || 'Customer',
          phone: order.customerPhone || '081234567890',
          address: (order.shippingAddress || 'Alamat Customer').substring(0, 100),
          city: (order.city || 'Kota').substring(0, 50),
          postal_code: (order.postalCode || '12345').substring(0, 10)
        },
        shipping_address: {
          first_name: order.customerName || 'Customer',
          phone: order.customerPhone || '081234567890',
          address: (order.shippingAddress || 'Alamat Customer').substring(0, 100),
          city: (order.city || 'Kota').substring(0, 50),
          postal_code: (order.postalCode || '12345').substring(0, 10)
        }
      },
      item_details: items
    };

    let response: Response;
    try {
      response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (networkError: any) {
      console.error('Koneksi gagal ke backend Midtrans:', networkError);
      throw new Error('Tidak dapat terhubung ke endpoint backend pembayaran. Periksa koneksi internet atau server backend.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const serverMessage = errorData?.error || errorData?.status_message || `HTTP ${response.status}: Gagal membuat transaksi di Midtrans`;
      console.error('Midtrans create-transaction failed:', serverMessage);
      throw new Error(serverMessage);
    }

    const data = await response.json();
    if (!data || !data.token) {
      throw new Error('Respons Midtrans tidak memiliki Snap Token yang valid.');
    }

    const config = this.getConfig();
    const defaultRedirectUrl = config.isProduction
      ? `https://app.midtrans.com/snap/v4/redirection/${data.token}`
      : `https://app.sandbox.midtrans.com/snap/v4/redirection/${data.token}`;

    return {
      token: data.token,
      redirect_url: data.redirect_url || defaultRedirectUrl
    };
  },

  /**
   * Check Midtrans Transaction Status strictly from Backend API (/api/midtrans/status)
   */
  async checkTransactionStatus(orderNumber: string): Promise<{
    isPaid: boolean;
    status: string;
    transactionStatus?: string;
    paymentType?: string;
    raw?: any;
  }> {
    try {
      const res = await fetch(`/api/midtrans/status?order_id=${encodeURIComponent(orderNumber)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        return { 
          isPaid: false, 
          status: errJson?.status_message || (res.status === 404 ? 'not_found' : 'error') 
        };
      }

      const data = await res.json();
      const txStatus = (data.transaction_status || '').toLowerCase();
      const fraudStatus = (data.fraud_status || '').toLowerCase();

      // Only settlement or capture (with accept fraud) are considered valid paid status in Midtrans
      const isPaid = txStatus === 'settlement' || (txStatus === 'capture' && (fraudStatus === 'accept' || !fraudStatus));

      return {
        isPaid,
        status: txStatus || data.status_message || 'pending',
        transactionStatus: data.transaction_status,
        paymentType: data.payment_type,
        raw: data
      };
    } catch (err) {
      console.warn('Gagal memverifikasi status transaksi Midtrans:', err);
      return { isPaid: false, status: 'network_error' };
    }
  },

  /**
   * Check if Midtrans Snap popup iframe is currently open in view
   */
  isSnapOpen(): boolean {
    if (typeof document !== 'undefined') {
      const snapElem = document.getElementById('snap-midtrans') || 
                       document.getElementById('snap-container') ||
                       document.querySelector('iframe[id*="snap"]') ||
                       document.querySelector('iframe[src*="midtrans.com"]');
      if (snapElem) return true;
    }
    return false;
  },

  /**
   * Launch official Midtrans Snap popup safely
   */
  async launchSnap(
    token: string,
    callbacks: {
      onSuccess?: (result: any) => void;
      onPending?: (result: any) => void;
      onError?: (result: any) => void;
      onClose?: () => void;
    }
  ): Promise<boolean> {
    await this.ensureSnapLoaded();

    if (typeof window !== 'undefined' && window.snap && typeof window.snap.pay === 'function') {
      if (this.isSnapOpen()) {
        console.log('Midtrans Snap popup is already active in view.');
        return true;
      }

      try {
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            callbacks.onSuccess?.(result);
          },
          onPending: (result: any) => {
            callbacks.onPending?.(result);
          },
          onError: (result: any) => {
            callbacks.onError?.(result);
          },
          onClose: () => {
            callbacks.onClose?.();
          }
        });
        return true;
      } catch (err: any) {
        const errorMsg = String(err?.message || err);
        if (errorMsg.includes('PopupInView') || errorMsg.includes('Invalid state transition')) {
          console.log('Snap popup already visible.');
          return true;
        }
        console.warn('Failed to invoke window.snap.pay:', err);
        return false;
      }
    }
    return false;
  }
};
