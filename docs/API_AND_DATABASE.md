# Dokumentasi Arsitektur Database & REST API - Daily Thread

Daily Thread adalah platform e-commerce fashion modern yang didesain khusus untuk remaja dan anak muda dengan katalog 250+ produk streetwear & casual apparel.

---

## 1. Arsitektur Relasi Database (ERD)

Database menggunakan model relasional dengan integritas data dan relasi antar tabel sebagai berikut:

```text
[users] 1 --- ∞ [orders] 1 --- ∞ [order_items] ∞ --- 1 [products]
   |                 |
   + --- 1 [cart] ---+--- ∞ [cart_items] ∞ --- 1 [products]
   |
   + --- ∞ [wishlist] ∞ --- 1 [products]
   |
   + --- ∞ [addresses]
   |
   + --- ∞ [notifications]
   |
   + --- 1 [admins]

[categories] 1 --- ∞ [products]
[brands]     1 --- ∞ [products]
[products]   1 --- ∞ [product_images]
[products]   1 --- ∞ [product_sizes]
[products]   1 --- ∞ [product_colors]
```

### Penjelasan Tabel:
1. **users**: Menyimpan akun pengguna, password terenkripsi bcrypt (`password_hash`), nomor WhatsApp, alamat, dan role.
2. **admins**: Hak akses administratif khusus untuk pengelolaan produk dan status pesanan.
3. **addresses**: Buku alamat pengiriman tersimpan untuk kemudahan proses checkout.
4. **categories**: 18 Kategori busana lengkap (Cargo Pants, Salvage Denim, Oversized T-Shirt, Varsity Jacket, dll).
5. **brands**: Daftar brand terkurasi (Daily Thread, Levi's, Dickies, Carhartt, Stussy, Uniqlo, dll).
6. **products**: Menyimpan 250+ data produk dengan SKU, harga, harga diskon, stok real-time, rating, jumlah terjual, dan status ketersediaan.
7. **product_images**: Galeri multi-foto untuk setiap produk.
8. **product_sizes & product_colors**: Varian ukuran (S, M, L, XL, 28, 30, dll) dan palet warna.
9. **cart & cart_items**: Menyimpan isi keranjang belanja user secara persisten.
10. **wishlist**: Daftar produk favorit user.
11. **orders & order_items**: Rekap pesanan checkout, ongkos kirim, rincian produk, dan pesan format WhatsApp.
12. **notifications**: Sistem pesan notifikasi in-app (promo, status pesanan, update akun).
13. **password_resets**: Token unik bertenggang waktu (1 jam) untuk pergantian kata sandi yang aman.

---

## 2. Dokumentasi REST API

### A. Autentikasi & Akun
- **POST `/api/auth/register`**
  - **Body**: `{ fullName, username, email, phone, password, confirmPassword }`
  - **Respons**: `{ user, token, message }` (Status 201)
- **POST `/api/auth/login`**
  - **Body**: `{ email, password }`
  - **Respons**: `{ user, token, message }` (Status 200)
- **POST `/api/auth/logout`**
  - **Header**: `Authorization: Bearer <token>`
  - **Respons**: `{ message }`
- **GET `/api/auth/me`**
  - **Header**: `Authorization: Bearer <token>`
  - **Respons**: `{ user }`
- **PUT `/api/auth/profile`**
  - **Body**: `{ fullName, username, phone, avatar, address, district, city, postalCode }`
  - **Respons**: `{ user, message }`
- **POST `/api/auth/forgot-password`**
  - **Body**: `{ email }`
  - **Respons**: `{ message, resetToken, resetUrl }`
- **POST `/api/auth/reset-password`**
  - **Body**: `{ token, newPassword, confirmPassword }`
  - **Respons**: `{ message }`

### B. Katalog Produk
- **GET `/api/products`**
  - **Query Params**: `search`, `category`, `brand`, `minPrice`, `maxPrice`, `size`, `color`, `rating`, `badge`, `sort` (`cheapest` | `highest` | `newest` | `bestseller`), `page`, `limit`
  - **Respons**: `{ products: Product[], total, page, totalPages }`
- **GET `/api/products/:id`**
  - **Respons**: `{ product: Product, related: Product[] }`
- **GET `/api/categories`**
  - **Respons**: `Category[]` (dengan jumlah `productCount`)
- **GET `/api/brands`**
  - **Respons**: `Brand[]`

### C. Keranjang Belanja (Cart)
- **GET `/api/cart`**
  - **Header**: `Authorization: Bearer <token>`
  - **Respons**: `CartItem[]`
- **POST `/api/cart`**
  - **Body**: `{ productId, size, color, quantity }`
  - **Respons**: `{ cart, message }`
- **PUT `/api/cart/:itemId`**
  - **Body**: `{ quantity }`
  - **Respons**: `CartItem[]`
- **DELETE `/api/cart/:itemId`**
  - **Respons**: `CartItem[]`
- **DELETE `/api/cart`**
  - **Respons**: `[]`

### D. Wishlist
- **GET `/api/wishlist`**
  - **Respons**: `WishlistItem[]`
- **POST `/api/wishlist/toggle`**
  - **Body**: `{ productId }`
  - **Respons**: `{ wishlist, isAdded }`

### E. Checkout & Pesanan
- **POST `/api/orders`**
  - **Body**: `{ customerName, customerPhone, customerEmail, shippingAddress, district, city, province, postalCode, notes, shippingMethod, shippingCost, items: [{ productId, size, color, quantity }] }`
  - **Respons**: `{ order: Order, whatsappUrl: string, message: string }` (Status 201)
- **GET `/api/orders`**
  - **Respons**: `Order[]`
- **GET `/api/orders/:id`**
  - **Respons**: `Order`

### F. Notifikasi
- **GET `/api/notifications`**
  - **Respons**: `NotificationItem[]`
- **PUT `/api/notifications/read-all`**
  - **Respons**: `{ message }`

### G. Admin Dashboard
- **GET `/api/admin/stats`**
  - **Respons**: `{ totalProducts, totalUsers, totalOrders, totalSold, totalRevenue, pendingOrders, recentOrders, categoryDistribution, salesByDay }`
- **GET `/api/admin/products`**
- **POST `/api/admin/products`**
- **PUT `/api/admin/products/:id`**
- **DELETE `/api/admin/products/:id`**
- **GET `/api/admin/orders`**
- **PUT `/api/admin/orders/:id/status`**
- **GET `/api/admin/users`**

---

## 3. Akun Demo Bawaan
- **User Demo:**
  - Email: `alex@dailythread.com`
  - Password: `password123`
- **Admin Demo:**
  - Email: `admin@dailythread.com`
  - Password: `admin123`
