import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { Product, Category, Brand, ProductFilters } from '../types.ts';
import { CATEGORIES, BRANDS, INITIAL_PRODUCTS, STORE_CONFIG } from '../data/initialData.ts';

const LOCAL_PRODUCTS_KEY = 'dt_local_products';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading local products', e);
  }
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving local products', e);
  }
}

export const productService = {
  getStoreConfig() {
    return {
      ...STORE_CONFIG,
      whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || STORE_CONFIG.whatsappNumber
    };
  },

  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data as Category[];
        }
      } catch (err) {
        console.warn('Supabase categories fetch fallback to initial data:', err);
      }
    }
    return CATEGORIES;
  },

  async getBrands(): Promise<Brand[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data as Brand[];
        }
      } catch (err) {
        console.warn('Supabase brands fetch fallback to initial data:', err);
      }
    }
    return BRANDS;
  },

  async getProducts(filters: ProductFilters = {}): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 24);

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('products').select('*', { count: 'exact' });

        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters.brand && filters.brand !== 'all') {
          query = query.eq('brand', filters.brand);
        }
        if (filters.badge && filters.badge !== 'all') {
          query = query.eq('badge', filters.badge);
        }
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.rating && filters.rating > 0) {
          query = query.gte('rating', filters.rating);
        }

        // Sorting
        if (filters.sort === 'cheapest') {
          query = query.order('price', { ascending: true });
        } else if (filters.sort === 'highest') {
          query = query.order('price', { ascending: false });
        } else if (filters.sort === 'bestseller') {
          query = query.order('sold_count', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (!error && data && data.length > 0) {
          const total = count || data.length;
          return {
            products: data as Product[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          };
        }
      } catch (err) {
        console.warn('Supabase products fetch fallback to local data:', err);
      }
    }

    // Local / Offline high-fidelity fallback
    let allProducts = getLocalProducts();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      allProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (filters.category && filters.category !== 'all') {
      allProducts = allProducts.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.brand && filters.brand !== 'all') {
      allProducts = allProducts.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    }
    if (filters.badge && filters.badge !== 'all') {
      allProducts = allProducts.filter(p => p.badge === filters.badge);
    }
    if (filters.size && filters.size !== 'all') {
      allProducts = allProducts.filter(p => p.sizes.includes(filters.size!));
    }
    if (filters.color && filters.color !== 'all') {
      allProducts = allProducts.filter(p => p.colors.some(c => c.name.toLowerCase() === filters.color!.toLowerCase()));
    }
    if (filters.minPrice !== undefined) {
      allProducts = allProducts.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      allProducts = allProducts.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.rating && filters.rating > 0) {
      allProducts = allProducts.filter(p => p.rating >= filters.rating!);
    }

    // Sort
    if (filters.sort === 'cheapest') {
      allProducts.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'highest') {
      allProducts.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'bestseller') {
      allProducts.sort((a, b) => b.sold_count - a.sold_count);
    } else {
      allProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const total = allProducts.length;
    const startIndex = (page - 1) * limit;
    const paginated = allProducts.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  },

  async getProductById(id: string): Promise<{ product: Product | null; related: Product[] }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          const product = data as Product;
          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('category', product.category)
            .neq('id', product.id)
            .limit(6);

          return {
            product,
            related: (relatedData || []) as Product[]
          };
        }
      } catch (err) {
        console.warn('Supabase single product fetch error, fallback:', err);
      }
    }

    const all = getLocalProducts();
    const product = all.find(p => p.id === id) || null;
    const related = product
      ? all.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6)
      : [];

    return { product, related };
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      name: productData.name || 'Untitled Product',
      slug: (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      brand: productData.brand || 'Daily Thread',
      category: productData.category || 'Cargo Pants',
      price: productData.price || 199000,
      discount_price: productData.discount_price || null,
      description: productData.description || 'Premium everyday lifestyle garment.',
      images: productData.images?.length ? productData.images : ['https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop'],
      sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
      colors: productData.colors || [{ name: 'Black', hex: '#111111' }, { name: 'White', hex: '#FFFFFF' }],
      stock: productData.stock || 25,
      sku: productData.sku || `DT-NEW-${Math.floor(100 + Math.random() * 900)}`,
      rating: 5.0,
      sold_count: 0,
      status: 'in_stock',
      badge: (productData.badge as any) || 'NEW',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
        if (!error && data) {
          return data as Product;
        }
      } catch (err) {
        console.warn('Supabase product insert error, saved locally:', err);
      }
    }

    const all = getLocalProducts();
    const updated = [newProduct, ...all];
    saveLocalProducts(updated);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as Product;
        }
      } catch (err) {
        console.warn('Supabase product update error, updated locally:', err);
      }
    }

    const all = getLocalProducts();
    const index = all.findIndex(p => p.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      saveLocalProducts(all);
      return all[index];
    }
    return null;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase product delete error:', err);
      }
    }

    const all = getLocalProducts();
    const filtered = all.filter(p => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  }
};
