import React, { useState } from 'react';
import { X, Chrome, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, addToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login('google', 'google');
    } catch (error: any) {
      addToast('error', 'Login Gagal', error?.message || 'Login Google tidak dapat diproses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const ok = await login(email.trim(), password);
      if (!ok) {
        setError('Email, password, atau hak akses admin tidak valid.');
      }
    } catch (err: any) {
      setError(err?.message || 'Email atau password admin tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left border border-neutral-100">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Tutup"
        >
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
            <p className="text-xs text-neutral-500 mt-1">Gunakan akun Google atau akun administrator.</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Chrome className="w-4 h-4" />
            {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </button>

          {!adminLoginOpen ? (
            <button
              type="button"
              onClick={() => {
                setAdminLoginOpen(true);
                setError('');
              }}
              className="w-full py-3 border border-neutral-200 hover:border-neutral-900 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Login Admin
            </button>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-3 border-t border-neutral-100 pt-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Email Admin</label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Login Admin'}
              </button>
            </form>
          )}

          <p className="text-center text-[11px] text-neutral-500">
            Akses dashboard hanya tersedia untuk akun Firebase yang memiliki role admin.
          </p>
        </div>
      </div>
    </div>
  );
};
