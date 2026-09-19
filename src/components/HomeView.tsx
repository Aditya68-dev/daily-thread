import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Tag, 
  Percent, 
  ShieldCheck, 
  Truck,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { productService } from '../services/productService.ts';

export const HomeView: React.FC = () => {
  const { setActiveView, setCategoryFilter, setBrandFilter, categories, brands } = useStore();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categorized batches from the 250+ products database
    Promise.all([
      productService.getProducts({ limit: 8, badge: 'NEW' }),
      productService.getProducts({ limit: 8, sort: 'bestseller' }),
      productService.getProducts({ limit: 8, badge: 'TRENDING' }),
      productService.getProducts({ limit: 8, badge: 'SALE' }),
      productService.getProducts({ limit: 8 }),
    ])
      .then(([newRes, bestRes, trendRes, saleRes, featRes]) => {
        setNewArrivals(newRes.products || []);
        setBestSellers(bestRes.products || []);
        setTrendingProducts(trendRes.products || []);
        setDiscountProducts(saleRes.products || []);
        setFeaturedProducts(featRes.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Home data load error', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-neutral-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-neutral-900 shadow-2xl">
        {/* Background Streetwear Imagery with refined overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1800&auto=format&fit=crop"
            alt="Streetwear Youth Fashion"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-6 py-20 sm:py-28 md:py-36 sm:px-12 lg:px-16 flex flex-col items-start text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider mb-6 text-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Koleksi Terkurasi 250+ Pilihan Streetwear</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
            Find Your <br />
            <span className="text-neutral-300 underline decoration-neutral-600 decoration-wavy decoration-2">Everyday Style</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-xl font-normal leading-relaxed">
            Fashion essentials for your everyday movement.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-lg">
            Kombinasi sempurna antara casual, rugged workwear, dan contemporary streetwear yang nyaman untuk mobilitas harian anak muda.
          </p>

          {/* Buttons: Shop Now & Explore Collection */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setActiveView('shop');
                setCategoryFilter('all');
              }}
              className="px-8 py-4 bg-white text-black hover:bg-neutral-200 font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                setCategoryFilter('Salvage Denim');
              }}
              className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm uppercase tracking-wider rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Collection</span>
            </button>
          </div>

          {/* Key Stats Bar */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-neutral-800/80 grid grid-cols-3 gap-6 sm:gap-12 text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">250+</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Produk Katalog</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">18</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Kategori Fashion</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">100%</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Ready Stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES (Visual Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Kategori Terlengkap
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              Product Categories
            </h2>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Semua Kategori</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 12).map(cat => (
            <div
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.name);
                setActiveView('shop');
              }}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-neutral-100 cursor-pointer shadow-sm hover:shadow-md transition-all border border-neutral-200/60"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute inset-x-3 bottom-3 text-left">
                <p className="text-xs font-bold text-white uppercase tracking-tight group-hover:underline">
                  {cat.name}
                </p>
                <p className="text-[10px] text-neutral-300 font-medium">
                  {cat.productCount ? `${cat.productCount} Produk` : 'Koleksi Lengkap'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Pilihan Editor
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. PROMO BANNER 1 (Weekend Selvedge & Workwear Drop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-12 md:p-16 border border-neutral-800 shadow-xl">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop"
              alt="Raw Selvedge Denim"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-950/80"></div>
          </div>

          <div className="relative z-10 max-w-xl text-left">
            <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider inline-block mb-4">
              SPECIAL DROP EVENT
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Authentic Selvedge & Work Pants
            </h3>
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
              Ditenun menggunakan shuttle loom klasik dengan red-line selvedge untuk ketahanan raw denim yang menua secara personal seiring waktu.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => {
                  setCategoryFilter('Salvage Denim');
                  setActiveView('shop');
                }}
                className="px-6 py-3 bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Lihat Koleksi Selvedge
              </button>
              <span className="text-xs text-neutral-400 font-medium">Mulai dari Rp 349.000</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Baru Dirilis
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Semua Rilisan Baru</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-neutral-100/70 py-12 px-6 rounded-3xl border border-neutral-200/70">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Paling Diminati
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => {
              setActiveView('shop');
            }}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Lihat Terlaris</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Sedang Populer di Kalangan Remaja
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              Trending Products
            </h2>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Eksplorasi Tren</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 8. DISCOUNT PRODUCTS (Flash Sale) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-600">
                Promo & Diskon Terbesar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
              Discount Products
            </h2>
          </div>
          <button
            onClick={() => setActiveView('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
          >
            <span>Semua Diskon</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {discountProducts.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 9. BRAND COLLECTION (Brand Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Kemitraan & Merek
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Brand Collection
          </h2>
          <p className="text-xs text-neutral-500 mt-2">
            Pilihan brand fashion dunia dan lokal berkualitas tinggi untuk menyempurnakan daily movement kamu.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => {
                setBrandFilter(brand.name);
                setActiveView('shop');
              }}
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer group"
            >
              <span className="font-extrabold text-sm text-neutral-900 group-hover:text-black uppercase tracking-wider">
                {brand.name}
              </span>
              <span className="text-[10px] text-neutral-400">Streetwear & Heritage</span>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};
