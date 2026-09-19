import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { Order, OrderStatus } from '../types.ts';
import { productService } from './productService.ts';
import { SEED_ORDERS } from '../data/initialData.ts';

const LOCAL_ORDERS_KEY = 'dt_local_orders';
const RESET_FLAG_KEY = 'dt_orders_reset_fresh_v3';

function getStoredOrders(): Order[] {
  try {
    if (localStorage.getItem(RESET_FLAG_KEY) !== 'true') {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([]));
      localStorage.setItem(RESET_FLAG_KEY, 'true');
      return [];
    }
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([]));
  return [];
}

function saveStoredOrders(orders: Order[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
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

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          user_id: userId,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          customer_email: newOrder.customerEmail,
          shipping_address: newOrder.shippingAddress,
          district: newOrder.district,
          city: newOrder.city,
          province: newOrder.province,
          postal_code: newOrder.postalCode,
          notes: newOrder.notes,
          shipping_method: newOrder.shippingMethod,
          shipping_cost: newOrder.shippingCost,
          subtotal: newOrder.subtotal,
          grand_total: newOrder.grandTotal,
          status: newOrder.status,
          whatsapp_text: newOrder.whatsappText,
          snap_token: newOrder.snapToken,
          snap_redirect_url: newOrder.snapRedirectUrl,
          items: newOrder.items
        });

        if (error) {
          console.warn('Supabase order insert warning:', error);
        }
      } catch (err) {
        console.warn('Supabase createOrder error, saved locally:', err);
      }
    }

    // Save locally
    const orders = getStoredOrders();
    // Prevent duplicate orders in local storage
    const filteredOrders = orders.filter(o => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber);
    saveStoredOrders([newOrder, ...filteredOrders]);

    return { order: newOrder, whatsappUrl };
  },

  async getUserOrders(userId?: string, userEmail?: string, userPhone?: string): Promise<Order[]> {
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');

    if (isSupabaseConfigured && (userId || cleanEmail)) {
      try {
        let query = supabase.from('orders').select('*');
        if (userId && cleanEmail) {
          query = query.or(`user_id.eq.${userId},customer_email.ilike.${cleanEmail}`);
        } else if (userId) {
          query = query.eq('user_id', userId);
        } else if (cleanEmail) {
          query = query.ilike('customer_email', cleanEmail);
        }
        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((o: any) => ({
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
            createdAt: o.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch user orders fallback:', err);
      }
    }

    const all = getStoredOrders();
    let hasUpdates = false;

    const userOrders = all.filter(o => {
      const matchId = Boolean(userId && o.userId === userId);
      const matchEmail = Boolean(cleanEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail);
      const matchPhone = Boolean(cleanPhone && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '') === cleanPhone);

      if (matchEmail || matchPhone) {
        // Link to user if was unassigned
        if (userId && !o.userId) {
          o.userId = userId;
          hasUpdates = true;
        }
        return true;
      }
      return matchId;
    });

    if (hasUpdates) {
      saveStoredOrders(all);
    }

    return userOrders;
  },

  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((o: any) => ({
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
            createdAt: o.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch all orders error:', err);
      }
    }

    return getStoredOrders();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, { status });
  },

  async updateOrderFulfillment(
    orderId: string, 
    payload: {
      status: OrderStatus;
      trackingNumber?: string;
      courier?: string;
      cancelReason?: string;
    }
  ): Promise<Order | null> {
    if (isSupabaseConfigured) {
      try {
        const updateData: any = { status: payload.status };
        if (payload.trackingNumber) updateData.tracking_number = payload.trackingNumber;
        if (payload.courier) updateData.courier = payload.courier;
        await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase update order fulfillment error:', err);
      }
    }

    const orders = getStoredOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      const order = orders[idx];
      order.status = payload.status;
      if (payload.trackingNumber) order.trackingNumber = payload.trackingNumber;
      if (payload.courier) order.courier = payload.courier;
      if (payload.cancelReason) order.cancelReason = payload.cancelReason;
      
      if (payload.status === 'Shipped') {
        order.shippedAt = order.shippedAt || new Date().toISOString();
      }
      if (payload.status === 'Completed') {
        order.completedAt = order.completedAt || new Date().toISOString();
      }
      
      saveStoredOrders(orders);
      return order;
    }
    return null;
  },

  async markOrderAsPaid(orderId: string, paymentMethod = 'Midtrans'): Promise<Order | null> {
    const orders = getStoredOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'Sudah Bayar';
      orders[idx].paymentMethod = paymentMethod;
      orders[idx].paymentTime = new Date().toISOString();
      saveStoredOrders(orders);

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('orders')
            .update({
              status: 'Sudah Bayar',
              payment_method: paymentMethod,
              payment_time: orders[idx].paymentTime
            })
            .eq('id', orderId);
        } catch (err) {
          console.warn('Supabase mark order paid error:', err);
        }
      }
      return orders[idx];
    }
    return null;
  },

  async cancelOrder(orderId: string, reason = 'Dibatalkan oleh pembeli'): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, {
      status: 'Dibatalkan',
      cancelReason: reason
    });
  },

  async markOrderAsExpired(orderId: string): Promise<Order | null> {
    return this.updateOrderFulfillment(orderId, {
      status: 'Kadaluarsa',
      cancelReason: 'Batas waktu pembayaran telah habis (24 jam)'
    });
  },

  resetOrders(): void {
    saveStoredOrders([]);
  }
};
