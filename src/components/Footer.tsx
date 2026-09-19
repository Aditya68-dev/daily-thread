import React, { useState } from 'react';
import { Instagram, MessageCircle, Send, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Footer: React.FC = () => {
  const { setActiveView, setCategoryFilter, addToast, storeConfig } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    addToast('success', 'Berlangganan Berhasil', 'Terima kasih telah bergabung dengan newsletter Daily Thread!');
    setNewsletterEmail('');
  };

  const storePhone = storeConfig?.whatsappNumber || '6281234567890';

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-900 mt-20">
      {/* Value Badges Banner */}
      <div className="border-b border-neutral-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-neutral-900/50">
            <Truck className="w-8 h-8 text-neutral-100 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bebas Ongkir</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Gratis pengiriman ke seluruh kota dengan minimum belanja Rp 500.000.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-neutral-900/50">
            <RefreshCw className="w-8 h-8 text-neutral-100 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Garansi Tukar Size</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Ukuran tidak pas? Bebas tukar size dalam 7 hari kerja.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-neutral-900/50">
            <ShieldCheck className="w-8 h-8 text-neutral-100 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">100% Kualitas Terkurasi</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Bahan premium, jahitan kokoh, dan kenyamanan mobilitas harian.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tighter text-white uppercase font-sans">
                DAILY THREAD
              </span>
              <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm italic">
              "Everyday clothing for everyday movement."
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Online fashion store terkurasi yang menyediakan busana casual, workwear, streetwear, dan daily outfit terbaik untuk generasi muda berjiwa dinamis.
            </p>

            {/* Social Media */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Ikuti Kami</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-colors"
                  aria-label="Instagram Daily Thread"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-colors font-bold text-xs"
                  aria-label="TikTok Daily Thread"
                >
                  TikTok
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent('Halo Daily Thread, saya ingin bertanya tentang produk.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  aria-label="WhatsApp Daily Thread"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Store</span>
                </a>
              </div>
            </div>
          </div>

          {/* Menu Shop & Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi Toko</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('all'); }} className="hover:text-white transition-colors">
                  Shop Semua Produk
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('Cargo Pants'); }} className="hover:text-white transition-colors">
                  Cargo Pants
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('Salvage Denim'); }} className="hover:text-white transition-colors">
                  Salvage Denim
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('Work Jacket'); }} className="hover:text-white transition-colors">
                  Work Jackets & Outerwear
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('Oversized T-Shirt'); }} className="hover:text-white transition-colors">
                  Oversized T-Shirt
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('shop'); setCategoryFilter('Accessories'); }} className="hover:text-white transition-colors">
                  Accessories & Bags
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care / Policy */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Layanan & Kebijakan</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">About Us</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Contact Us</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">FAQ & Panduan Belanja</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Shipping & Pengiriman</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Return & Exchange Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Newsletter Exclusive</h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Daftar sekarang untuk mendapatkan voucher 15% potongan pertama dan info drop koleksi streetwear terbaru.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Masukkan email Anda..."
                  required
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Langganan</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© 2026 Daily Thread. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Jakarta • Bandung • Surabaya • Bali</span>
            <span className="text-neutral-400">Youth Streetwear Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
