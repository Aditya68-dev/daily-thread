import React from 'react';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const CartView: React.FC = () => {
  const { cart, updateCartQty, removeCartItem, clearCart, setActiveView, setAuthModalOpen, user } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  const handleCheckoutClick = () => {
    setActiveView('checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-950 uppercase tracking-tight">
          Keranjang Belanja Kosong
        </h2>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
          Belum ada produk streetwear pilihan yang kamu masukkan ke dalam keranjang.
        </p>
        <button
          onClick={() => setActiveView('shop')}
          className="mt-6 px-8 py-3.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mulai Belanja Sekarang</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Shopping Bag
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Keranjang Belanja ({cart.length} Item)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Bersihkan Keranjang</span>
        </button>
      </div>

      {/* Cart Grid: Items (Left - 8 Cols) & Summary (Right - 4 Cols) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Items List */}
        <div className="lg:col-span-8 divide-y divide-neutral-200">
          {cart.map(item => (
            <div key={item.id} className="py-5 flex gap-4 sm:gap-6 items-start">
              
              {/* Product Thumbnail */}
              <img
                src={item.image || (item as any).productImage || 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop'}
                alt={item.name || (item as any).productName || 'Produk'}
                className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-200/80"
              />

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      {item.brand}
                    </span>
                    <h3 className="font-semibold text-neutral-900 text-sm sm:text-base leading-snug">
                      {item.name || (item as any).productName}
                    </h3>
                  </div>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Variants selected */}
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                  <span>Size: <strong className="font-semibold text-neutral-900">{item.size}</strong></span>
                  <span>•</span>
                  <span>Warna: <strong className="font-semibold text-neutral-900">{item.color}</strong></span>
                </div>

                {/* Price and Quantity Controls */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateCartQty(item.id, Math.max(1, item.quantity - 1))}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 text-sm font-semibold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-neutral-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, item.quantity + 1)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 text-sm font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block">{formatIDR(item.price)} / pcs</span>
                    <span className="text-sm sm:text-base font-extrabold text-neutral-950">
                      {formatIDR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-6">
            <button
              onClick={() => setActiveView('shop')}
              className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Lanjut Belanja Streetwear Lainnya</span>
            </button>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 pb-3 border-b border-neutral-200">
              Ringkasan Pesanan
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Total Item</span>
                <span className="font-semibold text-neutral-900">
                  {cart.reduce((a, b) => a + (Number(b.quantity) || 0), 0)} pcs
                </span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-neutral-900">{formatIDR(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimasi Ongkir</span>
                <span className="text-neutral-500">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-neutral-950 uppercase">Subtotal</span>
              <span className="text-xl font-extrabold text-neutral-950">{formatIDR(subtotal)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 flex items-center gap-2 text-[11px] text-neutral-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Checkout Aman & Terhubung WhatsApp Store Resmi</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
