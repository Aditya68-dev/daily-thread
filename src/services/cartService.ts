import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { CartItem } from '../types.ts';

function getCartStorageKey(userId?: string) {
  return `dt_cart_${userId || 'guest'}`;
}

export const cartService = {
  async getCart(userId?: string): Promise<CartItem[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*, product:products(*)')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product?.name || 'Product',
            brand: item.product?.brand || 'Daily Thread',
            price: item.product?.discount_price || item.product?.price || 0,
            discount_price: item.product?.discount_price,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            image: item.product?.images?.[0] || 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop',
            stock: item.product?.stock || 20,
            subtotal: (item.product?.discount_price || item.product?.price || 0) * item.quantity
          }));
        }
      } catch (err) {
        console.warn('Supabase cart fetch fallback:', err);
      }
    }

    try {
      const raw = localStorage.getItem(getCartStorageKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async addToCart(userId: string | undefined, item: CartItem): Promise<CartItem[]> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('cart_items').upsert({
          id: item.id,
          user_id: userId,
          product_id: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        });
      } catch (err) {
        console.warn('Supabase cart item save error:', err);
      }
    }

    const cart = await this.getCart(userId);
    const existingIndex = cart.findIndex(
      i => i.productId === item.productId && i.size === item.size && i.color === item.color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].subtotal = cart[existingIndex].price * cart[existingIndex].quantity;
    } else {
      cart.unshift(item);
    }

    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(cart));
    return cart;
  },

  async updateQty(userId: string | undefined, itemId: string, quantity: number): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    const item = cart.find(i => i.id === itemId);
    if (!item) return cart;

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    item.quantity = quantity;
    item.subtotal = item.price * quantity;

    if (isSupabaseConfigured && userId) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
      } catch (err) {
        console.warn('Supabase cart update qty error:', err);
      }
    }

    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(cart));
    return cart;
  },

  async removeItem(userId: string | undefined, itemId: string): Promise<CartItem[]> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('cart_items').delete().eq('id', itemId);
      } catch (err) {
        console.warn('Supabase cart delete error:', err);
      }
    }

    const cart = await this.getCart(userId);
    const filtered = cart.filter(i => i.id !== itemId);
    localStorage.setItem(getCartStorageKey(userId), JSON.stringify(filtered));
    return filtered;
  },

  async clearCart(userId: string | undefined): Promise<void> {
    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase clear cart error:', err);
      }
    }

    localStorage.removeItem(getCartStorageKey(userId));
  }
};
