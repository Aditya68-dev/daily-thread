import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Bell, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  LogOut, 
  Package, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Home,
  MessageCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { NotificationsDropdown } from './NotificationsDropdown.tsx';
import { Product } from '../types.ts';
import { productService } from '../services/productService.ts';

export const Navbar: React.FC = () => {
  const { 
    user, 
    cart, 
    wishlist, 
    notifications, 
    activeView, 
    setActiveView, 
    categories, 
    brands,
    setAuthModalOpen, 
    setAuthModalTab, 
    logout, 
    searchQuery, 
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    viewProduct
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const cartItemCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const wishlistItemCount = wishlist.length;

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle outside click to close mobile menu
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [mobileMenuOpen]);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      productService.getProducts({ search: searchQuery.trim(), limit: 6 })
        .then(data => {
          setSearchResults(data.products || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('shop');
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const selectCategory = (catName: string) => {
    setCategoryFilter(catName);
    setBrandFilter('all');
    setActiveView('shop');
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const selectBrand = (brandName: string) => {
    setBrandFilter(brandName);
    setCategoryFilter('all');
    setActiveView('shop');
    setBrandsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Koleksi Baru Streetwear & Workwear 2026. Gratis Ongkir untuk pesanan di atas Rp 500.000!</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => {
                setActiveView('home');
                setCategoryFilter('all');
                setBrandFilter('all');
                setSearchQuery('');
              }}
              className="flex flex-col text-left group"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-neutral-950 uppercase font-sans">
                  DAILY THREAD
                </span>
                <span className="w-2 h-2 rounded-full bg-neutral-950 inline-block"></span>
              </div>
              <span className="text-[10px] tracking-widest text-neutral-500 uppercase -mt-1 font-medium hidden sm:inline-block">
                Everyday Movement
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-semibold text-neutral-700">
            <button
              onClick={() => {
                setActiveView('home');
                setCategoryFilter('all');
                setBrandFilter('all');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeView === 'home' ? 'text-black bg-neutral-100' : 'hover:text-black hover:bg-neutral-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                setCategoryFilter('all');
                setBrandFilter('all');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeView === 'shop' && categoryFilter === 'all' && brandFilter === 'all'
                  ? 'text-black bg-neutral-100'
                  : 'hover:text-black hover:bg-neutral-50'
              }`}
            >
              Shop
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setCategoriesDropdownOpen(!categoriesDropdownOpen);
                  setBrandsDropdownOpen(false);
                }}
                className="px-3 py-2 rounded-lg hover:text-black hover:bg-neutral-50 transition-colors flex items-center gap-1"
              >
                <span>Kategori</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoriesDropdownOpen && (
                <div 
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Semua Kategori (18)
                  </div>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => selectCategory(cat.name)}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-100 hover:text-black flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                          {cat.productCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brands Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBrandsDropdownOpen(!brandsDropdownOpen);
                  setCategoriesDropdownOpen(false);
                }}
                className="px-3 py-2 rounded-lg hover:text-black hover:bg-neutral-50 transition-colors flex items-center gap-1"
              >
                <span>Brands</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {brandsDropdownOpen && (
                <div 
                  onMouseLeave={() => setBrandsDropdownOpen(false)}
                  className="absolute left-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Pilihan Brand
                  </div>
                  {brands.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => selectBrand(brand.name)}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-100 hover:text-black flex items-center justify-between transition-colors"
                    >
                      <span>{brand.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveView('shop');
                setCategoryFilter('all');
                setBrandFilter('all');
              }}
              className="px-3 py-2 rounded-lg hover:text-black hover:bg-neutral-50 transition-colors"
            >
              New Arrivals
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                setCategoryFilter('all');
                setBrandFilter('all');
              }}
              className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-bold"
            >
              Sale %
            </button>
          </nav>

          {/* Live Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Cari produk, brand, SKU..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-transparent rounded-full text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Search Dropdown Preview */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-neutral-100 text-xs font-semibold text-neutral-500 flex justify-between items-center">
                  <span>Hasil pencarian "{searchQuery}"</span>
                  {isSearching && <span className="text-neutral-400 text-[10px]">Mencari...</span>}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-6 text-center text-xs text-neutral-400">
                      Tidak ditemukan produk dengan kata kunci tersebut.
                    </div>
                  ) : (
                    searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          viewProduct(p.id);
                          setSearchFocused(false);
                        }}
                        className="p-3 flex items-center gap-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded bg-neutral-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-neutral-500 uppercase">{p.brand}</p>
                          <p className="text-xs font-medium text-neutral-900 truncate">{p.name}</p>
                          <p className="text-xs font-bold text-neutral-950 mt-0.5">
                            Rp {(p.discount_price || p.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 bg-neutral-50 hover:bg-neutral-100 text-center text-xs font-bold text-neutral-800 border-t border-neutral-100 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Buka Semua Hasil di Katalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Action Icons: Notifications, Wishlist, Cart, User */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors relative"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <NotificationsDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
              />
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                } else {
                  setActiveView('wishlist');
                }
              }}
              className="p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-neutral-950 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveView('cart')}
              className="p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors relative"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-neutral-950 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Account or Login button */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors border border-neutral-200/80"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'}
                      alt={user.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-neutral-800 hidden md:inline-block max-w-[100px] truncate">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-neutral-500 hidden md:inline-block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-900 truncate">{user.fullName}</p>
                        <p className="text-[11px] text-neutral-500 truncate">@{user.username}</p>
                        {user.role === 'admin' && (
                          <span className="inline-block mt-1 text-[10px] bg-neutral-900 text-amber-400 font-bold px-2 py-0.5 rounded">
                            ADMIN PANEL
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveView('profile');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>Profil Saya</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveView('notifications');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            <span>Pesan & Notifikasi</span>
                          </div>
                          {unreadNotifCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {unreadNotifCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setActiveView('orders');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          <span>Pesanan Saya</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveView('wishlist');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          <span>Wishlist ({wishlistItemCount})</span>
                        </button>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setActiveView('admin');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-amber-600 hover:bg-amber-50 font-semibold flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setAuthModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalTab('register');
                      setAuthModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-black rounded-lg transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Below Header on Mobile) */}
        <div className="py-2 pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari dari 250+ produk fashion..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-xs text-neutral-900 focus:bg-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation (with backdrop blur & smooth slide) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div
            ref={mobileMenuRef}
            className="fixed inset-y-0 left-0 w-[86%] max-w-sm sm:max-w-md bg-white shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-250"
          >
            {/* 1. Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
              <div 
                onClick={() => {
                  setActiveView('home');
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl text-neutral-950 tracking-tight uppercase">
                    DAILY THREAD
                  </span>
                  <span className="w-2 h-2 rounded-full bg-neutral-950 inline-block" />
                </div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider -mt-0.5">Everyday Movement</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 active:scale-95 transition-all"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Middle Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 text-left">
              
              {/* User Quick Profile Banner */}
              {user ? (
                <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'}
                      alt={user.fullName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-neutral-950 truncate">{user.fullName}</p>
                        {user.role === 'admin' && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl shrink-0 transition-colors shadow-2xs"
                  >
                    Profil
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
                  <p className="text-xs font-bold text-neutral-950">Selamat Datang!</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Masuk akun untuk belanja dan kelola pesanan.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setAuthModalTab('login');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="py-2 bg-white border border-neutral-300 text-xs font-bold rounded-xl text-neutral-800 hover:bg-neutral-100 transition-colors text-center"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalTab('register');
                        setAuthModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="py-2 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors text-center"
                    >
                      Daftar
                    </button>
                  </div>
                </div>
              )}

              {/* In-Menu Search Input */}
              <form 
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }} 
                className="relative"
              >
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari streetwear, denim, hoodie..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:bg-white focus:border-neutral-900 transition-colors"
                />
              </form>

              {/* Primary Navigation Links */}
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => {
                    setActiveView('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-3 min-h-[44px] ${
                    activeView === 'home' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('shop');
                    setCategoryFilter('all');
                    setBrandFilter('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[44px] ${
                    activeView === 'shop' && categoryFilter === 'all' && brandFilter === 'all'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Katalog Lengkap (250+ Produk)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => {
                    setActiveView('cart');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[44px] ${
                    activeView === 'cart' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Keranjang Belanja</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeView === 'cart' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {cartItemCount} item
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      setAuthModalTab('login');
                      setAuthModalOpen(true);
                    } else {
                      setActiveView('wishlist');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[44px] ${
                    activeView === 'wishlist' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 shrink-0" />
                    <span>Wishlist Saya</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeView === 'wishlist' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {wishlistItemCount}
                  </span>
                </button>

                {/* Notifications Link */}
                <button
                  onClick={() => {
                    setActiveView('notifications');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[44px] ${
                    activeView === 'notifications' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 shrink-0" />
                    <span>Pesan & Notifikasi</span>
                  </div>
                  {unreadNotifCount > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadNotifCount} Baru
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-400">0</span>
                  )}
                </button>

                {/* Orders Link */}
                <button
                  onClick={() => {
                    if (!user) {
                      setAuthModalTab('login');
                      setAuthModalOpen(true);
                    } else {
                      setActiveView('orders');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-3 min-h-[44px] ${
                    activeView === 'orders' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Riwayat Pesanan</span>
                </button>

                {/* Profile Link */}
                {user && (
                  <button
                    onClick={() => {
                      setActiveView('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-3 min-h-[44px] ${
                      activeView === 'profile' ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 shrink-0" />
                    <span>Profil & Foto Saya</span>
                  </button>
                )}

                {/* Admin Dashboard (if admin) */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between min-h-[44px] ${
                      activeView === 'admin' ? 'bg-purple-900 text-white shadow-xs' : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Admin Dashboard</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 uppercase">
                      Panel
                    </span>
                  </button>
                )}
              </div>

              {/* 3. Collapsible Categories Accordion */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between py-2 px-1 text-xs font-bold text-neutral-900 hover:text-black uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <span>Kategori Pilihan</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({categories.length})</span>
                  </div>
                  {mobileCategoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {mobileCategoriesOpen && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2 animate-in fade-in duration-150">
                    <button
                      onClick={() => selectCategory('all')}
                      className={`text-left px-2.5 py-2 text-xs rounded-xl font-medium truncate ${
                        categoryFilter === 'all' ? 'bg-neutral-950 text-white font-bold' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Semua Kategori
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat.name)}
                        className={`text-left px-2.5 py-2 text-xs rounded-xl font-medium truncate ${
                          categoryFilter === cat.name ? 'bg-neutral-950 text-white font-bold' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Collapsible Brands Accordion */}
              <div className="pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                  className="w-full flex items-center justify-between py-2 px-1 text-xs font-bold text-neutral-900 hover:text-black uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <span>Top Brands</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({brands.length})</span>
                  </div>
                  {mobileBrandsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {mobileBrandsOpen && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2 animate-in fade-in duration-150">
                    <button
                      onClick={() => selectBrand('all')}
                      className={`text-left px-2.5 py-2 text-xs rounded-xl font-medium truncate ${
                        brandFilter === 'all' ? 'bg-neutral-950 text-white font-bold' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Semua Brand
                    </button>
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        onClick={() => selectBrand(brand.name)}
                        className={`text-left px-2.5 py-2 text-xs rounded-xl font-medium truncate ${
                          brandFilter === brand.name ? 'bg-neutral-950 text-white font-bold' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. WhatsApp Admin Direct Contact Banner */}
              <div className="pt-2 border-t border-neutral-100">
                <a
                  href="https://wa.me/628895204312?text=Halo%20Admin%20Daily%20Thread,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pesanan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center justify-between transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-950">Chat Admin WhatsApp</p>
                      <p className="text-[11px] font-mono font-semibold text-emerald-700">0889-5204-312</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg uppercase tracking-wider">
                    Chat
                  </span>
                </a>
              </div>

            </div>

            {/* 6. Drawer Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 shrink-0">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 border border-neutral-200 hover:border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Daily Thread Official Store &bull; Everyday Movement
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
