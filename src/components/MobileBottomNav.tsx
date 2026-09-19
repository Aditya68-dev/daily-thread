import React from 'react';
import { Home, ShoppingBag, Bell, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    cart, 
    notifications, 
    user, 
    setAuthModalOpen, 
    setAuthModalTab 
  } = useStore();

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const handleAccountClick = () => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
    } else {
      setActiveView('profile');
    }
  };

  // Do not render bottom nav on admin dashboard to keep full-screen dashboard clean
  if (activeView === 'admin') {
    return null;
  }

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] select-none"
    >
      <div className="grid grid-cols-5 items-center justify-around h-14">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all cursor-pointer ${
            activeView === 'home' 
              ? 'text-neutral-950 font-bold' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeView === 'home' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {activeView === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Shop / Catalog */}
        <button
          type="button"
          onClick={() => setActiveView('shop')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all cursor-pointer ${
            activeView === 'shop' || activeView === 'product-detail'
              ? 'text-neutral-950 font-bold' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform ${activeView === 'shop' || activeView === 'product-detail' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {(activeView === 'shop' || activeView === 'product-detail') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Katalog</span>
        </button>

        {/* 3. Notifications */}
        <button
          type="button"
          onClick={() => setActiveView('notifications')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all cursor-pointer relative ${
            activeView === 'notifications' 
              ? 'text-neutral-950 font-bold' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 transition-transform ${activeView === 'notifications' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
              </span>
            )}
            {activeView === 'notifications' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Notifikasi</span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => setActiveView('cart')}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all cursor-pointer relative ${
            activeView === 'cart' || activeView === 'checkout'
              ? 'text-neutral-950 font-bold' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 transition-transform ${activeView === 'cart' || activeView === 'checkout' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-neutral-950 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            {(activeView === 'cart' || activeView === 'checkout') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Keranjang</span>
        </button>

        {/* 5. Profile / Account */}
        <button
          type="button"
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-all cursor-pointer ${
            activeView === 'profile' || activeView === 'orders' || activeView === 'wishlist'
              ? 'text-neutral-950 font-bold' 
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName || 'User'} 
                className={`w-5 h-5 rounded-full object-cover border ${
                  activeView === 'profile' || activeView === 'orders' || activeView === 'wishlist' 
                    ? 'border-neutral-950 ring-1 ring-neutral-950' 
                    : 'border-neutral-300'
                }`}
              />
            ) : (
              <User className={`w-5 h-5 transition-transform ${activeView === 'profile' || activeView === 'orders' || activeView === 'wishlist' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
            )}
            {(activeView === 'profile' || activeView === 'orders' || activeView === 'wishlist') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {user ? 'Akun' : 'Masuk'}
          </span>
        </button>

      </div>
    </nav>
  );
};
