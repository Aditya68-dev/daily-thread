import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { db } from '../firebase.js';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { Order, OrderStatus } from '../types.ts';
import { productService } from './productService.ts';

const LOCAL_ORDERS_KEY = 'dt_local_orders';
const RESET_FLAG_KEY = 'dt_orders_reset_fresh_v3';

function getStoredOrders(): Order[] {
  try {
    // Never clear existing local orders merely because this browser has no flag yet.
    // The flag is retained for backward compatibility with older installations.
    if (localStorage.getItem(RESET_FLAG_KEY) !== 'true') {
      localStorage.setItem(RESET_FLAG_KEY, 'true');
    }
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read local orders:', e);
  }
  return [];
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save local orders:', e);
  }
}

function orderFromFirestore(data: any): Order {
  return {
    ...data,
    id: data.id,
    userId: data.userId,
    orderNumber: data.orderNumber,
    items: data.items || [],
    status: data.status as OrderStatus,
    createdAt: typeof data.createdAt?.toDate === 'function'
      ? data.createdAt.toDate().toISOString()
      : data.createdAt
  } as Order;
}

function orderToFirestore(order: Order): Record<string, unknown> {
  // The UID is deliberately stored in the document, not inferred from email/phone.
  return { ...order, userId: order.userId };
}

async function saveOrderToFirestore(order: Order): Promise<void> {
  await setDoc(doc(db, 'orders', order.id), orderToFirestore(order), { merge: false });
}

async function migrateLocalOrders(userId: string, userEmail?: string): Promise<Order[]> {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const localOrders = getStoredOrders();
  const eligible = localOrders.filter(order =>
    order.userId === userId ||
    (!order.userId && cleanEmail && order.customerEmail?.trim().toLowerCase() === cleanEmail)
  );

  for (const order of eligible) {
    const migratedOrder = { ...order, userId };
    try {
      // setDoc with merge preserves any cloud fields already present and is idempotent.
      await setDoc(doc(db, 'orders', order.id), orderToFirestore(migratedOrder), { merge: true });
    } catch (error) {
      console.warn(`Firestore migration skipped for order ${order.id}:`, error);
    }
  }
  // Do not remove or rewrite local orders during migration.
  return eligible.map(order => order.userId === userId ? order : { ...order, userId });
}

function mergeOrders(...lists: Order[][]): Order[] {
  const byId = new Map<string, Order>();
  lists.flat().forEach(order => {
    if (order?.id && !byId.has(order.id)) byId.set(order.id, order);
  });
  return [...byId.values()].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function mapSupabaseOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    shippingAddress: o.shipping_address,
    district: o.district,
    city: o.city,
    province: o.province,
    postalCode: o.postal_code,
    notes: o.notes,
    shippingMethod: o.shipping_method,
    shippingCost: o.shipping_cost,
    subtotal: o.subtotal,
    grandTotal: o.grand_total,
    status: o.status as OrderStatus,
    items: o.items || [],
    whatsappText: o.whatsapp_text,
    snapToken: o.snap_token || o.snapToken || '',
    snapRedirectUrl: o.snap_redirect_url || o.snapRedirectUrl || '',
    paymentMethod: o.payment_method || 'Midtrans',
    paymentTime: o.payment_time,
    trackingNumber: o.tracking_number,
    courier: o.courier,
    createdAt: o.created_at
  };
}

export const orderService = {
  buildWhatsAppMessage(order: Order): string {
    const itemsList = order.items
      .map((item, i) => `${i + 1}. *${item.name}* (${item.brand})\n   - Ukuran: ${item.size} | Warna: ${item.color}\n   - Qty: ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')} = *Rp ${item.subtotal.toLocaleString('id-ID')}*`)
      .join('\n\n');

    return `*PESANAN BARU - DAILY THREAD*
----------------------------------------
*No. Pesanan:* ${order.orderNumber}
*Tanggal:* ${new Date(order.createdAt).toLocaleString('id-ID')}

*DATA PENERIMA:*
- Nama: ${order.customerName}
- No. WhatsApp: ${order.customerPhone}
- Email: ${order.customerEmail}
- Alamat Lengkap: ${order.shippingAddress}
- Kecamatan: ${order.district}
- Kota/Kab: ${order.city}, ${order.province} ${order.postalCode}
${order.notes ? `- Catatan: ${order.notes}\n` : ''}
*PENGIRIMAN:*
- Kurir: ${order.shippingMethod}
- Biaya Kirim: Rp ${order.shippingCost.toLocaleString('id-ID')}

*ITEM PESANAN:*
----------------------------------------
${itemsList}
----------------------------------------
*Subtotal Produk:* Rp ${order.subtotal.toLocaleString('id-ID')}
*Ongkos Kirim:* Rp ${order.shippingCost.toLocaleString('id-ID')}
*TOTAL PEMBAYARAN:* Rp ${order.grandTotal.toLocaleString('id-ID')}

Halo Admin Daily Thread, saya ingin mengonfirmasi pesanan di atas. Mohon info nomor rekening / pembayaran dan ketersediaan stoknya. Terima kasih!`;
  },

  async createOrder(orderData: any, userId?: string): Promise<{ order: Order; whatsappUrl: string }> {
    if (!userId) throw new Error('Silakan login dengan Google sebelum membuat pesanan.');

    const orderNumber = orderData.orderNumber || `DT-ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderData.id || `ord-${Date.now()}`,
      orderNumber,
      userId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      district: orderData.district,
      city: orderData.city,
      province: orderData.province || 'DKI Jakarta',
      postalCode: orderData.postalCode,
      notes: orderData.notes || '',
      shippingMethod: orderData.shippingMethod,
      shippingCost: orderData.shippingCost || 0,
      subtotal: orderData.subtotal,
      grandTotal: orderData.grandTotal,
      status: 'Menunggu Pembayaran',
      items: orderData.items,
      whatsappText: '',
      snapToken: orderData.snapToken || '',
      snapRedirectUrl: orderData.snapRedirectUrl || '',
      paymentMethod: orderData.paymentMethod || 'Midtrans',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    newOrder.whatsappText = this.buildWhatsAppMessage(newOrder);
    const config = productService.getStoreConfig();
    const cleanPhone = String(config.whatsappNumber).replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(newOrder.whatsappText)}`;

    try {
      await saveOrderToFirestore(newOrder);
    } catch (error) {
      console.warn('Firestore order insert warning; retaining local fallback:', error);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('orders').insert({
          id: newOrder.id, order_number: newOrder.orderNumber, user_id: userId,
          customer_name: newOrder.customerName, customer_phone: newOrder.customerPhone,
          customer_email: newOrder.customerEmail, shipping_address: newOrder.shippingAddress,
          district: newOrder.district, city: newOrder.city, province: newOrder.province,
          postal_code: newOrder.postalCode, notes: newOrder.notes,
          shipping_method: newOrder.shippingMethod, shipping_cost: newOrder.shippingCost,
          subtotal: newOrder.subtotal, grand_total: newOrder.grandTotal, status: newOrder.status,
          whatsapp_text: newOrder.whatsappText, snap_token: newOrder.snapToken,
          snap_redirect_url: newOrder.snapRedirectUrl, items: newOrder.items
        });
        if (error) console.warn('Supabase order insert warning:', error);
      } catch (err) {
        console.warn('Supabase createOrder error, saved locally:', err);
      }
    }

    const orders = getStoredOrders();
    saveStoredOrders([newOrder, ...orders.filter(o => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber)]);
    return { order: newOrder, whatsappUrl };
  },

  async getUserOrders(userId?: string, userEmail?: string, userPhone?: string): Promise<Order[]> {
    if (!userId) return [];
    let cloudOrders: Order[] = [];
    try {
      const snapshot = await getDocs(query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ));
      cloudOrders = snapshot.docs.map(item => orderFromFirestore(item.data()));
    } catch (error) {
      console.warn('Firestore fetch user orders fallback:', error);
    }

    const migrated = await migrateLocalOrders(userId, userEmail);
    const localOrders = getStoredOrders().filter(order =>
      order.userId === userId ||
      (!order.userId && userEmail && order.customerEmail?.trim().toLowerCase() === userEmail.trim().toLowerCase())
    );

    // Supabase remains a compatibility source, but Firebase UID is the primary key.
    let supabaseOrders: Order[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (!error && data) supabaseOrders = data.map(mapSupabaseOrder);
      } catch (error) {
        console.warn('Supabase fetch user orders fallback:', error);
      }
    }
    return mergeOrders(cloudOrders, migrated, localOrders, supabaseOrders);
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      if (snapshot.docs.length) return snapshot.docs.map(item => orderFromFirestore(item.data()));
    } catch (error) {
      console.warn('Firestore fetch all orders fallback:', error);
    }
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) return data.map(mapSupabaseOrder);
      } catch (error) {
        console.warn('Supabase fetch all orders error:', error);
      }
    }
    return getStoredOrders();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, { status });
  },

  async updateOrderFulfillment(orderId: string, payload: { status: OrderStatus; trackingNumber?: string; courier?: string; cancelReason?: string }): Promise<Order | null> {
    const updateData: Record<string, unknown> = { status: payload.status };
    if (payload.trackingNumber) updateData.trackingNumber = payload.trackingNumber;
    if (payload.courier) updateData.courier = payload.courier;
    if (payload.cancelReason) updateData.cancelReason = payload.cancelReason;
    if (payload.status === 'Shipped') updateData.shippedAt = new Date().toISOString();
    if (payload.status === 'Completed') updateData.completedAt = new Date().toISOString();

    try { await updateDoc(doc(db, 'orders', orderId), updateData); }
    catch (error) { console.warn('Firestore order status update warning:', error); }
    if (isSupabaseConfigured) {
      try {
        const supabaseData: any = { status: payload.status };
        if (payload.trackingNumber) supabaseData.tracking_number = payload.trackingNumber;
        if (payload.courier) supabaseData.courier = payload.courier;
        await supabase.from('orders').update(supabaseData).eq('id', orderId);
      } catch (error) { console.warn('Supabase update order fulfillment error:', error); }
    }

    const orders = getStoredOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) return null;
    const updated = { ...orders[index], ...payload } as Order;
    if (payload.status === 'Shipped') updated.shippedAt = updated.shippedAt || new Date().toISOString();
    if (payload.status === 'Completed') updated.completedAt = updated.completedAt || new Date().toISOString();
    orders[index] = updated;
    saveStoredOrders(orders);
    return updated;
  },

  async markOrderAsPaid(orderId: string, paymentMethod = 'Midtrans'): Promise<Order | null> {
    const paymentTime = new Date().toISOString();
    try { await updateDoc(doc(db, 'orders', orderId), { status: 'Sudah Bayar', paymentMethod, paymentTime }); }
    catch (error) { console.warn('Firestore mark order paid warning:', error); }
    if (isSupabaseConfigured) {
      try { await supabase.from('orders').update({ status: 'Sudah Bayar', payment_method: paymentMethod, payment_time: paymentTime }).eq('id', orderId); }
      catch (error) { console.warn('Supabase mark order paid error:', error); }
    }
    const orders = getStoredOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index === -1) return null;
    orders[index] = { ...orders[index], status: 'Sudah Bayar', paymentMethod, paymentTime };
    saveStoredOrders(orders);
    return orders[index];
  },

  async cancelOrder(orderId: string, reason = 'Dibatalkan oleh pembeli'): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, { status: 'Dibatalkan', cancelReason: reason });
  },

  async markOrderAsExpired(orderId: string): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, { status: 'Kadaluarsa', cancelReason: 'Batas waktu pembayaran telah habis (24 jam)' });
  },

  resetOrders(): void {
    // Retained for the existing admin control; normal synchronization never calls this.
    saveStoredOrders([]);
  }
};
