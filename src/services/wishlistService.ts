import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { WishlistItem, Product } from '../types.ts';
import { productService } from './productService.ts';

function getWishlistKey(userId?: string) {
  return `dt_wishlist_${userId || 'guest'}`;
}

export const wishlistService = {
  async getWishlist(userId?: string): Promise<WishlistItem[]> {
    if (isSupabaseConfigured && userId) {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('*, product:products(*)')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            product: item.product,
            added_at: item.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase wishlist fetch error:', err);
      }
    }

    try {
      const raw = localStorage.getItem(getWishlistKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async toggleWishlist(userId: string | undefined, productId: string): Promise<{ wishlist: WishlistItem[]; isAdded: boolean }> {
    const current = await this.getWishlist(userId);
    const existingIndex = current.findIndex(w => w.productId === productId);

    let isAdded = false;
    let updated: WishlistItem[] = [];

    if (existingIndex > -1) {
      // Remove
      updated = current.filter(w => w.productId !== productId);
      isAdded = false;

      if (isSupabaseConfigured && userId) {
        try {
          await supabase.from('wishlist').delete().match({ user_id: userId, product_id: productId });
        } catch (err) {
          console.warn('Supabase wishlist remove error:', err);
        }
      }
    } else {
      // Add
      const { product } = await productService.getProductById(productId);
      if (product) {
        const item: WishlistItem = {
          id: `wish-${Date.now()}`,
          productId,
          product,
          added_at: new Date().toISOString()
        };
        updated = [item, ...current];
        isAdded = true;

        if (isSupabaseConfigured && userId) {
          try {
            await supabase.from('wishlist').insert({
              id: item.id,
              user_id: userId,
              product_id: productId
            });
          } catch (err) {
            console.warn('Supabase wishlist insert error:', err);
          }
        }
      } else {
        updated = current;
      }
    }

    localStorage.setItem(getWishlistKey(userId), JSON.stringify(updated));
    return { wishlist: updated, isAdded };
  }
};
