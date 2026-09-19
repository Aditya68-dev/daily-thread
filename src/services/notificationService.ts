import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { NotificationItem } from '../types.ts';

const LOCAL_NOTIFS_KEY = 'dt_local_notifications';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Selamat Datang di Daily Thread! 🔥',
    message: 'Jelajahi 250+ koleksi streetwear, oversize tees, dan daily outfit premium kami dengan kualitas standar internasional.',
    type: 'promo',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: 'shop',
    actionLabel: 'Jelajahi Katalog'
  },
  {
    id: 'notif-2',
    title: 'Gratis Ongkir Khusus Hari Ini 🚚',
    message: 'Dapatkan bebas biaya pengiriman ke seluruh kota di Indonesia untuk setiap pembelanjaan di atas Rp 500.000.',
    type: 'promo',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: 'shop',
    actionLabel: 'Belanja Sekarang'
  },
  {
    id: 'notif-3',
    title: 'New Drop Alert: Selvedge Denim & Tactical Cargo',
    message: 'Batch terbaru Japanese shuttle loom selvedge denim 14oz dan heavy tactical pants kini sudah resmi dirilis di katalog.',
    type: 'stock',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: 'shop',
    actionLabel: 'Lihat Produk Baru'
  },
  {
    id: 'notif-4',
    title: 'Bantuan Layanan & Customer Care WhatsApp 💬',
    message: 'Perlu konsultasi ukuran, status pesanan, atau rekomendasi styling? Hubungi Customer Support kami langsung via WhatsApp di 0889-5204-312.',
    type: 'account',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    actionUrl: 'whatsapp',
    actionLabel: 'Hubungi WhatsApp'
  }
];

function getStoredNotifications(userId?: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTIFS_KEY}_${userId || 'guest'}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NOTIFICATIONS;
}

function saveStoredNotifications(notifs: NotificationItem[], userId?: string) {
  localStorage.setItem(`${LOCAL_NOTIFS_KEY}_${userId || 'guest'}`, JSON.stringify(notifs));
}

export const notificationService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.is_read,
            createdAt: n.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase notifications fetch error:', err);
      }
    }

    return getStoredNotifications(userId);
  },

  async markAllAsRead(userId?: string): Promise<void> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase mark read error:', err);
      }
    }

    const notifs = getStoredNotifications(userId);
    const updated = notifs.map(n => ({ ...n, isRead: true }));
    saveStoredNotifications(updated, userId);
  },

  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase mark one read error:', err);
      }
    }

    const notifs = getStoredNotifications(userId);
    const updated = notifs.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveStoredNotifications(updated, userId);
  },

  async deleteNotification(notificationId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase delete notif error:', err);
      }
    }

    const notifs = getStoredNotifications(userId);
    const updated = notifs.filter(n => n.id !== notificationId);
    saveStoredNotifications(updated, userId);
  },

  async addNotification(item: Partial<NotificationItem>, userId?: string): Promise<NotificationItem> {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: item.title || 'Notifikasi Daily Thread',
      message: item.message || '',
      type: item.type || 'account',
      isRead: false,
      createdAt: new Date().toISOString(),
      orderNumber: item.orderNumber,
      actionUrl: item.actionUrl,
      actionLabel: item.actionLabel
    };

    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('notifications').insert({
          id: notif.id,
          user_id: userId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          is_read: false
        });
      } catch (err) {
        console.warn('Supabase add notif error:', err);
      }
    }

    const notifs = getStoredNotifications(userId);
    saveStoredNotifications([notif, ...notifs], userId);
    return notif;
  }
};
