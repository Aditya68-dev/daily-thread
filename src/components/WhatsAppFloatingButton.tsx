import React, { useState } from 'react';
import { X, Send, Clock, Sparkles } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Admin WhatsApp details
  const adminPhoneDisplay = '0889-5204-312';
  const adminPhoneRaw = '628895204312';
  const defaultMessage = 'Halo Admin Daily Thread, saya ingin bertanya mengenai produk / pesanan.';
  const whatsappUrl = `https://wa.me/${adminPhoneRaw}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div 
      className="fixed bottom-20 right-3.5 sm:right-6 lg:bottom-6 lg:right-6 z-40 flex flex-col items-end print:hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Interactive Badge / Tooltip */}
      {(showTooltip || isHovered) && (
        <div className="mb-2.5 w-60 sm:w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-neutral-200 p-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200 text-left relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute top-2.5 right-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
              Admin WhatsApp Online
            </span>
          </div>

          <p className="text-xs text-neutral-800 font-semibold leading-tight">
            Butuh Bantuan atau Info Ukuran?
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
            Chat langsung dengan Admin CS di <span className="font-mono font-bold text-neutral-800">{adminPhoneDisplay}</span>
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full py-1.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span>Mulai Chat Sekarang</span>
            <Send className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Main Floating WhatsApp Bubble (Font Awesome Style SVG) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Admin WhatsApp Daily Thread di 08895204312"
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white shadow-2xl shadow-emerald-900/30 transition-all duration-300 transform hover:scale-105"
      >
        {/* Soft pulsing glow ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-60 animate-pulse pointer-events-none" />

        {/* Font Awesome Style WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 448 512"
          fill="currentColor"
          className="w-7 h-7 sm:w-8 sm:h-8 relative z-10 drop-shadow"
          aria-hidden="true"
        >
          {/* Official FontAwesome brands fa-whatsapp path */}
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>

        {/* Small red / green notification badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white z-20">
          1
        </span>
      </a>
    </div>
  );
};
