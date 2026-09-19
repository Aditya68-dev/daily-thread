import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { viewProduct, toggleWishlist, isInWishlist, addToCart } = useStore();
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';

  const formatIDR = (amount?: number | null) => {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // Use first available size and color
    const defaultSize = product.sizes[0] || 'All Size';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product.id, defaultSize, defaultColor, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Badge styling
  const renderBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="bg-neutral-800 text-neutral-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Out of Stock
        </span>
      );
    }
    if (product.badge === 'SALE' || (product.discount_price && product.discount_price < product.price)) {
      const price = Number(product.price) || 0;
      const discountPrice = Number(product.discount_price) || price;
      const percent = price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;
      return (
        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          SALE {percent > 0 ? `-${percent}%` : ''}
        </span>
      );
    }
    if (product.badge === 'BEST SELLER') {
      return (
        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Best Seller
        </span>
      );
    }
    if (product.badge === 'NEW') {
      return (
        <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          New Arrival
        </span>
      );
    }
    if (product.badge === 'TRENDING') {
      return (
        <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Trending
        </span>
      );
    }
    if (product.badge === 'LIMITED') {
      return (
        <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Limited
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => viewProduct(product.id)}
      className="group relative flex flex-col bg-white border border-neutral-200/80 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
    >
      {/* Image & Badges */}
      <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {renderBadge()}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Toggle Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-red-50 text-red-600 shadow-sm'
              : 'bg-white/80 text-neutral-600 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on Desktop */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hidden sm:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-neutral-900/95 hover:bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 backdrop-blur-sm transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Tambah Cepat</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-600">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-neutral-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-medium">{product.rating}</span>
              <span className="text-neutral-400 text-[10px]">({product.sold_count})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Stock */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-end justify-between gap-2">
          <div>
            {product.discount_price ? (
              <div className="flex flex-col">
                <span className="text-[11px] text-neutral-400 line-through">
                  {formatIDR(product.price)}
                </span>
                <span className="text-sm sm:text-base font-bold text-neutral-950">
                  {formatIDR(product.discount_price)}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-bold text-neutral-950">
                {formatIDR(product.price)}
              </span>
            )}
          </div>

          <div className="text-right">
            {isOutOfStock ? (
              <span className="text-[11px] font-medium text-red-600">Habis</span>
            ) : (
              <span className="text-[11px] text-neutral-500 font-normal">
                Sisa <strong className="font-semibold text-neutral-700">{product.stock}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
