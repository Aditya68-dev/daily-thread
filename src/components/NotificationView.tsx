import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Package, 
  Tag, 
  Sparkles, 
  User, 
  Trash2, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  ShoppingBag, 
  Check, 
  Search,
  MessageCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { NotificationItem } from '../types.ts';

export const NotificationView: React.FC = () => {
  const { 
    notifications, 
    selectedNotificationId, 
    setSelectedNotificationId, 
    markNotificationsAsRead, 
    markNotificationAsRead, 
    deleteNotification, 
    setActiveView 
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'order' | 'promo' | 'stock' | 'account'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Filter & Search
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      // Category / Tab filter
      if (activeFilter === 'unread' && item.isRead) return false;
      if (activeFilter !== 'all' && activeFilter !== 'unread' && item.type !== activeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMessage = item.message.toLowerCase().includes(q);
        const matchOrder = item.orderNumber?.toLowerCase().includes(q);
        return matchTitle || matchMessage || matchOrder;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Selected Notification Item
  const activeNotification = useMemo(() => {
    if (selectedNotificationId) {
      const found = notifications.find(n => n.id === selectedNotificationId);
      if (found) return found;
    }
    return filteredNotifications.length > 0 ? filteredNotifications[0] : null;
  }, [selectedNotificationId, notifications, filteredNotifications]);

  const handleSelectNotification = (item: NotificationItem) => {
    setSelectedNotificationId(item.id);
    setMobileShowDetail(true);
    if (!item.isRead) {
      markNotificationAsRead(item.id);
    }
  };

  const getIcon = (type: string, isBig = false) => {
    const size = isBig ? 'w-6 h-6' : 'w-4 h-4';
    switch (type) {
      case 'order':
        return <Package className={`${size} text-emerald-600`} />;
      case 'cart':
        return <ShoppingBag className={`${size} text-blue-600`} />;
      case 'promo':
        return <Tag className={`${size} text-amber-600`} />;
      case 'stock':
        return <Sparkles className={`${size} text-indigo-600`} />;
      case 'account':
        return <User className={`${size} text-purple-600`} />;
      default:
        return <Bell className={`${size} text-neutral-600`} />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Pesanan</span>;
      case 'cart':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Keranjang</span>;
      case 'promo':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Promo & Diskon</span>;
      case 'stock':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Koleksi Baru</span>;
      case 'account':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Akun & Layanan</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">Pemberitahuan</span>;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Baru saja';
      if (mins < 60) return `${mins} menit yang lalu`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} jam yang lalu`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} hari yang lalu`;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Beberapa waktu lalu';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleActionClick = (item: NotificationItem) => {
    if (item.actionUrl === 'whatsapp' || item.type === 'account' && item.title.includes('WhatsApp')) {
      window.open('https://wa.me/628895204312?text=Halo%20Admin%20Daily%20Thread,%20saya%20ingin%20bertanya%20mengenai%20pesanan%20saya.', '_blank');
      return;
    }

    if (item.type === 'order' || item.actionUrl === 'orders' || item.orderNumber) {
      setActiveView('orders');
      return;
    }

    if (item.type === 'promo' || item.type === 'stock' || item.actionUrl === 'shop') {
      setActiveView('shop');
      return;
    }

    if (item.type === 'cart' || item.actionUrl === 'cart') {
      setActiveView('cart');
      return;
    }

    setActiveView('shop');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="pb-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Notification Center
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {unreadCount} Pesan Baru
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1 flex items-center gap-3">
            <span>Pesan & Notifikasi</span>
            <Bell className="w-6 h-6 text-neutral-800 hidden sm:inline-block" />
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Pusat update status pesanan, verifikasi pembayaran Midtrans, rilis produk, dan informasi akun Anda.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markNotificationsAsRead}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          <a
            href="https://wa.me/628895204312?text=Halo%20Admin%20Daily%20Thread,%20saya%20butuh%20bantuan."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat CS Admin</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua', count: notifications.length },
            { id: 'unread', label: 'Belum Dibaca', count: unreadCount },
            { id: 'order', label: 'Pesanan' },
            { id: 'promo', label: 'Promo' },
            { id: 'stock', label: 'Rilis Produk' },
            { id: 'account', label: 'Akun' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari pesan / no. order..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
          />
        </div>
      </div>

      {/* Main Dual Pane Content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List Pane (5 cols on lg, toggled on mobile) */}
        <div className={`lg:col-span-5 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs ${
          mobileShowDetail ? 'hidden lg:block' : 'block'
        }`}>
          <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>Daftar Pesan ({filteredNotifications.length})</span>
            {unreadCount > 0 && <span className="text-red-600 font-semibold">{unreadCount} belum dibaca</span>}
          </div>

          <div className="divide-y divide-neutral-100 max-h-[620px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto opacity-20 stroke-1" />
                <p className="text-xs font-medium">Tidak ada pesan notifikasi</p>
                <p className="text-[11px] text-neutral-400">
                  {searchQuery ? 'Coba gunakan kata kunci pencarian lain.' : 'Pesan masuk akan otomatis muncul di sini.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(item => {
                const isSelected = activeNotification?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectNotification(item)}
                    className={`p-4 transition-all cursor-pointer relative flex items-start gap-3 group ${
                      isSelected 
                        ? 'bg-blue-50/60 border-l-4 border-blue-600 pl-3' 
                        : !item.isRead 
                          ? 'bg-amber-50/30 hover:bg-neutral-50 border-l-4 border-amber-500 pl-3' 
                          : 'hover:bg-neutral-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className={`text-xs truncate ${!item.isRead ? 'font-bold text-neutral-950' : 'font-semibold text-neutral-800'}`}>
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Belum Dibaca" />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0 whitespace-nowrap">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div>{getTypeBadge(item.type)}</div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(item.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded-md transition-colors"
                            title="Hapus Notifikasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Reader Pane (7 cols on lg, toggled on mobile) */}
        <div className={`lg:col-span-7 ${
          mobileShowDetail ? 'block' : 'hidden lg:block'
        }`}>
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => setMobileShowDetail(false)}
            className="lg:hidden flex items-center gap-2 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2.5 rounded-xl mb-4 transition-colors cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Notifikasi</span>
          </button>

          {activeNotification ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-8 shadow-xs space-y-6">
              
              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-neutral-100 border border-neutral-200/80 shrink-0">
                    {getIcon(activeNotification.type, true)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTypeBadge(activeNotification.type)}
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(activeNotification.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-xl font-bold text-neutral-950 mt-1.5 leading-snug break-words">
                      {activeNotification.title}
                    </h2>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    deleteNotification(activeNotification.id);
                    setMobileShowDetail(false);
                  }}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Hapus Pesan Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Detail Message Body */}
              <div className="space-y-4">
                <div className="bg-neutral-50/70 p-4 sm:p-5 rounded-2xl border border-neutral-100 text-neutral-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words">
                  {activeNotification.message}
                </div>

                {/* Order Information Banner if available */}
                {activeNotification.orderNumber && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                        Nomor Pesanan Terkait
                      </span>
                      <span className="font-mono font-extrabold text-sm text-blue-950">
                        #{activeNotification.orderNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('orders')}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>Lihat di Pesanan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Callouts */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleActionClick(activeNotification)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{activeNotification.actionLabel || 'Lihat Informasi Lengkap'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="https://wa.me/628895204312?text=Halo%20Admin%20Daily%20Thread,%20saya%20ingin%20konfirmasi%20tentang%20pesan%20ini."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tanya WhatsApp (0889-5204-312)</span>
                  </a>
                </div>

                <span className="text-[10px] text-neutral-400 text-center sm:text-right">
                  Daily Thread Verified System
                </span>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-400 space-y-3">
              <Bell className="w-12 h-12 mx-auto stroke-1 opacity-30" />
              <h3 className="text-sm font-bold text-neutral-700">Pilih Pesan Notifikasi</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Klik salah satu pesan di daftar sebelah kiri untuk membaca detail informasi notifikasi atau pengumuman secara penuh.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
