import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, Phone, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

interface AuthModalProps {
  onForgotPasswordClick?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onForgotPasswordClick }) => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    register, 
    addToast,
    setActiveView
  } = useStore();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(loginEmail.trim(), loginPassword.trim());
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      addToast('error', 'Validasi Gagal', 'Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }
    if (registerPassword.length < 6) {
      addToast('error', 'Validasi Gagal', 'Password minimal terdiri dari 6 karakter.');
      return;
    }
    setLoading(true);
    await register({
      fullName: fullName.trim(),
      username: username.trim(),
      email: registerEmail.trim(),
      phone: phone.trim(),
      password: registerPassword.trim(),
      confirmPassword: confirmPassword.trim()
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left border border-neutral-100">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 justify-center mb-1">
            <span className="font-extrabold text-xl tracking-tighter text-neutral-950 uppercase">
              DAILY THREAD
            </span>
            <span className="w-2 h-2 rounded-full bg-neutral-950 inline-block"></span>
          </div>
          <p className="text-xs text-neutral-500">Everyday Movement Fashion Store</p>
        </div>

        {/* Tabs: Login / Register */}
        <div className="flex rounded-xl bg-neutral-100 p-1 mb-6">
          <button
            onClick={() => setAuthModalTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            onClick={() => setAuthModalTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* LOGIN FORM */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email atau Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Masukkan email atau username Anda"
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(false);
                    setActiveView('reset-password');
                  }}
                  className="text-[11px] font-semibold text-neutral-600 hover:text-black hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                />
                <span>Ingat akun saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </button>

            <p className="text-center text-xs text-neutral-500 pt-2">
              Belum memiliki akun Daily Thread?{' '}
              <button
                type="button"
                onClick={() => setAuthModalTab('register')}
                className="font-bold text-neutral-900 hover:underline"
              >
                Daftar Akun
              </button>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Pratama"
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="alex_thread"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">No. WhatsApp *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                  />
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  placeholder="alex@dailythread.com"
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Konfirmasi *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
