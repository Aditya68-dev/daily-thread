import React, { useState, useRef } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Package, Heart, Shield, Save, Camera, Upload, Trash2, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, setActiveView, addToast } = useStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [address, setAddress] = useState(user?.address || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [city, setCity] = useState(user?.city || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-sm font-semibold text-neutral-800">Silakan login untuk melihat profil akun Anda.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('error', 'Format Tidak Didukung', 'Silakan pilih file foto / gambar (JPG, PNG, WEBP).');
      return;
    }

    // Limit original file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 10MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize using canvas to max 400x400
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
          addToast('success', 'Foto Galeri Dipilih', 'Foto profil dari galeri berhasil dimuat! Jangan lupa klik Simpan Perubahan.');
        }
        setUploadingImage(false);
      };
      img.onerror = () => {
        setUploadingImage(false);
        addToast('error', 'Gagal Memproses Gambar', 'Foto tidak dapat diuraikan oleh browser.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadingImage(false);
      addToast('error', 'Gagal Membaca File', 'Terjadi kesalahan saat membaca file galeri.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      fullName,
      username,
      phone,
      avatar,
      address,
      district,
      city,
      postalCode
    });
    setSaving(false);
  };

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Account Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 uppercase tracking-tight mt-1">
            Profil Pengguna
          </h1>
        </div>

        {/* Quick Nav Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('orders')}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Riwayat Pesanan</span>
          </button>
          <button
            onClick={() => setActiveView('wishlist')}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: User Card & Avatar Picker (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 text-center space-y-4 shadow-sm">
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Avatar Preview with Camera Trigger */}
            <div className="relative inline-block group">
              <img
                src={avatar || user.avatar || AVATAR_OPTIONS[0]}
                alt={user.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto border-4 border-neutral-100 shadow group-hover:opacity-90 transition-opacity"
              />

              {/* Camera Hover / Mobile Touch Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute inset-0 m-auto w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 cursor-pointer shadow-lg"
                title="Pilih foto baru dari galeri"
              >
                <Camera className="w-5 h-5" />
              </button>

              {user.role === 'admin' && (
                <span className="absolute bottom-0 right-0 p-1.5 bg-amber-500 text-white rounded-full shadow">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-neutral-950">{user.fullName}</h2>
              <p className="text-xs text-neutral-500">@{user.username}</p>
              <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {user.role === 'admin' ? 'Administrator' : 'Member Daily Thread'}
              </span>
            </div>

            {/* Custom Gallery Upload Action */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {uploadingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses Foto...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto dari Galeri</span>
                  </>
                )}
              </button>

              {avatar && avatar.startsWith('data:image') && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="w-full py-1.5 px-3 text-neutral-500 hover:text-red-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Foto Kustom</span>
                </button>
              )}
            </div>

            {/* Avatar Preset Selector */}
            <div className="pt-3 border-t border-neutral-100 text-left">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 text-center">
                Atau Pilih Avatar Rekomendasi
              </span>
              <div className="flex justify-center gap-2">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatar === av ? 'border-neutral-950 scale-110 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt={`Option ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Edit Profile Form (8 Cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 pb-3 border-b border-neutral-100">
              Informasi Akun & Pengiriman
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email (Terkunci)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Alamat Rumah Lengkap</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="Kebayoran Baru"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Jakarta Selatan"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="12190"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
