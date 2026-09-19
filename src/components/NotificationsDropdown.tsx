import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, ShoppingBag, Package, Sparkles, User, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationsAsRead, 
    markNotificationAsRead,
    setSelectedNotificationId, 
    setActiveView 
  } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'cart':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'account':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-neutral-600" />;
    }
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m yang lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h yang lalu`;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-neutral-800" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Notifikasi</h4>
        </div>
        <button
          onClick={markNotificationsAsRead}
          className="text-[11px] font-medium text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-1" />
            <p className="text-xs">Belum ada notifikasi baru</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                setSelectedNotificationId(item.id);
                setActiveView('notifications');
                onClose();
              }}
              className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-neutral-50/80 cursor-pointer ${
                !item.isRead ? 'bg-amber-50/40 border-l-2 border-amber-500' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-xs font-semibold text-neutral-900 truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-4">
        <button
          onClick={() => {
            onClose();
            setActiveView('notifications');
          }}
          className="text-xs font-bold text-neutral-900 hover:text-black transition-colors"
        >
          Buka Halaman Notifikasi &rarr;
        </button>

        <button
          onClick={() => {
            onClose();
            setActiveView('orders');
          }}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Pesanan Saya
        </button>
      </div>
    </div>
  );
};
