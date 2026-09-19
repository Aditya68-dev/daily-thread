import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Order } from '../types.ts';
import { midtransService } from '../services/midtransService.ts';

interface MidtransPaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  onCancelOrder?: (order: Order, reason?: string) => void;
  onExpireOrder?: (order: Order) => void;
}

export const MidtransPaymentModal: React.FC<MidtransPaymentModalProps> = ({
  isOpen,
  order,
  onClose,
  onSuccess,
  onCancelOrder,
  onExpireOrder
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [timeLeft, setTimeLeft] = useState('23:59:45');
  const [midtransStatus, setMidtransStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);

  const midtransConfig = midtransService.getConfig();

  // 1. Countdown timer (24 hours window)
  useEffect(() => {
    if (!isOpen || !order) return;

    const calculateTime = () => {
      const created = new Date(order.createdAt).getTime();
      const expires = created + 24 * 3600 * 1000;
      const diff = Math.max(0, expires - Date.now());

      if (diff === 0 && onExpireOrder) {
        onExpireOrder(order);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [isOpen, order, onExpireOrder]);

  // 2. Poll Midtrans Status while modal is open to verify real payment and preload Snap JS
  useEffect(() => {
    if (!isOpen || !order?.orderNumber) return;

    // Preload snap.js
    midtransService.ensureSnapLoaded().catch(() => {});

    // Check status immediately
    checkStatusFromMidtrans(false);

    // Auto-poll every 6 seconds for live update
    const poller = setInterval(() => {
      checkStatusFromMidtrans(false);
    }, 6000);

    return () => clearInterval(poller);
  }, [isOpen, order?.orderNumber]);

  /**
   * Strictly verify payment status via backend Midtrans verification
   */
  const checkStatusFromMidtrans = async (showFeedback = true) => {
    if (!order?.orderNumber) return;
    if (showFeedback) setIsChecking(true);

    try {
      const res = await midtransService.checkTransactionStatus(order.orderNumber);
      setMidtransStatus(res.status);

      if (res.isPaid) {
        setStatusMessage('Pembayaran berhasil diverifikasi oleh Midtrans! Pesanan Anda telah lunas.');
        setTimeout(() => {
          onSuccess(order);
        }, 800);
      } else if (res.status === 'not_found') {
        setStatusMessage('Transaksi terdaftar. Silakan pilih metode pembayaran dan selesaikan tagihan.');
      } else if (res.status === 'pending') {
        setStatusMessage('Menunggu penyelesaian pembayaran di bank / e-wallet Midtrans.');
      } else if (res.status === 'expire') {
        setStatusMessage('Waktu pembayaran telah kedaluwarsa.');
      } else if (res.status === 'cancel' || res.status === 'deny') {
        setStatusMessage(`Transaksi ditolak atau dibatalkan (${res.status}).`);
      } else {
        setStatusMessage(`Status transaksi Midtrans: ${res.status}`);
      }
    } catch {
      if (showFeedback) {
        setStatusMessage('Belum dapat menghubungi server verifikasi Midtrans.');
      }
    } finally {
      if (showFeedback) setIsChecking(false);
    }
  };

  const handleLaunchSnapPopup = async () => {
    setSnapError(null);
    if (!order?.snapToken) {
      setSnapError('Token Snap belum tersedia. Silakan buka halaman pembayaran resmi.');
      return;
    }

    const launched = await midtransService.launchSnap(order.snapToken, {
      onSuccess: (result) => {
        console.log('Midtrans Snap Client Callback Success:', result);
        setStatusMessage('Memverifikasi status pelunasan dengan server Midtrans...');
        // Strictly verify transaction on backend before completing order
        checkStatusFromMidtrans(true);
      },
      onPending: (result) => {
        console.log('Midtrans Snap Pending:', result);
        setStatusMessage('Instruksi pembayaran diterbitkan. Menunggu pembayaran Anda.');
        checkStatusFromMidtrans(true);
      },
      onError: (result) => {
        console.error('Midtrans Snap Error:', result);
        setSnapError('Terjadi kendala pada jendela Snap. Silakan buka Halaman Pembayaran di Tab Baru.');
      },
      onClose: () => {
        console.log('Pelanggan menutup popup Snap');
        checkStatusFromMidtrans(true);
      }
    });

    if (!launched) {
      if (order.snapRedirectUrl) {
        window.open(order.snapRedirectUrl, '_blank', 'noopener,noreferrer');
      } else {
        setSnapError('Gagal membuka popup Snap. Silakan gunakan tombol Buka Pembayaran Midtrans.');
      }
    }
  };

  const handleOpenMidtransPage = () => {
    const defaultUrl = midtransConfig.isProduction
      ? `https://app.midtrans.com/snap/v4/redirection/${order?.snapToken}`
      : `https://app.sandbox.midtrans.com/snap/v4/redirection/${order?.snapToken}`;

    const url = order?.snapRedirectUrl || (order?.snapToken ? defaultUrl : null);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 my-auto text-neutral-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">Midtrans Snap</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  midtransConfig.isProduction
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}>
                  {midtransConfig.isProduction ? 'Live Gateway' : 'Sandbox Gateway'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Gerbang Pembayaran Otomatis Daily Thread</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="bg-amber-50/80 border-b border-amber-200/70 p-3.5 sm:p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Batas Waktu Bayar: <strong className="font-mono text-amber-900 font-bold">{timeLeft}</strong></span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-neutral-600">ID Pesanan:</span>
              <span className="font-mono font-bold text-xs text-neutral-900">{order.orderNumber}</span>
              <button
                type="button"
                onClick={() => handleCopy(order.orderNumber)}
                className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                title="Salin Order ID"
              >
                {copiedOrderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Total Tagihan</span>
            <span className="text-base sm:text-lg font-extrabold text-neutral-950">
              Rp {(Number(order.grandTotal) || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4">

          {/* Primary Action 1: Official Midtrans Hosted Page */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Bayar Melalui Gateway Resmi Midtrans</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                Rekomendasi
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pilih metode lengkap di halaman Midtrans: <strong>QRIS (GoPay, OVO, Dana, ShopeePay, BCA Mobile)</strong>, 
              <strong> Virtual Account BCA / Mandiri / BNI / BRI / Permata</strong>, atau Kartu Kredit.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenMidtransPage}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Pembayaran Midtrans</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleLaunchSnapPopup}
                className="py-3 px-3.5 bg-white hover:bg-neutral-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Buka popup interaktif Snap di layar ini"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Buka Snap Popup</span>
              </button>
            </div>

            {snapError && (
              <p className="text-[11px] text-amber-700 bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                {snapError}
              </p>
            )}
          </div>

          {/* Status & Real Backend Verification Section */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Status Pembayaran di Midtrans:</span>
              <button
                type="button"
                onClick={() => checkStatusFromMidtrans(true)}
                disabled={isChecking}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Memverifikasi...' : 'Cek Status Sekarang'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-neutral-200 text-xs">
              {midtransStatus === 'settlement' || midtransStatus === 'capture' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
              )}
              <span className="text-neutral-700 font-medium">
                {statusMessage || 'Menunggu konfirmasi pelunasan dari sistem Midtrans...'}
              </span>
            </div>
          </div>

          {/* Sandbox Testing Guide Card - Only displayed when not in production */}
          {!midtransConfig.isProduction && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Petunjuk Pengujian Sandbox</span>
                </span>
                <a
                  href="https://simulator.sandbox.midtrans.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Simulator Midtrans</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Di mode Sandbox: Setelah membuka pembayaran Midtrans dan memilih <strong>Virtual Account</strong> atau <strong>QRIS</strong>, 
                salin kode tagihan lalu bayar di <strong>Simulator Midtrans</strong>. Sistem akan otomatis memverifikasi pelunasan secara real-time.
              </p>
            </div>
          )}

          {/* Modal Close / Cancel Actions */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
              >
                Bayar Nanti (Tutup)
              </button>

              {onCancelOrder && (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order, 'Dibatalkan sebelum pembayaran selesai')}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
                >
                  Batalkan Pesanan
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
