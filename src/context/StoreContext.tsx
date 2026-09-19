import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, 
  Category, 
  Brand, 
  User, 
  CartItem, 
  WishlistItem, 
  Order, 
  NotificationItem 
} from '../types.ts';
import { productService } from '../services/productService.ts';
import { authService } from '../services/authService.ts';
import { cartService } from '../services/cartService.ts';
import { wishlistService } from '../services/wishlistService.ts';
import { orderService } from '../services/orderService.ts';
import { notificationService } from '../services/notificationService.ts';
import { midtransService } from '../services/midtransService.ts';

export type ViewState = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'profile' 
  | 'orders' 
  | 'wishlist' 
  | 'notifications'
  | 'admin' 
  | 'reset-password';

export interface ToastAlert {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface StoreContextType {
  user: User | null;
  token: string | null;
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  selectedNotificationId: string | null;
  setSelectedNotificationId: (id: string | null) => void;
  cart: CartItem[];
  wishlist: WishlistItem[];
  notifications: NotificationItem[];
  categories: Category[];
  brands: Brand[];
  recentlyViewed: Product[];
  storeConfig: any;
  toasts: ToastAlert[];
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  resetPasswordToken: string | null;
  setResetPasswordToken: (token: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  brandFilter: string;
  setBrandFilter: (brand: string) => void;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  addToCart: (productId: string, size: string, color: string, quantity?: number) => Promise<boolean>;
  updateCartQty: (itemId: string, qty: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  createOrder: (orderData: any) => Promise<{ order: Order; whatsappUrl: string } | null>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
  markOrderAsPaid: (orderId: string, paymentMethod?: string) => Promise<boolean>;
  checkMidtransStatus: (orderNumber: string, orderId?: string) => Promise<{ isPaid: boolean; status: string }>;
  resetAllOrders: () => void;
  markNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  viewProduct: (productId: string) => void;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dt_token'));
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [storeConfig, setStoreConfig] = useState<any>(productService.getStoreConfig());
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load Config, Categories, Brands on mount
  useEffect(() => {
    setStoreConfig(productService.getStoreConfig());

    productService.getCategories().then(setCategories).catch(console.error);
    productService.getBrands().then(setBrands).catch(console.error);

    // Initial session check
    authService.getInitialSession().then(({ user: authUser, token: authToken }) => {
      if (authUser && authToken) {
        setUser(authUser);
        setToken(authToken);
      }
    });
  }, []);

  // Fetch Cart, Wishlist, Notifications when user or token changes
  useEffect(() => {
    fetchCart();
    fetchWishlist();
    fetchNotifications();
  }, [user?.id, token]);

  const fetchCart = async () => {
    try {
      const items = await cartService.getCart(user?.id);
      setCart(items);
    } catch (err) {
      console.error('Fetch cart error', err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const items = await wishlistService.getWishlist(user?.id);
      setWishlist(items);
    } catch (err) {
      console.error('Fetch wishlist error', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const items = await notificationService.getNotifications(user?.id);
      setNotifications(items);
    } catch (err) {
      console.error('Fetch notifications error', err);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login(email, password);
      setToken(result.token);
      setUser(result.user);
      setAuthModalOpen(false);

      if (result.user.role === 'admin') {
        setActiveView('admin');
        addToast('success', 'Pusat Kontrol Administrator', `Selamat datang, ${result.user.fullName}! Dialihkan ke Pusat Kontrol Penjualan & Pesanan.`);
      } else {
        addToast('success', 'Selamat Datang', `Halo ${result.user.fullName}, berhasil masuk ke Daily Thread!`);
      }
      return true;
    } catch (err: any) {
      addToast('error', 'Login Gagal', err.message || 'Periksa email/username dan password Anda.');
      return false;
    }
  };

  const register = async (payload: any): Promise<boolean> => {
    try {
      const result = await authService.register(payload);
      setToken(result.token);
      setUser(result.user);
      setAuthModalOpen(false);
      addToast('success', 'Pendaftaran Berhasil', 'Akun Daily Thread Anda siap digunakan!');
      return true;
    } catch (err: any) {
      addToast('error', 'Pendaftaran Gagal', err.message || 'Gagal mendaftar.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setToken(null);
      setUser(null);
      setCart([]);
      setWishlist([]);
      setActiveView('home');
      addToast('info', 'Logout', 'Anda telah keluar dari akun Daily Thread.');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updated = await authService.updateProfile(user.id, data);
      setUser(updated);
      addToast('success', 'Profil Diperbarui', 'Informasi akun dan alamat berhasil disimpan.');
      fetchNotifications();
      return true;
    } catch (err: any) {
      addToast('error', 'Update Profil Gagal', err.message);
      return false;
    }
  };

  const addToCart = async (productId: string, size: string, color: string, quantity = 1): Promise<boolean> => {
    try {
      const { product } = await productService.getProductById(productId);
      if (!product) {
        addToast('error', 'Gagal', 'Produk tidak ditemukan.');
        return false;
      }

      if (product.stock < quantity) {
        addToast('error', 'Stok Habis', 'Mohon maaf, stok produk ini tidak mencukupi.');
        return false;
      }

      const effectivePrice = Number(product.discount_price) || Number(product.price) || 0;
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        productId,
        name: product.name,
        brand: product.brand,
        price: effectivePrice,
        discount_price: product.discount_price,
        size,
        color,
        quantity,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop',
        stock: product.stock,
        subtotal: effectivePrice * quantity
      };

      const updatedCart = await cartService.addToCart(user?.id, newItem);
      setCart(updatedCart);
      addToast('success', 'Keranjang Belanja', 'Produk berhasil ditambahkan ke keranjang!');
      fetchNotifications();
      return true;
    } catch (err: any) {
      addToast('error', 'Kesalahan', err.message);
      return false;
    }
  };

  const updateCartQty = async (itemId: string, quantity: number) => {
    try {
      const updated = await cartService.updateQty(user?.id, itemId, quantity);
      setCart(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const updated = await cartService.removeItem(user?.id, itemId);
      setCart(updated);
      addToast('info', 'Item Dihapus', 'Produk dihapus dari keranjang belanja.');
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart(user?.id);
      setCart([]);
      addToast('info', 'Keranjang Kosong', 'Semua item keranjang telah dibersihkan.');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      addToast('info', 'Masuk Diperlukan', 'Silakan login terlebih dahulu untuk menyimpan wishlist.');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return false;
    }

    try {
      const { wishlist: updated, isAdded } = await wishlistService.toggleWishlist(user.id, productId);
      setWishlist(updated);
      if (isAdded) {
        addToast('success', 'Wishlist', 'Produk berhasil disimpan ke Wishlist Anda.');
      } else {
        addToast('info', 'Wishlist', 'Produk dihapus dari Wishlist.');
      }
      return isAdded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  };

  const createOrder = async (orderData: any) => {
    try {
      // Calculate order totals from cart items safely
      const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
      const grandTotal = subtotal + (Number(orderData.shippingCost) || 0);

      const items = cart.map(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        return {
          productId: item.productId,
          name: item.name || 'Produk',
          brand: item.brand || 'Daily Thread',
          price: itemPrice,
          size: item.size || 'M',
          color: item.color || 'Default',
          quantity: itemQty,
          subtotal: itemPrice * itemQty,
          image: item.image || 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop'
        };
      });

      const finalOrderNumber = orderData.orderNumber || `DT-ORD-${Date.now()}`;
      const fullOrderPayload = {
        ...orderData,
        orderNumber: finalOrderNumber,
        subtotal,
        grandTotal,
        items
      };

      // Request Midtrans Snap Transaction Token
      const midtransRes = await midtransService.createTransaction(fullOrderPayload as any);

      fullOrderPayload.snapToken = midtransRes.token;
      fullOrderPayload.snapRedirectUrl = midtransRes.redirect_url;

      const result = await orderService.createOrder(fullOrderPayload, user?.id);

      // If user is logged in, auto-save shipping address and phone to their profile if not yet set
      if (user && (!user.phone || !user.address)) {
        try {
          await authService.updateProfile(user.id, {
            phone: user.phone || orderData.customerPhone,
            address: user.address || orderData.shippingAddress,
            district: user.district || orderData.district,
            city: user.city || orderData.city,
            postalCode: user.postalCode || orderData.postalCode
          });
          setUser(prev => prev ? {
            ...prev,
            phone: prev.phone || orderData.customerPhone,
            address: prev.address || orderData.shippingAddress,
            district: prev.district || orderData.district,
            city: prev.city || orderData.city,
            postalCode: prev.postalCode || orderData.postalCode
          } : null);
        } catch {
          // non-blocking
        }
      }

      await cartService.clearCart(user?.id);
      setCart([]);

      // Auto-create notification for new order
      try {
        await notificationService.addNotification({
          title: `Pesanan Baru: #${finalOrderNumber}`,
          message: `Pesanan Anda sebesar Rp ${(grandTotal || 0).toLocaleString('id-ID')} berhasil dibuat. Menunggu penyelesaian pembayaran.`,
          type: 'order',
          orderNumber: finalOrderNumber,
          actionUrl: 'orders',
          actionLabel: 'Lihat Pesanan'
        }, user?.id);
      } catch {
        // non-blocking
      }

      fetchNotifications();
      addToast('info', 'Menunggu Pembayaran', `Order #${result.order.orderNumber} berhasil dibuat. Silakan selesaikan pembayaran Midtrans.`);
      return result;
    } catch (err: any) {
      console.error('Checkout error:', err);
      addToast('error', 'Checkout Gagal', err.message || 'Terjadi kesalahan saat memproses pesanan.');
      return null;
    }
  };

  const checkMidtransStatus = async (orderNumber: string, orderId?: string): Promise<{ isPaid: boolean; status: string }> => {
    try {
      const res = await midtransService.checkTransactionStatus(orderNumber);
      if (res.isPaid) {
        if (orderId) {
          await orderService.markOrderAsPaid(orderId, `Midtrans (${res.paymentType || 'Snap'})`);
        }
        addToast('success', 'Pembayaran Midtrans Terverifikasi!', `Pesanan #${orderNumber} berhasil dikonfirmasi lunas oleh Midtrans.`);
        fetchNotifications();
        return { isPaid: true, status: res.status };
      }
      return { isPaid: false, status: res.status };
    } catch (err: any) {
      console.warn('checkMidtransStatus error:', err);
      return { isPaid: false, status: 'error' };
    }
  };

  const cancelOrder = async (orderId: string, reason = 'Dibatalkan oleh pembeli'): Promise<boolean> => {
    try {
      const updated = await orderService.cancelOrder(orderId, reason);
      if (updated) {
        addToast('info', 'Pesanan Dibatalkan', `Pesanan #${updated.orderNumber} telah dibatalkan.`);
        fetchNotifications();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast('error', 'Gagal Membatalkan', err.message);
      return false;
    }
  };

  const markOrderAsPaid = async (orderId: string, paymentMethod = 'Midtrans Snap'): Promise<boolean> => {
    try {
      const updated = await orderService.markOrderAsPaid(orderId, paymentMethod);
      if (updated) {
        addToast('success', 'Pembayaran Berhasil!', `Pesanan #${updated.orderNumber} telah berhasil dibayar.`);
        try {
          await notificationService.addNotification({
            title: `Pembayaran Lunas: #${updated.orderNumber}`,
            message: `Pembayaran pesanan #${updated.orderNumber} sebesar Rp ${(updated.grandTotal || 0).toLocaleString('id-ID')} telah berhasil diverifikasi via ${paymentMethod}. Tim kami segera memproses pengiriman.`,
            type: 'order',
            orderNumber: updated.orderNumber,
            actionUrl: 'orders',
            actionLabel: 'Lihat Status Pesanan'
          }, user?.id);
        } catch {
          // non-blocking
        }
        fetchNotifications();
        return true;
      }
      return false;
    } catch (err: any) {
      addToast('error', 'Gagal Konfirmasi Pembayaran', err.message);
      return false;
    }
  };

  const resetAllOrders = () => {
    orderService.resetOrders();
    addToast('info', 'Reset Pesanan', 'Semua data pesanan telah di-reset ke 0.');
  };

  const markNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, user?.id);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId, user?.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (selectedNotificationId === notificationId) {
        setSelectedNotificationId(null);
      }
      addToast('info', 'Notifikasi Dihapus', 'Pesan notifikasi telah dibersihkan.');
    } catch (err) {
      console.error(err);
    }
  };

  const viewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    productService.getProductById(productId).then(({ product }) => {
      if (product) {
        setRecentlyViewed(prev => {
          const filtered = prev.filter(p => p.id !== product.id);
          return [product, ...filtered].slice(0, 8);
        });
      }
    });
  };

  return (
    <StoreContext.Provider value={{
      user,
      token,
      activeView,
      setActiveView,
      selectedProductId,
      setSelectedProductId,
      selectedOrder,
      setSelectedOrder,
      selectedNotificationId,
      setSelectedNotificationId,
      cart,
      wishlist,
      notifications,
      categories,
      brands,
      recentlyViewed,
      storeConfig,
      toasts,
      authModalOpen,
      setAuthModalOpen,
      authModalTab,
      setAuthModalTab,
      resetPasswordToken,
      setResetPasswordToken,
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      brandFilter,
      setBrandFilter,
      login,
      register,
      logout,
      updateProfile,
      addToCart,
      updateCartQty,
      removeCartItem,
      clearCart,
      toggleWishlist,
      isInWishlist,
      createOrder,
      cancelOrder,
      markOrderAsPaid,
      checkMidtransStatus,
      resetAllOrders,
      markNotificationsAsRead,
      markNotificationAsRead,
      deleteNotification,
      addToast,
      removeToast,
      viewProduct,
      fetchCart,
      fetchWishlist,
      fetchNotifications
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
