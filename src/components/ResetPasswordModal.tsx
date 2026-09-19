import React, { useState } from 'react';
import { KeyRound, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { authService } from '../services/authService.ts';

export const ResetPasswordModal: React.FC = () => {
  const { setActiveView, addToast, setAuthModalOpen, setAuthModalTab } = useStore();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.requestPasswordReset(email);
      setLoading(false);
      if (data.success) {
        addToast('success', 'Token Terkirim', data.message);
        if (data.resetToken) {
          setToken(data.resetToken);
        }
        setStep('reset');
      } else {
        addToast('error', 'Gagal', data.message || 'Email tidak terdaftar.');
      }
    } catch (err: any) {
      setLoading(false);
      addToast('error', 'Kesalahan', err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('error', 'Validasi Gagal', 'Konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'Validasi Gagal', 'Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.resetPassword(token, newPassword);
      setLoading(false);
      if (data.success) {
        addToast('success', 'Sukses', data.message);
        setStep('success');
      } else {
        addToast('error', 'Gagal Reset', data.message || 'Token tidak valid.');
      }
    } catch (err: any) {
      setLoading(false);
      addToast('error', 'Kesalahan', err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-left">
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 uppercase tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Pulihkan akses akun Daily Thread Anda dengan aman
          </p>
        </div>

        {/* STEP 1: Request Reset Token */}
        {step === 'request' && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Masukkan alamat email yang terdaftar pada akun Anda. Sistem kami akan mengirimkan token verifikasi reset password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Alamat Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@dailythread.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Mengirim...' : 'Kirim Token Reset'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                }}
                className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Input Token & New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
              Token verifikasi telah digenerate. Masukkan token dan kata sandi baru Anda di bawah.
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Token Reset Verifikasi</label>
              <input
                type="text"
                required
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="dt-reset-..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Password Baru</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan Password...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Password Berhasil Diperbarui!
            </h3>
            <p className="text-xs text-neutral-500">
              Kata sandi Anda telah dienkripsi dengan standar hash tinggi. Silakan masuk menggunakan kata sandi baru Anda.
            </p>
            <button
              onClick={() => {
                setActiveView('home');
                setAuthModalTab('login');
                setAuthModalOpen(true);
              }}
              className="w-full py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Masuk Sekarang
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
