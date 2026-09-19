import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Layers,
  Sparkles,
  TrendingUp,
  Printer,
  Truck,
  Send,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  FileText,
  Filter,
  Check,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Order, User, AdminStats, OrderStatus } from '../types.ts';
import { adminService } from '../services/adminService.ts';
import { productService } from '../services/productService.ts';
import { orderService } from '../services/orderService.ts';

export const AdminDashboard: React.FC = () => {
  const { user, token, setActiveView, addToast, categories, brands } = useStore();

  const [currentTab, setCurrentTab] = useState<'sales' | 'orders' | 'products' | 'users'>('sales');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter in admin products
  const [productSearch, setProductSearch] = useState('');

  // Orders Filter & Search (Shopee Style)
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OrderStatus | string>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const handleResetAllOrders = () => {
    if (window.confirm('Reset semua data pesanan ke 0? Semua pesanan lama akan dihapus dan toko siap menerima pesanan baru dari awal.')) {
      orderService.resetOrders();
      setAdminOrders([]);
      fetchStats();
      addToast('success', 'Pesanan Direset ke 0', 'Semua data pesanan lama berhasil dibersihkan. Pesanan baru dari pembeli akan masuk secara real-time.');
    }
  };

  // Modals state for Shopee Order Fulfillment
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);
  const [inputCourier, setInputCourier] = useState('J&T Express EZ');
  const [inputTrackingNumber, setInputTrackingNumber] = useState('');

  const [printLabelModalOpen, setPrintLabelModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  // Add/Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('Daily Thread');
  const [pCategory, setPCategory] = useState('Cargo Pants');
  const [pPrice, setPPrice] = useState(250000);
  const [pDiscountPrice, setPDiscountPrice] = useState<number | undefined>(undefined);
  const [pStock, setPStock] = useState(20);
  const [pDescription, setPDescription] = useState('');
  const [pBadge, setPBadge] = useState<string>('NEW');
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop');

  const fetchStats = () => {
    adminService.getAdminStats()
      .then(d => setStats(d))
      .catch(console.error);
  };

  const fetchProducts = () => {
    productService.getProducts({ limit: 1000 })
      .then(d => setAdminProducts(d.products || []))
      .catch(console.error);
  };

  const fetchOrders = () => {
    orderService.getAllOrders()
      .then(d => setAdminOrders(d || []))
      .catch(console.error);
  };

  const fetchUsers = () => {
    adminService.getAdminUsers()
      .then(d => setAdminUsers(d || []))
      .catch(console.error);
  };

  const refreshAllData = () => {
    setLoading(true);
    Promise.all([
      adminService.getAdminStats().then(setStats),
      productService.getProducts({ limit: 1000 }).then(d => setAdminProducts(d.products || [])),
      orderService.getAllOrders().then(setAdminOrders),
      adminService.getAdminUsers().then(setAdminUsers)
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshAllData();
  }, [token, user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Akses Khusus Administrator</h2>
        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
          Halaman ini dibatasi hanya untuk pengelola toko Daily Thread. Silakan login menggunakan akun administrator Anda.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-6 px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
        >
          Kembali ke Toko
        </button>
      </div>
    );
  }

  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  // Shopee Order Counts for status badges
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: adminOrders.length,
      'Menunggu Pembayaran': 0,
      'Sudah Bayar': 0,
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Completed: 0,
      Dibatalkan: 0,
      Cancelled: 0,
      Kadaluarsa: 0
    };
    adminOrders.forEach(o => {
      if (o.status === 'Menunggu Pembayaran' || o.status === 'Pending') {
        counts['Menunggu Pembayaran']++;
        counts.Pending++;
      } else if (o.status === 'Sudah Bayar') {
        counts['Sudah Bayar']++;
      } else if (o.status === 'Processing') {
        counts.Processing++;
      } else if (o.status === 'Shipped') {
        counts.Shipped++;
      } else if (o.status === 'Completed') {
        counts.Completed++;
      } else if (o.status === 'Dibatalkan' || o.status === 'Cancelled') {
        counts.Dibatalkan++;
        counts.Cancelled++;
      } else if (o.status === 'Kadaluarsa') {
        counts.Kadaluarsa++;
      } else if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [adminOrders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return adminOrders.filter(order => {
      let matchStatus = orderStatusFilter === 'ALL';
      if (!matchStatus) {
        if (orderStatusFilter === 'Menunggu Pembayaran' || orderStatusFilter === 'Pending') {
          matchStatus = order.status === 'Menunggu Pembayaran' || order.status === 'Pending';
        } else if (orderStatusFilter === 'Dibatalkan' || orderStatusFilter === 'Cancelled') {
          matchStatus = order.status === 'Dibatalkan' || order.status === 'Cancelled';
        } else {
          matchStatus = order.status === orderStatusFilter;
        }
      }
      const q = orderSearchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
        order.items.some(i => (i.name || i.productName || '').toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });
  }, [adminOrders, orderStatusFilter, orderSearchQuery]);

  // Sales Analytics Computed
  const salesAnalytics = useMemo(() => {
    const completedOrShipped = adminOrders.filter(o => 
      o.status === 'Completed' || o.status === 'Shipped' || o.status === 'Processing' || o.status === 'Sudah Bayar'
    );
    const totalGrossRevenue = completedOrShipped.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalCompletedRevenue = adminOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const totalSoldUnits = completedOrShipped.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0), 0);
    const aov = completedOrShipped.length > 0 && !isNaN(totalGrossRevenue) ? Math.round(totalGrossRevenue / completedOrShipped.length) : 0;

    // Top Selling Products
    const productSalesMap: { [name: string]: { name: string; brand: string; units: number; revenue: number; image: string } } = {};
    adminOrders.forEach(o => {
      if (o.status !== 'Cancelled' && o.status !== 'Dibatalkan' && o.status !== 'Kadaluarsa') {
        (o.items || []).forEach(item => {
          const itemName = item.name || item.productName || 'Produk';
          if (!productSalesMap[itemName]) {
            productSalesMap[itemName] = {
              name: itemName,
              brand: item.brand || 'Daily Thread',
              units: 0,
              revenue: 0,
              image: item.image || item.imageUrl || ''
            };
          }
          productSalesMap[itemName].units += (Number(item.quantity) || 0);
          productSalesMap[itemName].revenue += (Number(item.subtotal) || 0);
        });
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return {
      totalGrossRevenue: isNaN(totalGrossRevenue) ? 0 : totalGrossRevenue,
      totalCompletedRevenue: isNaN(totalCompletedRevenue) ? 0 : totalCompletedRevenue,
      totalSoldUnits: isNaN(totalSoldUnits) ? 0 : totalSoldUnits,
      aov: isNaN(aov) ? 0 : aov,
      topSellingProducts
    };
  }, [adminOrders]);

  // Handle Quick Status Updates
  const handleQuickStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      addToast('success', 'Status Pesanan Berhasil Diperbarui', `Pesanan #${orderId} kini berstatus "${status}".`);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      addToast('error', 'Gagal Memperbarui Status', err.message);
    }
  };

  // Open Arrange Shipment Modal (Shopee "Atur Pengiriman")
  const openArrangeShipment = (order: Order) => {
    setSelectedOrderForShipping(order);
    setInputCourier(order.courier || order.shippingMethod || 'J&T Express EZ');
    // Generate intelligent tracking code if not present
    if (order.trackingNumber) {
      setInputTrackingNumber(order.trackingNumber);
    } else {
      const courierPrefix = (order.shippingMethod || '').includes('SiCepat') ? 'SC' :
                            (order.shippingMethod || '').includes('JNE') ? 'JNE' :
                            (order.shippingMethod || '').includes('GoSend') ? 'GOSEND' : 'JT';
      const randomCode = Math.floor(100000000 + Math.random() * 900000000);
      setInputTrackingNumber(`${courierPrefix}${randomCode}ID`);
    }
    setShippingModalOpen(true);
  };

  // Submit Arrange Shipment
  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForShipping) return;
    if (!inputTrackingNumber.trim()) {
      addToast('error', 'Validasi Gagal', 'Nomor Resi wajib diisi untuk konfirmasi pengiriman.');
      return;
    }

    try {
      await orderService.updateOrderFulfillment(selectedOrderForShipping.id, {
        status: 'Shipped',
        trackingNumber: inputTrackingNumber.trim().toUpperCase(),
        courier: inputCourier
      });
      addToast('success', 'Paket Berhasil Dikirim', `Resi ${inputTrackingNumber.trim().toUpperCase()} berhasil disimpan. Pesanan beralih ke Sedang Dikirim.`);
      setShippingModalOpen(false);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      addToast('error', 'Gagal Mengatur Pengiriman', err.message);
    }
  };

  // Handle Open Print Shipping Label
  const openPrintLabel = (order: Order) => {
    setSelectedOrderForPrint(order);
    setPrintLabelModalOpen(true);
  };

  // Copy tracking number
  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    addToast('info', 'Nomor Resi Disalin', resi);
    setTimeout(() => setCopiedResi(null), 2500);
  };

  // Open Cancel Order Modal
  const openCancelOrder = (order: Order) => {
    setSelectedOrderForCancel(order);
    setCancelReasonInput('Permintaan pembeli / Stok varian habis');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForCancel) return;
    try {
      await orderService.updateOrderFulfillment(selectedOrderForCancel.id, {
        status: 'Cancelled',
        cancelReason: cancelReasonInput
      });
      addToast('info', 'Pesanan Dibatalkan', `Pesanan #${selectedOrderForCancel.orderNumber} telah dibatalkan.`);
      setCancelModalOpen(false);
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      addToast('error', 'Gagal Membatalkan', err.message);
    }
  };

  // Open WhatsApp chat to customer
  const handleContactCustomer = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/[^0-9]/g, '');
    let formattedPhone = rawPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const text = encodeURIComponent(
      `Halo Kak ${order.customerName},\n\nKami dari Daily Thread Store ingin mengonfirmasi pesanan Anda *#${order.orderNumber}*.\nStatus Pesanan: *${order.status}*${order.trackingNumber ? `\nNo. Resi Pengiriman: *${order.trackingNumber}* (${order.courier || order.shippingMethod})` : ''}\nTotal: *${formatIDR(order.grandTotal)}*\n\nTerima kasih telah berbelanja di Daily Thread!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  // Handle Create or Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: pName,
      brand: pBrand,
      category: pCategory,
      price: Number(pPrice),
      discount_price: pDiscountPrice ? Number(pDiscountPrice) : null,
      stock: Number(pStock),
      description: pDescription,
      badge: (pBadge === 'NONE' ? null : pBadge) as any,
      images: [pImage],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Classic Dark', hex: '#1e1e1e' }, { name: 'Raw Natural', hex: '#e2d7c5' }]
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        addToast('success', 'Produk Diperbarui', `Produk ${pName} berhasil diupdate.`);
      } else {
        await productService.createProduct(payload);
        addToast('success', 'Produk Dibuat', `Produk ${pName} berhasil ditambahkan ke katalog.`);
      }
      fetchProducts();
      fetchStats();
      setProductModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Gagal', err.message);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setPName('');
    setPBrand('Daily Thread');
    setPCategory('Cargo Pants');
    setPPrice(249000);
    setPDiscountPrice(undefined);
    setPStock(25);
    setPDescription('Celana fashion modern dengan bahan katun twill premium.');
    setPBadge('NEW');
    setPImage('https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop');
    setProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPBrand(prod.brand);
    setPCategory(prod.category);
    setPPrice(prod.price);
    setPDiscountPrice(prod.discount_price || undefined);
    setPStock(prod.stock);
    setPDescription(prod.description);
    setPBadge(prod.badge || 'NONE');
    setPImage(prod.images[0] || '');
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari database?`)) return;
    try {
      await productService.deleteProduct(id);
      addToast('info', 'Produk Dihapus', `Produk ${name} telah dihapus.`);
      fetchProducts();
      fetchStats();
    } catch (err: any) {
      addToast('error', 'Gagal', err.message);
    }
  };

  const filteredAdminProducts = adminProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-neutral-950 text-amber-400 font-extrabold text-[10px] rounded uppercase tracking-wider">
              PUSAT KONTROL ADMIN TOKO
            </span>
            <span className="text-xs text-neutral-400 font-mono">Daily Thread Seller Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Dashboard Penjualan & Pesanan
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAllData}
            disabled={loading}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setActiveView('shop')}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Etalase Toko</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-neutral-200 mt-6 overflow-x-auto space-x-1 sm:space-x-2">
        <button
          onClick={() => setCurrentTab('sales')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'sales'
              ? 'border-neutral-950 text-neutral-950 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Data Penjualan & Saldo</span>
        </button>

        <button
          onClick={() => setCurrentTab('orders')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap relative ${
            currentTab === 'orders'
              ? 'border-neutral-950 text-neutral-950 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-600" />
          <span>Kelola Pesanan</span>
          {orderCounts.Processing > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
              {orderCounts.Processing}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'products'
              ? 'border-neutral-950 text-neutral-950 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>Katalog Produk ({adminProducts.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('users')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'users'
              ? 'border-neutral-950 text-neutral-950 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4 text-neutral-600" />
          <span>Pelanggan ({adminUsers.length})</span>
        </button>
      </div>

      {/* 1. DATA PENJUALAN (SALES & REVENUE ANALYTICS) */}
      {currentTab === 'sales' && (
        <div className="mt-8 space-y-6">
          
          {/* Top Shopee Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Omset Penjualan</span>
              <p className="text-xl font-extrabold text-neutral-950 mt-1">{formatIDR(salesAnalytics.totalGrossRevenue)}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Transaksi Aktif
              </span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Pesanan Selesai</span>
              <p className="text-xl font-extrabold text-neutral-950 mt-1">{formatIDR(salesAnalytics.totalCompletedRevenue)}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Dana Siap Ditarik</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Perlu Dikirim</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{(orderCounts.Processing || 0) + (orderCounts['Sudah Bayar'] || 0)}</p>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Perlu Diproses Segera</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Sedang Dikirim</span>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{orderCounts.Shipped || 0}</p>
              <span className="text-[11px] text-purple-700 font-semibold mt-1 block">Dalam Perjalanan Kurir</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Produk Terjual</span>
              <p className="text-2xl font-extrabold text-neutral-950 mt-1">{salesAnalytics.totalSoldUnits || 0}</p>
              <span className="text-[11px] text-neutral-500 mt-1 block">Pcs Streetwear Apparel</span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Rata-rata Order (AOV)</span>
              <p className="text-lg font-extrabold text-neutral-950 mt-1">{formatIDR(salesAnalytics.aov)}</p>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Per Keranjang Belanja</span>
            </div>
          </div>

          {/* Shopee Seller Wallet / Saldo Toko & Ringkasan Performa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Saldo Toko Card */}
            <div className="bg-neutral-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Saldo Penjual Daily Thread</span>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-[10px] font-bold rounded-full">
                    Terverifikasi
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold tracking-tight text-white">
                    {formatIDR(salesAnalytics.totalCompletedRevenue)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Dana bersih dari transaksi pesanan yang telah berstatus Selesai.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  onClick={() => addToast('info', 'Penarikan Dana', 'Permintaan pencairan dana ke rekening BCA PT Daily Thread Indonesia sedang diproses.')}
                  className="px-4 py-2 bg-white text-neutral-950 text-xs font-bold rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  Tarik Saldo ke Rekening
                </button>
                <span className="text-[11px] text-neutral-400">Bank BCA •••• 9821</span>
              </div>
            </div>

            {/* Quick Action Summary */}
            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span>Tugas Penting Toko (To-Do List Shopee Style)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => {
                    setCurrentTab('orders');
                    setOrderStatusFilter('Processing');
                  }}
                  className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <p className="text-2xl font-extrabold text-amber-900">{orderCounts.Processing || 0}</p>
                  <p className="text-xs font-bold text-amber-800 mt-1">Perlu Dikirim</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Kemas dan masukkan no. resi</p>
                </div>

                <div 
                  onClick={() => {
                    setCurrentTab('orders');
                    setOrderStatusFilter('Menunggu Pembayaran');
                  }}
                  className="p-4 bg-neutral-100 border border-neutral-200 rounded-2xl cursor-pointer hover:bg-neutral-200/70 transition-colors"
                >
                  <p className="text-2xl font-extrabold text-neutral-900">{orderCounts['Menunggu Pembayaran'] || 0}</p>
                  <p className="text-xs font-bold text-neutral-800 mt-1">Menunggu Bayar</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Konfirmasi transfer pembeli</p>
                </div>

                <div 
                  onClick={() => {
                    setCurrentTab('orders');
                    setOrderStatusFilter('Shipped');
                  }}
                  className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl cursor-pointer hover:bg-purple-100/70 transition-colors"
                >
                  <p className="text-2xl font-extrabold text-purple-900">{orderCounts.Shipped || 0}</p>
                  <p className="text-xs font-bold text-purple-800 mt-1">Dalam Pengiriman</p>
                  <p className="text-[10px] text-purple-700 mt-0.5">Pantau status kurir & resi</p>
                </div>

                <div 
                  onClick={() => {
                    setCurrentTab('orders');
                    setOrderStatusFilter('Dibatalkan');
                  }}
                  className="p-4 bg-red-50/70 border border-red-200/80 rounded-2xl cursor-pointer hover:bg-red-100/70 transition-colors"
                >
                  <p className="text-2xl font-extrabold text-red-900">{orderCounts.Dibatalkan || 0}</p>
                  <p className="text-xs font-bold text-red-800 mt-1">Pembatalan</p>
                  <p className="text-[10px] text-red-700 mt-0.5">Pesanan dibatalkan</p>
                </div>
              </div>
            </div>

          </div>

          {/* Top Products Table */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                  Produk Terlaris (Top Selling Streetwear)
                </h3>
                <p className="text-xs text-neutral-500">Peringkat produk berdasarkan akumulasi unit terjual dan omset.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-neutral-700">
                <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Produk</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3 text-center">Unit Terjual</th>
                    <th className="p-3 text-right">Total Nilai Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {salesAnalytics.topSellingProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-bold text-neutral-900">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' :
                          idx === 1 ? 'bg-neutral-200 text-neutral-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                        <span className="font-semibold text-neutral-900 max-w-xs">{p.name}</span>
                      </td>
                      <td className="p-3 font-medium text-neutral-600">{p.brand}</td>
                      <td className="p-3 text-center font-bold text-neutral-950">{p.units} pcs</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{formatIDR(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution Table */}
          {stats && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-4">
                Distribusi Stok Katalog per Kategori Fashion
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {stats.categoryDistribution.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{cat.category}</p>
                    <p className="text-lg font-extrabold text-neutral-950 mt-0.5">{cat.count} item</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. KELOLA PESANAN (SHOPEE SELLER CENTRE ORDER MANAGEMENT) */}
      {currentTab === 'orders' && (
        <div className="mt-8 space-y-4">
          
          {/* Shopee Style Status Tabs */}
          <div className="flex border-b border-neutral-200 overflow-x-auto bg-white p-2 rounded-2xl shadow-sm gap-1 scrollbar-none">
            {[
              { key: 'ALL', label: 'Semua Pesanan', count: orderCounts.ALL },
              { key: 'Menunggu Pembayaran', label: 'Menunggu Bayar', count: orderCounts['Menunggu Pembayaran'] },
              { key: 'Sudah Bayar', label: 'Sudah Bayar', count: orderCounts['Sudah Bayar'] },
              { key: 'Processing', label: 'Perlu Dikirim', count: orderCounts.Processing },
              { key: 'Shipped', label: 'Sedang Dikirim', count: orderCounts.Shipped },
              { key: 'Completed', label: 'Selesai', count: orderCounts.Completed },
              { key: 'Dibatalkan', label: 'Dibatalkan', count: orderCounts.Dibatalkan },
              { key: 'Kadaluarsa', label: 'Kadaluarsa', count: orderCounts.Kadaluarsa }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setOrderStatusFilter(tab.key as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  orderStatusFilter === tab.key
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  orderStatusFilter === tab.key 
                    ? 'bg-white/20 text-white' 
                    : tab.count > 0 && (tab.key === 'Processing' || tab.key === 'Sudah Bayar')
                      ? 'bg-emerald-100 text-emerald-800' 
                      : tab.count > 0 && tab.key === 'Menunggu Pembayaran'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                placeholder="Cari No. Pesanan, Nama Pembeli, No. Resi, HP..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500">Menampilkan <strong>{filteredOrders.length}</strong> pesanan</span>
              <button
                type="button"
                onClick={handleResetAllOrders}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-red-200/60 cursor-pointer"
                title="Bersihkan semua pesanan untuk memulai dari 0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Pesanan (Mulai 0)</span>
              </button>
            </div>
          </div>

          {/* Orders Cards List (Shopee Seller Style) */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-900">Tidak ada pesanan ditemukan</p>
              <p className="text-xs text-neutral-400 mt-1">Coba sesuaikan kata kunci pencarian atau tab status pesanan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div 
                  key={order.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:border-neutral-300 transition-colors"
                >
                  {/* Order Card Header */}
                  <div className="bg-neutral-50/80 px-4 sm:px-6 py-3 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-neutral-950">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[11px] text-neutral-400">|</span>
                      <span className="text-[11px] text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        order.status === 'Completed' ? 'bg-teal-100 text-teal-800' :
                        order.status === 'Sudah Bayar' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Cancelled' || order.status === 'Dibatalkan' ? 'bg-red-100 text-red-800' :
                        order.status === 'Kadaluarsa' ? 'bg-neutral-200 text-neutral-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'Pending' || order.status === 'Menunggu Pembayaran' ? 'Menunggu Pembayaran' :
                         order.status === 'Sudah Bayar' ? 'Sudah Bayar (Midtrans)' :
                         order.status === 'Processing' ? 'Perlu Dikirim' :
                         order.status === 'Shipped' ? 'Sedang Dikirim' :
                         order.status === 'Completed' ? 'Selesai' :
                         order.status === 'Kadaluarsa' ? 'Kadaluarsa' : 'Dibatalkan'}
                      </span>
                    </div>
                  </div>

                  {/* Order Card Content */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: Customer & Shipping Details (4 cols) */}
                    <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-4 lg:pb-0 lg:pr-6 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Data Pembeli
                        </span>
                        <p className="font-bold text-neutral-900 text-sm">{order.customerName}</p>
                        <p className="text-neutral-500 text-[11px]">{order.customerEmail}</p>
                        <p className="font-mono text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Alamat Pengiriman
                        </span>
                        <p className="text-neutral-700 leading-relaxed text-[11px]">
                          {order.shippingAddress}
                          {order.district ? `, ${order.district}` : ''}
                          {order.city ? `, ${order.city}` : ''}
                          {order.province ? `, ${order.province}` : ''}
                          {order.postalCode ? ` ${order.postalCode}` : ''}
                        </p>
                      </div>

                      {order.notes && (
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                          <strong>Catatan Pembeli:</strong> "{order.notes}"
                        </div>
                      )}

                      {order.cancelReason && (
                        <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-900">
                          <strong>Alasan Pembatalan:</strong> {order.cancelReason}
                        </div>
                      )}
                    </div>

                    {/* Middle: Order Items (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Rincian Produk ({(order.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0)} Item)
                      </span>
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-100 flex-shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-neutral-500">
                                {item.brand} • Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong>
                              </p>
                              <p className="text-[11px] text-neutral-700 mt-0.5">
                                {item.quantity} x {formatIDR(item.price)} = <strong className="text-neutral-950">{formatIDR(item.subtotal)}</strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expedisi & Resi info */}
                      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-neutral-400 text-[10px] block">Kurir Pengiriman:</span>
                          <span className="font-semibold text-neutral-800">{order.courier || order.shippingMethod}</span>
                        </div>
                        {order.trackingNumber ? (
                          <div>
                            <span className="text-neutral-400 text-[10px] block">Nomor Resi:</span>
                            <div className="flex items-center gap-1 font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                              <span>{order.trackingNumber}</span>
                              <button 
                                onClick={() => handleCopyResi(order.trackingNumber!)} 
                                className="text-neutral-500 hover:text-black ml-1"
                                title="Salin Resi"
                              >
                                {copiedResi === order.trackingNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 italic">Belum ada nomor resi</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Payment Total & Shopee Seller Actions (3 cols) */}
                    <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-neutral-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Total Pembayaran
                        </span>
                        <p className="text-xl font-extrabold text-neutral-950">
                          {formatIDR(order.grandTotal)}
                        </p>
                        <div className="text-[10px] text-neutral-400 mt-0.5 space-y-0.5">
                          <p>Subtotal: {formatIDR(order.subtotal)}</p>
                          <p>Ongkir: {formatIDR(order.shippingCost)}</p>
                        </div>
                      </div>

                      {/* SHOPEE ACTION BUTTONS */}
                      <div className="space-y-2 pt-2">
                        
                        {/* 1. Atur Pengiriman if Sudah Bayar or Processing */}
                        {(order.status === 'Sudah Bayar' || order.status === 'Processing') && (
                          <button
                            onClick={() => openArrangeShipment(order)}
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Kemas & Atur Pengiriman</span>
                          </button>
                        )}

                        {/* 1b. Konfirmasi jika Menunggu Pembayaran */}
                        {(order.status === 'Pending' || order.status === 'Menunggu Pembayaran') && (
                          <button
                            onClick={() => handleQuickStatus(order.id, 'Sudah Bayar')}
                            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Tandai Sudah Bayar (Manual)</span>
                          </button>
                        )}

                        {/* 2. Cetak Resi / Label Pengiriman (Print Shipping Label) */}
                        <button
                          onClick={() => openPrintLabel(order)}
                          className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Cetak Label Pengiriman</span>
                        </button>

                        {/* 3. WhatsApp Customer Chat */}
                        <button
                          onClick={() => handleContactCustomer(order)}
                          className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Chat WhatsApp Pembeli</span>
                        </button>

                        {/* 4. Tandai Selesai if Shipped */}
                        {order.status === 'Shipped' && (
                          <button
                            onClick={() => handleQuickStatus(order.id, 'Completed')}
                            className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Tandai Paket Selesai</span>
                          </button>
                        )}

                        {/* 5. Batalkan Pesanan */}
                        {order.status !== 'Cancelled' && order.status !== 'Dibatalkan' && order.status !== 'Completed' && order.status !== 'Kadaluarsa' && (
                          <button
                            onClick={() => openCancelOrder(order)}
                            className="w-full py-1 text-[11px] text-red-600 hover:text-red-700 hover:underline text-center block cursor-pointer"
                          >
                            Batalkan Pesanan
                          </button>
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 3. PRODUCTS TAB (CRUD) */}
      {currentTab === 'products' && (
        <div className="mt-8 space-y-4">
          
          {/* Action Bar: Search & Add Product */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Cari nama, brand, SKU..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-neutral-700 text-left">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Produk</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">Harga Normal</th>
                    <th className="p-3.5">Stok</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredAdminProducts.slice(0, 50).map(product => (
                    <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100" 
                        />
                        <div>
                          <p className="font-bold text-neutral-900 max-w-xs truncate">{product.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">SKU: {product.sku}</p>
                        </div>
                      </td>
                      <td className="p-3.5 text-neutral-600">{product.category}</td>
                      <td className="p-3.5 font-semibold text-neutral-800">{product.brand}</td>
                      <td className="p-3.5 font-bold text-neutral-950">
                        {formatIDR(product.price)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          product.stock > 10 ? 'bg-emerald-100 text-emerald-800' :
                          product.stock > 0 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="p-3.5">
                        {product.badge ? (
                          <span className="px-2 py-0.5 bg-neutral-900 text-white rounded text-[9px] font-extrabold uppercase">
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-right">
            Menampilkan {filteredAdminProducts.length} produk katalog aktif.
          </p>
        </div>
      )}

      {/* 4. USERS TAB */}
      {currentTab === 'users' && (
        <div className="mt-8 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-neutral-700 text-left">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Nomor WhatsApp</th>
                    <th className="p-3.5">Alamat</th>
                    <th className="p-3.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {adminUsers.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-semibold text-neutral-900">{u.fullName}</span>
                      </td>
                      <td className="p-3.5 font-mono text-neutral-500">@{u.username}</td>
                      <td className="p-3.5">{u.email}</td>
                      <td className="p-3.5 font-mono text-emerald-700">{u.phone}</td>
                      <td className="p-3.5 text-neutral-500 max-w-xs truncate">
                        {u.address || '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-neutral-900 text-amber-400' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ATUR PENGIRIMAN SHOPEE (ARRANGE SHIPMENT) */}
      {shippingModalOpen && selectedOrderForShipping && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left border border-neutral-100">
            <button
              onClick={() => setShippingModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950">
                  Atur Pengiriman Pesanan
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono">
                  #{selectedOrderForShipping.orderNumber}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmShipment} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Kurir Pengiriman *</label>
                <select
                  value={inputCourier}
                  onChange={e => setInputCourier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:bg-white focus:outline-none"
                >
                  <option value="J&T Express EZ">J&T Express EZ</option>
                  <option value="SiCepat Reguler">SiCepat Reguler</option>
                  <option value="SiCepat BEST (Next Day)">SiCepat BEST (Next Day)</option>
                  <option value="JNE Reguler">JNE Reguler</option>
                  <option value="JNE YES (Yakin Esok Sampai)">JNE YES</option>
                  <option value="GoSend / GrabExpress Instant">GoSend Instant</option>
                  <option value="AnterAja Reguler">AnterAja Reguler</option>
                  <option value="Shopee Xpress Standard">Shopee Xpress Standard</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700">Nomor Resi Pengiriman *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = inputCourier.includes('SiCepat') ? 'SC' : inputCourier.includes('JNE') ? 'JNE' : 'JT';
                      const code = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}ID`;
                      setInputTrackingNumber(code);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    + Buat Resi Otomatis
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={inputTrackingNumber}
                  onChange={e => setInputTrackingNumber(e.target.value)}
                  placeholder="Contoh: JT8829102910ID"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-mono font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-[11px] space-y-1">
                <p className="font-bold text-neutral-900">Tujuan Penerima:</p>
                <p className="text-neutral-600 font-semibold">{selectedOrderForShipping.customerName} ({selectedOrderForShipping.customerPhone})</p>
                <p className="text-neutral-500 text-[10px]">{selectedOrderForShipping.shippingAddress}, {selectedOrderForShipping.city}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Kirim Paket Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK LABEL PENGIRIMAN SHOPEE (PRINT SHIPPING LABEL / PACKING SLIP) */}
      {printLabelModalOpen && selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-left border border-neutral-200 max-h-[95vh] overflow-y-auto">
            
            {/* Header Dialog */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-neutral-800" />
                <h3 className="font-bold text-neutral-900 text-sm">Label Pengiriman / Packing Slip</h3>
              </div>
              <button
                onClick={() => setPrintLabelModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Area Simulation */}
            <div id="shipping-label-printable" className="mt-4 border-2 border-dashed border-neutral-300 p-5 rounded-2xl bg-white text-neutral-950 font-sans">
              
              {/* Top Bar Label */}
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-3">
                <div>
                  <span className="font-extrabold text-lg tracking-tighter uppercase">DAILY THREAD</span>
                  <span className="text-[10px] text-neutral-500 block">Everyday Movement Apparel HQ</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm uppercase px-2 py-0.5 bg-neutral-950 text-white rounded">
                    {selectedOrderForPrint.courier || selectedOrderForPrint.shippingMethod}
                  </span>
                  <p className="text-[10px] font-mono mt-1 text-neutral-600">NON-COD / PREPAID</p>
                </div>
              </div>

              {/* Barcode & Tracking Number */}
              <div className="py-4 border-b-2 border-neutral-900 text-center">
                {/* Visual Barcode bars */}
                <div className="flex items-center justify-center gap-0.5 h-12 mb-1">
                  {[3, 1, 4, 2, 5, 2, 1, 3, 2, 4, 1, 3, 5, 2, 4, 1, 3, 2, 4, 2, 1, 5, 3, 1, 4, 2, 3, 1, 4, 2].map((w, i) => (
                    <div key={i} className="bg-neutral-950 h-full" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>
                <p className="font-mono text-base font-extrabold tracking-widest text-neutral-950">
                  {selectedOrderForPrint.trackingNumber || selectedOrderForPrint.orderNumber}
                </p>
                <p className="text-[10px] text-neutral-400 font-mono">No. Pesanan: #{selectedOrderForPrint.orderNumber}</p>
              </div>

              {/* Sender & Receiver Info */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-neutral-900 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">PENGIRIM:</span>
                  <p className="font-bold text-neutral-950">Daily Thread Official Store</p>
                  <p className="text-[11px] text-neutral-600">0812-3456-7890</p>
                  <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">
                    Jl. Kemang Raya No. 18A, Mampang Prapatan, Jakarta Selatan 12730
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-0.5">PENERIMA:</span>
                  <p className="font-bold text-neutral-950">{selectedOrderForPrint.customerName}</p>
                  <p className="text-[11px] font-mono font-bold text-neutral-800">{selectedOrderForPrint.customerPhone}</p>
                  <p className="text-[10px] text-neutral-700 leading-tight mt-0.5">
                    {selectedOrderForPrint.shippingAddress}
                    {selectedOrderForPrint.district ? `, ${selectedOrderForPrint.district}` : ''}
                    {selectedOrderForPrint.city ? `, ${selectedOrderForPrint.city}` : ''}
                    {selectedOrderForPrint.province ? `, ${selectedOrderForPrint.province}` : ''}
                    {selectedOrderForPrint.postalCode ? ` - ${selectedOrderForPrint.postalCode}` : ''}
                  </p>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="py-3 text-xs">
                <span className="text-[10px] font-bold uppercase text-neutral-500 block mb-1">
                  ISI PAKET ({selectedOrderForPrint.items.length} JENIS PRODUK):
                </span>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                      <th className="py-1">Nama Produk</th>
                      <th className="py-1">Varian</th>
                      <th className="py-1 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {selectedOrderForPrint.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1 font-semibold text-neutral-900">{it.name}</td>
                        <td className="py-1 text-neutral-600">{it.size} / {it.color}</td>
                        <td className="py-1 text-center font-bold text-neutral-950">{it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrderForPrint.notes && (
                <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-600">
                  <strong>Catatan Khusus:</strong> {selectedOrderForPrint.notes}
                </div>
              )}

            </div>

            {/* Print Action Buttons */}
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPrintLabelModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-black"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label Thermal / A4</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: BATALKAN PESANAN */}
      {cancelModalOpen && selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left border border-neutral-100">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-neutral-950">
              Batalkan Pesanan #{selectedOrderForCancel.orderNumber}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Pilih alasan pembatalan untuk pembeli {selectedOrderForCancel.customerName}.
            </p>

            <form onSubmit={handleConfirmCancel} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Alasan Pembatalan</label>
                <select
                  value={cancelReasonInput}
                  onChange={e => setCancelReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="Permintaan pembeli / Ganti varian ukuran">Permintaan pembeli / Ganti varian ukuran</option>
                  <option value="Stok produk habis di gudang">Stok produk habis di gudang</option>
                  <option value="Pembeli tidak melakukan pembayaran sesuai batas waktu">Batas waktu pembayaran terlewati</option>
                  <option value="Alamat pengiriman pembeli tidak terjangkau kurir">Alamat pengiriman tidak valid</option>
                  <option value="Alasan operasional toko lainnya">Alasan operasional toko lainnya</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  Konfirmasi Pembatalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-950 uppercase tracking-tight">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Streetwear Baru'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  placeholder="Vintage Washed Cargo Pants"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Kategori</label>
                  <select
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Brand</label>
                  <select
                    value={pBrand}
                    onChange={e => setPBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Harga Normal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={e => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Harga Diskon (Rp)</label>
                  <input
                    type="number"
                    value={pDiscountPrice || ''}
                    onChange={e => setPDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Opsional"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Stok Unit *</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={e => setPStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Badge</label>
                  <select
                    value={pBadge}
                    onChange={e => setPBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="NONE">Tanpa Badge</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                    <option value="BEST SELLER">BEST SELLER</option>
                    <option value="TRENDING">TRENDING</option>
                    <option value="LIMITED">LIMITED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">URL Foto Produk</label>
                  <input
                    type="url"
                    required
                    value={pImage}
                    onChange={e => setPImage(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Deskripsi Produk *</label>
                <textarea
                  rows={3}
                  required
                  value={pDescription}
                  onChange={e => setPDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-black"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
