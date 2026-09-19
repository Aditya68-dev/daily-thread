import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  XCircle, 
  Eye, 
  X,
  ArrowLeft,
  CreditCard,
  Ban,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { orderService } from '../services/orderService.ts';
import { MidtransPaymentModal } from './MidtransPaymentModal.tsx';

export const OrdersView: React.FC = () => {
  const { 
    user, 
    token, 
    setActiveView, 
    cancelOrder, 
    markOrderAsPaid, 
    checkMidtransStatus,
    setAuthModalOpen,
    setAuthModalTab
  } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Ingin mengubah alamat/metode pembayaran');

  const fetchOrders = () => {
    if (!token && !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    orderService.getUserOrders(user?.id, user?.email, user?.phone)
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch orders error', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token, user?.id, user?.email]);

  const handleCheckMidtrans = async (order: Order) => {
    setCheckingOrderId(order.id);
    try {
      const res = await checkMidtransStatus(order.orderNumber, order.id);
      if (res.isPaid) {
        fetchOrders();
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'Sudah Bayar', paymentTime: new Date().toISOString() } : null);
        }
      }
    } finally {
      setCheckingOrderId(null);
    }
  };

  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  const renderStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'Menunggu Pembayaran':
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      case 'Sudah Bayar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sudah Bayar</span>
          </span>
        );
      case 'Kadaluarsa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-500" />
            <span>Kadaluarsa</span>
          </span>
        );
      case 'Dibatalkan':
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Dibatalkan</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>Sedang Diproses</span>
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Dalam Pengiriman</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Selesai</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    const ok = await cancelOrder(cancelModalOrder.id, cancelReason);
    if (ok) {
      setOrders(prev => prev.map(o => o.id === cancelModalOrder.id ? { ...o, status: 'Dibatalkan', cancelReason } : o));
      if (selectedOrder?.id === cancelModalOrder.id) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'Dibatalkan', cancelReason } : null);
      }
    }
    setCancelModalOrder(null);
  };

  const handlePaymentSuccess = async (order: Order) => {
    await markOrderAsPaid(order.id, 'Midtrans Snap');
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Sudah Bayar', paymentTime: new Date().toISOString() } : o));
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(prev => prev ? { ...prev, status: 'Sudah Bayar', paymentTime: new Date().toISOString() } : null);
    }
    setPayingOrder(null);
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'menunggu') return order.status === 'Menunggu Pembayaran' || order.status === 'Pending';
    if (activeTab === 'sudah_bayar') return order.status === 'Sudah Bayar';
    if (activeTab === 'dibatalkan') return order.status === 'Dibatalkan' || order.status === 'Cancelled';
    if (activeTab === 'kadaluarsa') return order.status === 'Kadaluarsa';
    return true;
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Riwayat & Status Pesanan</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Masuk ke akun Anda untuk melihat pesanan aktif, riwayat transaksi, dan status pembayaran Midtrans.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAuthModalTab('login');
            setAuthModalOpen(true);
          }}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Masuk / Daftar Akun
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Daftar Pesanan & Pembayaran Midtrans
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Pesanan Saya ({orders.length})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 flex items-center gap-1.5 text-xs font-semibold"
            title="Muat ulang"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveView('shop')}
            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Belanja</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-neutral-200 scrollbar-none">
        {[
          { id: 'all', label: 'Semua Pesanan' },
          { id: 'menunggu', label: 'Menunggu Pembayaran' },
          { id: 'sudah_bayar', label: 'Sudah Bayar' },
          { id: 'dibatalkan', label: 'Dibatalkan' },
          { id: 'kadaluarsa', label: 'Kadaluarsa' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-neutral-500 font-semibold uppercase tracking-wider">Memuat Pesanan...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center my-8 shadow-xs">
          <Package className="w-12 h-12 mx-auto text-neutral-300 stroke-1 mb-3" />
          <h3 className="text-base font-bold text-neutral-900">Tidak Ada Pesanan di Tab Ini</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'all' 
              ? 'Kamu belum melakukan transaksi pembelian di Daily Thread. Pesan produk dan bayar via Midtrans sekarang!'
              : 'Belum ada pesanan dengan status ini.'}
          </p>
          <button
            onClick={() => setActiveView('shop')}
            className="mt-6 px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
          >
            Lihat Katalog Streetwear
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredOrders.map(order => {
            const isPending = order.status === 'Menunggu Pembayaran' || order.status === 'Pending';
            const isPaid = order.status === 'Sudah Bayar';
            const isCancelled = order.status === 'Dibatalkan' || order.status === 'Cancelled';
            const isExpired = order.status === 'Kadaluarsa';

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 text-neutral-900"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm text-neutral-950">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-neutral-50">
                  {order.items.slice(0, 2).map((item, idx) => {
                    const itemImg = item.image || item.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300';
                    const itemName = item.name || item.productName || 'Produk Daily Thread';

                    return (
                      <div key={idx} className="py-2.5 flex items-center gap-3 text-xs">
                        <img
                          src={itemImg}
                          alt={itemName}
                          className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0 border border-neutral-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{itemName}</p>
                          <p className="text-[11px] text-neutral-500">
                            {item.brand || 'Daily Thread'} • Size {item.size} • {item.color} • {item.quantity} pcs
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-neutral-950">{formatIDR(item.subtotal)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {order.items.length > 2 && (
                    <p className="text-[11px] text-neutral-500 pt-2 italic">
                      +{order.items.length - 2} produk lainnya...
                    </p>
                  )}
                </div>

                {/* Order Status Extra Notice */}
                {isPending && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Menunggu pembayaran Midtrans. Pesanan akan otomatis dibatalkan jika kadaluarsa.</span>
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Pesanan Dibatalkan: {order.cancelReason || 'Dibatalkan oleh pembeli'}</span>
                  </div>
                )}

                {isExpired && (
                  <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>Batas waktu pembayaran habis. Pesanan kadaluarsa.</span>
                  </div>
                )}

                {isPaid && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pembayaran berhasil via Midtrans. Penjual sedang memproses pesanan.</span>
                  </div>
                )}

                {/* Order Footer & Actions */}
                <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Total Tagihan: </span>
                    <strong className="text-sm font-extrabold text-neutral-950">
                      {formatIDR(order.grandTotal)}
                    </strong>
                    <span className="text-[11px] text-neutral-400 ml-2">({order.shippingMethod})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Detail Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian</span>
                    </button>

                    {/* Pay Now Button (if pending) */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPayingOrder(order)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar Sekarang</span>
                        </button>

                        <button
                          type="button"
                          disabled={checkingOrderId === order.id}
                          onClick={() => handleCheckMidtrans(order)}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 disabled:opacity-50"
                          title="Cek konfirmasi status pembayaran dari Midtrans"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkingOrderId === order.id ? 'animate-spin' : ''}`} />
                          <span>{checkingOrderId === order.id ? 'Mengecek...' : 'Cek Status'}</span>
                        </button>
                      </>
                    )}

                    {/* Cancel Button (if pending) */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => setCancelModalOrder(order)}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200/60"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Batalkan</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Rincian Transaksi
                </span>
                <h3 className="text-lg font-bold text-neutral-950">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs">
              
              {/* Status Header inside Modal */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="font-semibold text-neutral-600">Status Pesanan:</span>
                <div>{renderStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Delivery Info */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Penerima:</span>
                  <strong className="text-neutral-900">{selectedOrder.customerName} ({selectedOrder.customerPhone})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Alamat:</span>
                  <span className="text-right text-neutral-900 max-w-xs">
                    {selectedOrder.shippingAddress}, {selectedOrder.district}, {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pengiriman:</span>
                  <strong className="text-neutral-900">{selectedOrder.shippingMethod}</strong>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className="flex justify-between pt-1 border-t border-neutral-200">
                    <span className="text-neutral-500">No. Resi:</span>
                    <span className="font-mono font-bold text-blue-600">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="flex justify-between pt-1 border-t border-neutral-200/60">
                    <span className="text-neutral-500">Catatan:</span>
                    <span className="text-neutral-800 italic">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[11px]">Daftar Produk</h4>
                <div className="divide-y divide-neutral-100">
                  {selectedOrder.items.map((item, idx) => {
                    const itemImg = item.image || item.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300';
                    const itemName = item.name || item.productName || 'Produk';
                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={itemImg} alt="" className="w-10 h-12 object-cover rounded bg-neutral-100 border border-neutral-200" />
                          <div>
                            <p className="font-semibold text-neutral-900">{itemName}</p>
                            <p className="text-[11px] text-neutral-500">
                              {item.size} • {item.color} • {item.quantity} x {formatIDR(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-900">{formatIDR(item.subtotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk:</span>
                  <span>{formatIDR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim:</span>
                  <span>{formatIDR(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-100">
                  <span>Total Tagihan:</span>
                  <span>{formatIDR(selectedOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Midtrans Info */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-blue-900">Payment Gateway Midtrans (Merchant ID: M006167902)</p>
                  <p className="text-[11px] text-blue-700">
                    Status pesanan terhubung langsung secara real-time dengan Admin Dashboard Daily Thread.
                  </p>
                </div>
              </div>

            </div>

            {/* Actions inside modal */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              {(selectedOrder.status === 'Menunggu Pembayaran' || selectedOrder.status === 'Pending') && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setPayingOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bayar Sekarang</span>
                  </button>

                  <button
                    type="button"
                    disabled={checkingOrderId === selectedOrder.id}
                    onClick={() => handleCheckMidtrans(selectedOrder)}
                    className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingOrderId === selectedOrder.id ? 'animate-spin' : ''}`} />
                    <span>{checkingOrderId === selectedOrder.id ? 'Mengecek...' : 'Cek Status'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCancelModalOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Batalkan</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black cursor-pointer ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Batalkan Pesanan?</h3>
                <p className="text-xs text-neutral-500 font-mono">#{cancelModalOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              Apakah Anda yakin ingin membatalkan pesanan ini? Status pesanan akan langsung diubah menjadi <strong>Dibatalkan</strong> di Admin Dashboard.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Alasan Pembatalan:
              </label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-black bg-white"
              >
                <option value="Ingin mengubah alamat/metode pembayaran">Ingin mengubah alamat/metode pembayaran</option>
                <option value="Menemukan harga lebih murah">Menemukan produk/harga lain</option>
                <option value="Salah memilih ukuran / warna">Salah memilih ukuran / warna</option>
                <option value="Tidak ingin melanjutkan pembelian">Tidak ingin melanjutkan pembelian</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Ya, Batalkan Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Midtrans Payment Modal for OrdersView */}
      <MidtransPaymentModal
        isOpen={!!payingOrder}
        order={payingOrder}
        onClose={() => setPayingOrder(null)}
        onSuccess={handlePaymentSuccess}
        onCancelOrder={(order, reason) => {
          cancelOrder(order.id, reason);
          setPayingOrder(null);
          fetchOrders();
        }}
      />

    </div>
  );
};
