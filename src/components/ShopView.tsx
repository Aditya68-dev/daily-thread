import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  RotateCcw, 
  Search, 
  SlidersHorizontal,
  Star,
  Check,
  PackageSearch
} from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { productService } from '../services/productService.ts';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const COLORS = [
  'Washed Black', 
  'Vintage Indigo', 
  'Raw Ecru', 
  'Olive Drab', 
  'Heather Grey', 
  'Dark Khaki', 
  'Charcoal', 
  'Forest Green', 
  'Clay Brown',
  'Navy Blue',
  'Off White'
];

export const ShopView: React.FC = () => {
  const { 
    categories, 
    brands, 
    categoryFilter, 
    setCategoryFilter, 
    brandFilter, 
    setBrandFilter,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'cheapest' | 'highest' | 'bestseller'>('newest');
  
  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load products whenever filters or page changes
  const fetchFilteredProducts = (pageToFetch = 1, append = false) => {
    setLoading(true);

    productService.getProducts({
      search: searchQuery.trim() || undefined,
      category: categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined,
      brand: brandFilter && brandFilter !== 'all' ? brandFilter : undefined,
      minPrice: minPrice,
      maxPrice: maxPrice,
      size: selectedSize !== 'all' ? selectedSize : undefined,
      color: selectedColor !== 'all' ? selectedColor : undefined,
      rating: selectedRating > 0 ? selectedRating : undefined,
      badge: selectedBadge !== 'all' ? selectedBadge : undefined,
      sort: sortBy,
      page: pageToFetch,
      limit: 24
    })
      .then(data => {
        if (append) {
          setProducts(prev => [...prev, ...(data.products || [])]);
        } else {
          setProducts(data.products || []);
        }
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch products catalog error', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFilteredProducts(1, false);
  }, [
    categoryFilter, 
    brandFilter, 
    searchQuery, 
    minPrice, 
    maxPrice, 
    selectedSize, 
    selectedColor, 
    selectedRating, 
    selectedBadge, 
    sortBy
  ]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      fetchFilteredProducts(nextPage, true);
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setBrandFilter('all');
    setSearchQuery('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedSize('all');
    setSelectedColor('all');
    setSelectedRating(0);
    setSelectedBadge('all');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    categoryFilter !== 'all' || 
    brandFilter !== 'all' || 
    searchQuery.trim() !== '' || 
    minPrice !== undefined || 
    maxPrice !== undefined || 
    selectedSize !== 'all' || 
    selectedColor !== 'all' || 
    selectedRating > 0 || 
    selectedBadge !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Search Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-neutral-200/80 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Katalog Lengkap
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Shop Collection
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Menampilkan <strong className="text-neutral-900">{products.length}</strong> dari <strong className="text-neutral-900">{total}</strong> total produk streetwear & workwear
          </p>
        </div>

        {/* Sort and Mobile Filter Toggle */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium hidden sm:inline-block">Urutkan:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200 cursor-pointer"
            >
              <option value="newest">Terbaru (Newest)</option>
              <option value="bestseller">Produk Terlaris (Best Seller)</option>
              <option value="cheapest">Harga Termurah</option>
              <option value="highest">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
          <span className="text-xs font-semibold text-neutral-400 mr-1">Filter Aktif:</span>
          
          {categoryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Kategori: {categoryFilter}</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
            </span>
          )}

          {brandFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Brand: {brandFilter}</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setBrandFilter('all')} />
            </span>
          )}

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Pencarian: "{searchQuery}"</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}

          {selectedSize !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Size: {selectedSize}</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('all')} />
            </span>
          )}

          {selectedColor !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Warna: {selectedColor}</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor('all')} />
            </span>
          )}

          {selectedRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
              <span>Rating: {selectedRating}+ ★</span>
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRating(0)} />
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 ml-2 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Semua</span>
          </button>
        </div>
      )}

      {/* Main Shop Layout: Sidebar Filters (Desktop) + Product Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filter Katalog</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Kategori Produk
            </h4>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-2 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  categoryFilter === 'all'
                    ? 'bg-neutral-950 text-white font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>Semua Kategori</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    categoryFilter === cat.name
                      ? 'bg-neutral-950 text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-[10px] opacity-70">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Brand
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-2 text-xs">
              <button
                onClick={() => setBrandFilter('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  brandFilter === 'all'
                    ? 'bg-neutral-950 text-white font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>Semua Brand</span>
              </button>
              {brands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setBrandFilter(brand.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    brandFilter === brand.name
                      ? 'bg-neutral-950 text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{brand.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Rentang Harga
            </h4>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (Rp)"
                  value={minPrice || ''}
                  onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Max (Rp)"
                  value={maxPrice || ''}
                  onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => { setMinPrice(undefined); setMaxPrice(200000); }}
                  className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                >
                  &lt; 200rb
                </button>
                <button
                  onClick={() => { setMinPrice(200000); setMaxPrice(400000); }}
                  className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                >
                  200rb - 400rb
                </button>
                <button
                  onClick={() => { setMinPrice(400000); setMaxPrice(undefined); }}
                  className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700"
                >
                  &gt; 400rb
                </button>
              </div>
            </div>
          </div>

          {/* Sizes Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Ukuran
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  selectedSize === 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                Semua
              </button>
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    selectedSize === s
                      ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
              Pilihan Warna
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedColor('all')}
                className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                  selectedColor === 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                Semua Warna
              </button>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                    selectedColor === c
                      ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">
              Rating
            </h4>
            <div className="space-y-1">
              {[4.8, 4.7, 4.5].map(ratingVal => (
                <button
                  key={ratingVal}
                  onClick={() => setSelectedRating(selectedRating === ratingVal ? 0 : ratingVal)}
                  className={`w-full text-left px-2 py-1 text-xs rounded flex items-center justify-between ${
                    selectedRating === ratingVal ? 'bg-amber-50 text-amber-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ratingVal} ke atas</span>
                  </div>
                  {selectedRating === ratingVal && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Catalog Products Grid */}
        <main className="lg:col-span-3">
          {products.length === 0 && !loading ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center my-8">
              <PackageSearch className="w-12 h-12 mx-auto text-neutral-300 stroke-1 mb-3" />
              <h3 className="text-base font-bold text-neutral-900">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Tidak ada produk yang cocok dengan filter atau kata kunci pencarian Anda. Coba sesuaikan filter atau reset pencarian.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {products.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {/* Load More & Pagination Bar */}
          {products.length > 0 && page < totalPages && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Memuat Produk...' : `Muat Lebih Banyak (${total - products.length} Tersisa)`}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter Produk</span>
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-5 text-xs">
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[11px]">Kategori</h4>
                  <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.name)}
                        className={`p-1.5 text-left rounded truncate ${
                          categoryFilter === cat.name ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[11px]">Brand</h4>
                  <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto">
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => setBrandFilter(brand.name)}
                        className={`p-1.5 text-left rounded truncate ${
                          brandFilter === brand.name ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[11px]">Ukuran</h4>
                  <div className="flex flex-wrap gap-1">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-2 py-1 rounded text-xs border ${
                          selectedSize === s ? 'bg-neutral-900 text-white border-neutral-900 font-bold' : 'bg-white text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="py-2.5 bg-neutral-100 text-neutral-800 font-semibold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
