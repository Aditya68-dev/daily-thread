import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Truck, 
  RefreshCw, 
  Ruler, 
  Share2, 
  Check, 
  ChevronRight, 
  AlertCircle,
  ArrowLeft,
  X
} from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { productService } from '../services/productService.ts';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProductId, 
    viewProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setActiveView, 
    recentlyViewed,
    addToast
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Fetch product and related items
  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    productService.getProductById(selectedProductId)
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          setActiveImageIndex(0);
          setSelectedSize(data.product.sizes[0] || 'All Size');
          setSelectedColor(data.product.colors[0]?.name || 'Standard');
          setQuantity(1);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch product detail error', err);
        setLoading(false);
      });
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Memuat Detail Produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-base font-bold text-neutral-800">Produk tidak ditemukan.</p>
        <button
          onClick={() => setActiveView('shop')}
          className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discount_price) || price;
  const discountPercent = product.discount_price && price > 0
    ? Math.round(((price - discountPrice) / price) * 100) 
    : 0;

  const formatIDR = (val?: number | null) => {
    const safe = typeof val === 'number' && !isNaN(val) ? val : 0;
    return `Rp ${safe.toLocaleString('id-ID')}`;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product.id, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const added = await addToCart(product.id, selectedSize, selectedColor, quantity);
    if (added) {
      setActiveView('checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('info', 'Tautan Disalin', 'Tautan produk berhasil disalin ke clipboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveView('home')} className="hover:text-black transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <button onClick={() => setActiveView('shop')} className="hover:text-black transition-colors">
          Katalog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="hover:text-black transition-colors cursor-pointer">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero Grid: Gallery (Left) & Buy Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Photo Gallery (Left - 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all bg-neutral-100 shrink-0 ${
                  activeImageIndex === idx ? 'border-neutral-900 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Large Image View */}
          <div className="flex-1 relative aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/80 group">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Badges on detail photo */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.badge && (
                <span className="px-3 py-1 bg-neutral-900 text-white font-bold text-xs rounded uppercase tracking-wider shadow">
                  {product.badge}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded uppercase tracking-wider shadow">
                  HEMAT {discountPercent}%
                </span>
              )}
            </div>

            {/* Share and Wishlist quick icons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                  inWishlist ? 'bg-red-50 text-red-600' : 'bg-white/90 text-neutral-700 hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-black backdrop-blur-md transition-all shadow-md"
                aria-label="Bagikan Produk"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info & Buy Action (Right - 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            
            {/* Brand & SKU */}
            <div className="flex items-center justify-between gap-2 pb-2">
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-md">
                {product.brand}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight leading-tight mt-1">
              {product.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-neutral-900">{product.rating}</span>
              </div>
              <span className="text-neutral-300">|</span>
              <span className="text-xs text-neutral-500">{product.sold_count} Terjual</span>
              <span className="text-neutral-300">|</span>
              <span className="text-xs font-medium text-emerald-700">100% Original Streetwear</span>
            </div>

            {/* Price Box */}
            <div className="mt-5 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                {product.discount_price ? (
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                      {formatIDR(product.discount_price)}
                    </span>
                    <span className="text-sm text-neutral-400 line-through">
                      {formatIDR(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                    {formatIDR(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div>
                {isOutOfStock ? (
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                    Stok Habis
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-medium text-xs rounded-full">
                    Sisa Stok: <strong>{product.stock} pcs</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Pilihan Warna: <strong className="text-neutral-700 font-normal">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      selectedColor === col.name
                        ? 'border-neutral-950 bg-neutral-950 text-white font-semibold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: col.hex }}
                    ></span>
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector & Size Guide */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Pilihan Ukuran: <strong className="text-neutral-700 font-normal">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1 underline decoration-dotted"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block mb-2">
                Jumlah Pembelian
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-neutral-400">Maksimum {product.stock} unit</span>
              </div>
            </div>

            {/* Buttons: Add to Cart & Buy Now */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-xl border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-6 rounded-xl bg-neutral-950 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer"
              >
                <span>{isOutOfStock ? 'Stok Habis' : 'Buy Now (Checkout)'}</span>
              </button>
            </div>

            {/* Service Perquisites */}
            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-3 text-xs text-neutral-600">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Pengiriman ke seluruh Indonesia via JNE, SiCepat, J&T, & GoSend.</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Garansi tukar ukuran 7 hari sejak produk diterima.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Description & Specifications Tabs */}
      <div className="mt-16 border-t border-neutral-200/80 pt-10">
        <div className="max-w-3xl">
          <h3 className="text-base font-bold text-neutral-950 uppercase tracking-wider mb-4">
            Deskripsi & Detail Produk
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 text-xs">
            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Kategori</span>
              <strong className="text-neutral-900 font-semibold">{product.category}</strong>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Brand</span>
              <strong className="text-neutral-900 font-semibold">{product.brand}</strong>
            </div>
            <div>
              <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Kondisi</span>
              <strong className="text-neutral-900 font-semibold">100% Baru & Original</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-neutral-200/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-neutral-950 uppercase tracking-tight">
              Produk Terkait ({product.category})
            </h3>
            <button
              onClick={() => setActiveView('shop')}
              className="text-xs font-semibold text-neutral-600 hover:text-black"
            >
              Lihat Koleksi Lengkap &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map(relProd => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 1 && (
        <section className="mt-16 pt-10 border-t border-neutral-200/80">
          <h3 className="text-xl font-extrabold text-neutral-950 uppercase tracking-tight mb-6">
            Terakhir Kamu Lihat
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.filter(p => p.id !== product.id).slice(0, 4).map(rvProd => (
              <ProductCard key={rvProd.id} product={rvProd} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-neutral-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Panduan Ukuran (Size Guide)
                </h3>
              </div>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-neutral-500 mb-4">
                Semua ukuran diukur dalam satuan <strong>Centimeter (cm)</strong>. Toleransi ukuran 1-2 cm wajar terjadi karena proses pemotongan kain.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-neutral-800 border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-900 border-b border-neutral-200">
                      <th className="p-2.5 text-left font-bold">Size</th>
                      <th className="p-2.5 text-left font-bold">Lebar Dada / Pinggang</th>
                      <th className="p-2.5 text-left font-bold">Panjang</th>
                      <th className="p-2.5 text-left font-bold">Tinggi Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="p-2.5 font-bold">S</td>
                      <td className="p-2.5">50 - 52 cm</td>
                      <td className="p-2.5">68 - 70 cm</td>
                      <td className="p-2.5">155 - 165 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">M</td>
                      <td className="p-2.5">53 - 55 cm</td>
                      <td className="p-2.5">71 - 73 cm</td>
                      <td className="p-2.5">165 - 172 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">L</td>
                      <td className="p-2.5">56 - 58 cm</td>
                      <td className="p-2.5">74 - 76 cm</td>
                      <td className="p-2.5">173 - 180 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">XL</td>
                      <td className="p-2.5">59 - 61 cm</td>
                      <td className="p-2.5">77 - 79 cm</td>
                      <td className="p-2.5">178 - 185 cm</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">XXL</td>
                      <td className="p-2.5">62 - 65 cm</td>
                      <td className="p-2.5">80 - 82 cm</td>
                      <td className="p-2.5">&gt; 185 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setSizeGuideOpen(false)}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
