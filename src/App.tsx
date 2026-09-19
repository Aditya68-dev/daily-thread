import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { ShopView } from './components/ShopView.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import { CartView } from './components/CartView.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { WishlistView } from './components/WishlistView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { NotificationView } from './components/NotificationView.tsx';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ResetPasswordModal } from './components/ResetPasswordModal.tsx';

const AppContent: React.FC = () => {
  const { activeView } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-16 lg:pb-0">
      <ToastContainer />
      <Navbar />

      <main className="flex-1">
        {activeView === 'home' && <HomeView />}
        {activeView === 'shop' && <ShopView />}
        {activeView === 'product-detail' && <ProductDetailView />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'orders' && <OrdersView />}
        {activeView === 'notifications' && <NotificationView />}
        {activeView === 'wishlist' && <WishlistView />}
        {activeView === 'admin' && <AdminDashboard />}
        {activeView === 'reset-password' && <ResetPasswordModal />}
      </main>

      {/* Floating WhatsApp Contact Admin Button */}
      <WhatsAppFloatingButton />

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Auth Modal (Login / Register) */}
      <AuthModal />

      {/* Footer rendered everywhere except Admin */}
      {activeView !== 'admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
