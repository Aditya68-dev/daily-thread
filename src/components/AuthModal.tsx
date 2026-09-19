import React, { useState } from 'react';
import { X, Chrome } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, addToast } = useStore();
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // The auth service uses Firebase signInWithPopup and the Firebase UID
      // becomes the stable identity for cart, wishlist, and orders.
      await login('', '');
    } catch (error: any) {
      addToast('error', 'Login Gagal', error?.message || 'Login Google tidak dapat diproses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left border border-neutral-100">
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors" aria-label="Tutup">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 justify-center mb-1">
            <span className="font-extrabold text-xl tracking-tighter text-neutral-950 uppercase">DAILY THREAD</span>
            <span className="w-2 h-2 rounded-full bg-neutral-950 inline-block" />
          </div>
          <p className="text-xs text-neutral-500">Everyday Movement Fashion Store</p>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-950">Masuk ke Daily Thread</h2>
            <p className="text-xs text-neutral-500 mt-1">Gunakan akun Google untuk melanjutkan.</p>
          </div>
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
            <Chrome className="w-4 h-4" />
            {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </button>
          <p className="text-center text-[11px] text-neutral-500">Registrasi manual tidak diperlukan. Akun dibuat otomatis oleh Firebase saat pertama kali login.</p>
        </div>
      </div>
    </div>
  );
};
