import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Truck, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink,
  CreditCard,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Order } from '../types.ts';
import { MidtransPaymentModal } from './MidtransPaymentModal.tsx';

export const CheckoutView: React.FC = () => {
  const { cart, user, createOrder, setActiveView, setSelectedOrder, cancelOrder, markOrderAsPaid } = useStore();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [city, setCity] = useState(user?.city || '');
  const [province, setProvince] = useState('DKI Jakarta');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [notes, setNotes] = useState('');
  
  // Shipping Method
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('JNE Reguler');
  const [shippingCost, setShippingCost] = useState(18000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showMidtransModal, setShowMidtransModal] = useState(false);

  const shippingOptions = [
    { name: 'JNE Reguler (2-3 Hari)', cost: 18000 },
    { name: 'SiCepat BEST (1-2 Hari)', cost: 24000 },
    { name: 'J&T Express EZ (2-3 Hari)', cost: 19000 },
    { name: 'GoSend Instant (Hari Ini)', cost: 35000 },
    { name: 'Ambil Sendiri di Toko (Store Pick-up)', cost: 0 },
  ];

  const subtotal = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  const grandTotal = (Number(subtotal) || 0) + (Number(shippingCost) || 0);
  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  const handleShippingChange = (name: string, cost: number) => {
    setSelectedShippingMethod(name);
    setShippingCost(cost);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    const payload = {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      district,
      city,
      province,
      postalCode,
      notes: notes.trim() || '-',
      shippingMethod: selectedShippingMethod,
      shippingCost,
      items: cart.map(item => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }))
    };

    const result = await createOrder(payload);
    setIsSubmitting(false);

    if (result) {
      setCompletedOrder(result.order);
      setSelectedOrder(result.order);
      setShowMidtransModal(true);
    }
  };

  const handlePaymentSuccess = async (order: Order) => {
    await markOrderAsPaid(order.id, 'Midtrans Snap');
    setCompletedOrder(prev => prev ? { ...prev, status: 'Sudah Bayar', paymentTime: new Date().toISOString() } : null);
    setShowMidtransModal(false);
  };

  const handleCancelOrder = async (order: Order, reason?: string) => {
    await cancelOrder(order.id, reason);
    setCompletedOrder(prev => prev ? { ...prev, status: 'Dibatalkan', cancelReason: reason } : null);
    setShowMidtransModal(false);
  };

  // If order was successfully created / placed
  if (completedOrder) {
    const isPaid = completedOrder.status === 'Sudah Bayar';
    const isCancelled = completedOrder.status === 'Dibatalkan';
    const isExpired = completedOrder.status === 'Kadaluarsa';
    const isPending = completedOrder.status === 'Menunggu Pembayaran';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-left">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            isPaid ? 'bg-emerald-100 text-emerald-600' :
            isCancelled ? 'bg-red-100 text-red-600' :
            isExpired ? 'bg-neutral-100 text-neutral-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            {isPaid && <CheckCircle2 className="w-8 h-8" />}
            {isCancelled && <XCircle className="w-8 h-8" />}
            {isExpired && <AlertCircle className="w-8 h-8" />}
            {isPending && <Clock className="w-8 h-8 animate-pulse" />}
          </div>

          <div className="text-center">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isPaid ? 'bg-emerald-100 text-emerald-800' :
              isCancelled ? 'bg-red-100 text-red-800' :
              isExpired ? 'bg-neutral-100 text-neutral-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              Status: {completedOrder.status}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-2">
              Order ID: #{completedOrder.orderNumber}
            </h2>
            <p className="text-xs text-neutral-500 mt-2 max-w-md mx-auto">
              Terima kasih <strong>{completedOrder.customerName}</strong>! Pesanan Anda telah tersimpan di sistem Daily Thread dan langsung terhubung dengan dashboard admin.
            </p>
          </div>

          {/* Midtrans Payment Action for Pending Orders */}
          {isPending && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-950">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Selesaikan Pembayaran via Midtrans</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Mendukung QRIS (GoPay/ShopeePay/OVO/Dana), BCA Virtual Account, Mandiri, dan lainnya.
              </p>
              <button
                type="button"
                onClick={() => setShowMidtransModal(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Buka Pembayaran Midtrans</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Paid Confirmation Box */}
          {isPaid && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 text-emerald-900">
              <p className="text-xs font-bold">Pembayaran Diterima via Midtrans</p>
              <p className="text-[11px] text-emerald-700">
                Pesanan Anda sedang dipersiapkan oleh tim gudang Daily Thread.
              </p>
            </div>
          )}

          {/* Cancelled Box */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1 text-red-900">
              <p className="text-xs font-bold">Pesanan Telah Dibatalkan</p>
              <p className="text-[11px] text-red-700">
                {completedOrder.cancelReason || 'Dibatalkan oleh pelanggan'}
              </p>
            </div>
          )}

          {/* Order Summary Recap */}
          <div className="border-t border-neutral-100 pt-5 space-y-3 text-xs text-neutral-600 text-left">
            <div className="flex justify-between">
              <span>Metode Pengiriman:</span>
              <strong className="text-neutral-900">{completedOrder.shippingMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Tagihan:</span>
              <strong className="text-base text-neutral-950 font-extrabold">
                {formatIDR(completedOrder.grandTotal)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Alamat Pengiriman:</span>
              <span className="text-right text-neutral-900 max-w-xs font-medium">
                {completedOrder.shippingAddress}, {completedOrder.district}, {completedOrder.city}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setActiveView('orders')}
              className="flex-1 py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
            >
              Lihat Pesanan Saya
            </button>
            {isPending && (
              <button
                type="button"
                onClick={() => handleCancelOrder(completedOrder, 'Dibatalkan oleh pembeli')}
                className="py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Batalkan Pesanan
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveView('shop')}
              className="flex-1 py-3 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              Lanjut Belanja
            </button>
          </div>

          {/* Midtrans Modal */}
          <MidtransPaymentModal
            isOpen={showMidtransModal}
            order={completedOrder}
            onClose={() => setShowMidtransModal(false)}
            onSuccess={handlePaymentSuccess}
            onCancelOrder={handleCancelOrder}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveView('cart')}
          className="p-2 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-neutral-950">
            Checkout & Pembayaran Midtrans
          </h1>
          <p className="text-xs text-neutral-500">
            Isi alamat pengiriman dan bayar langsung melalui Payment Gateway Midtrans (QRIS, VA, E-Wallet)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Alamat & Pengiriman */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
              Informasi Penerima & Alamat
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  No. Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Alamat Rumah Lengkap (Jalan, No. Rumah, RT/RW) *
              </label>
              <textarea
                required
                rows={3}
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                placeholder="Jl. Senopati No. 42, RT 02 / RW 05"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kecamatan *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Kebayoran Baru"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Jakarta Selatan"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="12190"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Titipkan di pos satpam bila tidak ada orang di rumah"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

          </div>

          {/* Opsi Pengiriman */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Pilihan Ekspedisi Kurir</span>
            </h2>

            <div className="space-y-2.5">
              {shippingOptions.map((opt) => (
                <label
                  key={opt.name}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-colors ${
                    selectedShippingMethod === opt.name
                      ? 'border-black bg-neutral-50/80 font-medium'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShippingMethod === opt.name}
                      onChange={() => handleShippingChange(opt.name, opt.cost)}
                      className="accent-black"
                    />
                    <span className="text-xs text-neutral-900">{opt.name}</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-950">
                    {opt.cost === 0 ? 'Gratis' : formatIDR(opt.cost)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ringkasan & Midtrans Button */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-5 sticky top-24 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-3">
              Ringkasan Pesanan ({cart.length} Item)
            </h2>

            {/* Item List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs pb-3 border-b border-neutral-200/60 last:border-0 last:pb-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop'}
                    alt={item.name || 'Produk'}
                    className="w-14 h-14 object-cover rounded-lg bg-neutral-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{item.name || 'Produk'}</h3>
                    <p className="text-[11px] text-neutral-500">
                      {item.size} • {item.color} • {item.quantity}x
                    </p>
                    <p className="font-bold text-neutral-950 mt-0.5">
                      {formatIDR((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-neutral-200 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-neutral-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim ({selectedShippingMethod.split(' ')[0]})</span>
                <span className="font-semibold text-neutral-900">
                  {shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold block">
                  Total Tagihan
                </span>
                <span className="text-xs text-blue-700 font-semibold">Bayar Aman via Midtrans</span>
              </div>
              <span className="text-2xl font-extrabold text-neutral-950">{formatIDR(grandTotal)}</span>
            </div>

            {/* Midtrans Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>{isSubmitting ? 'Menghubungkan Midtrans...' : 'Bayar Sekarang via Midtrans'}</span>
            </button>

            <div className="p-3 rounded-xl bg-white border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Terintegrasi langsung dengan Midtrans Payment Gateway (Merchant ID: M006167902). Status pembayaran akan terupdate otomatis ke Admin Dashboard.
              </span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};
