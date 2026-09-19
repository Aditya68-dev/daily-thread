import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, viewProduct, setActiveView, user } = useStore();

  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-sm font-semibold text-neutral-800">Silakan login untuk melihat koleksi wishlist Anda.</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <Heart className="w-8 h-8 stroke-1" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-950 uppercase tracking-tight">
          Wishlist Masih Kosong
        </h2>
        <p className="text-xs text-neutral-500 mt-2">
          Simpan produk streetwear yang kamu sukai dengan menekan ikon hati pada katalog produk.
        </p>
        <button
          onClick={() => setActiveView('shop')}
          className="mt-6 px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
        >
          Eksplorasi Katalog
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
            Saved Items
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Wishlist Saya ({wishlist.length})
          </h1>
        </div>
        <button
          onClick={() => setActiveView('shop')}
          className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1"
        >
          <span>Lanjut Cari Produk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map(item => (
          <div
            key={item.id}
            className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div
              onClick={() => viewProduct(item.productId)}
              className="relative aspect-[4/5] bg-neutral-100 cursor-pointer overflow-hidden"
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(item.productId);
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md backdrop-blur-sm transition-colors"
                title="Hapus dari wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {item.brand}
                </span>
                <h3
                  onClick={() => viewProduct(item.productId)}
                  className="font-medium text-neutral-900 text-sm mt-0.5 line-clamp-2 cursor-pointer hover:underline"
                >
                  {item.productName}
                </h3>
                <p className="font-extrabold text-neutral-950 text-sm mt-2">
                  {formatIDR(item.price)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => {
                    addToCart(item.productId, 'All Size', 'Standard', 1);
                  }}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Pindahkan ke Keranjang</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
