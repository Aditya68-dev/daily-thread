export type ProductStatus = 'active' | 'in_stock' | 'out_of_stock' | 'archived';

export type ProductBadge = 'NEW' | 'SALE' | 'BEST SELLER' | 'TRENDING' | 'LIMITED' | 'OUT OF STOCK' | null;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brand_id?: string;
  category: string;
  category_id?: string;
  price: number;
  discount_price?: number | null;
  description: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  sku: string;
  rating: number;
  sold_count: number;
  status: ProductStatus;
  badge?: ProductBadge;
  created_at: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  discount_price?: number | null;
  size: string;
  color: string;
  quantity: number;
  image: string;
  stock: number;
  subtotal: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  added_at: string;
}

export type OrderStatus = 
  | 'Menunggu Pembayaran' 
  | 'Sudah Bayar' 
  | 'Sedang Dikirim' 
  | 'Selesai' 
  | 'Dibatalkan' 
  | 'Kadaluarsa'
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled';

export interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  grandTotal: number;
  status: OrderStatus;
  items: OrderItem[];
  whatsappText?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  paymentMethod?: string;
  paymentTime?: string;
  expiresAt?: string;
  trackingNumber?: string;
  courier?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelReason?: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'cart' | 'promo' | 'account' | 'stock';
  isRead: boolean;
  createdAt: string;
  orderNumber?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalSold: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: Order[];
  categoryDistribution: { category: string; count: number }[];
  salesByDay: { day: string; sales: number; orders: number }[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  rating?: number;
  badge?: string;
  sort?: 'cheapest' | 'highest' | 'newest' | 'bestseller';
  page?: number;
  limit?: number;
}
