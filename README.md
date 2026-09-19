# Daily Thread — Modern Youth Fashion E-Commerce

Daily Thread adalah platform e-commerce fashion modern, clean, dan premium yang dirancang khusus untuk remaja dan anak muda. Menjual berbagai macam kategori seperti Cargo Pants, Selvedge Denim, Work Pants, Oversized T-Shirt, Flannel Shirt, Work Jacket, Varsity Jacket, Hoodie, dan aksesoris lainnya dengan **250+ katalog produk terkurasi**.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Motion
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage) + Client-side Fallback Persistence
- **Deployment**: Siap langsung di-deploy ke **Vercel** (Standard SPA Vite static build tanpa custom Node server)

---

## 📁 Struktur Project

```text
src/
├── assets/         # Static asset definitions & branding
├── components/     # UI components (Navbar, Footer, ProductCard, Views)
├── contexts/       # Global Store state context
├── data/           # 250+ initial product catalog & store config
├── hooks/          # Custom hooks (useStore)
├── lib/            # Supabase client initialization
├── pages/          # Page barrels
├── services/       # Supabase service layer (auth, product, cart, order, admin)
├── types/          # TypeScript declarations & interfaces
├── App.tsx         # Main application coordinator
└── main.tsx        # Application root entry point
```

---

## ⚙️ Environment Variables

Salin `.env.example` ke `.env` dan sesuaikan nilainya:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WhatsApp Store Admin Number (Format internasional tanpa simbol +, contoh: 6281234567890)
VITE_WHATSAPP_NUMBER=6281234567890
```

*Catatan:* Jika Supabase belum dikonfigurasi, aplikasi tetap berjalan 100% normal menggunakan data lokal lengkap (260 produk dummy, cart, wishlist, dan demo authentication).

---

## 🗄️ Setup Database Supabase

Jika ingin menghubungkan ke Supabase sungguhan:
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Jalankan script SQL yang ada di file `supabase/schema.sql`.
4. Masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ke konfigurasi environment (di Vercel atau `.env`).

---

## 🔑 Akun Demo

- **Admin Account**:
  - Email: `admin@dailythread.com`
  - Password: `adminpassword123`
  - Akses: Admin Dashboard (Manajemen Produk, Status Pesanan, Statistik Penjualan)

- **User Demo**:
  - Email: `alex@dailythread.com`
  - Password: `password123`

---

## 🚢 Deploy ke Vercel

1. Push repository ke GitHub.
2. Buka [Vercel](https://vercel.com) dan pilih **Import Project**.
3. Vercel akan otomatis mendeteksi framework **Vite**.
4. Masukkan Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`).
5. Klik **Deploy**!
