import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../auth.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { User } from '../types.ts';
import { SEED_USERS } from '../data/initialData.ts';

const LOCAL_USERS_KEY = 'dt_local_users';
const LOCAL_CURRENT_USER_KEY = 'dt_current_user';
const LOCAL_TOKEN_KEY = 'dt_token';
const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

function getStoredUsers(): (User & { password?: string })[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (error) {
    console.warn('Failed to read stored users:', error);
  }
  const defaults = [{ ...SEED_USERS[0], password: 'password123' }];
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveUserLocally(user: User & { password?: string }) {
  try {
    const users = getStoredUsers();
    const idx = users.findIndex(item => item.id === user.id || item.email === user.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('Failed to save user locally:', error);
  }
}

function toAppUser(firebaseUser: any): User {
  const email = firebaseUser.email || '';
  const name = firebaseUser.displayName || email.split('@')[0] || 'User';
  const username = (name.toLowerCase().replace(/\s+/g, '_') || email.split('@')[0] || `user-${firebaseUser.uid.slice(0, 8)}`);

  return {
    id: firebaseUser.uid,
    fullName: name,
    username,
    email,
    phone: firebaseUser.phoneNumber || '',
    avatar: firebaseUser.photoURL || fallbackAvatar,
    role: 'user',
    status: 'active',
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString()
  };
}

function persistFirebaseUser(firebaseUser: any): User {
  const user = toAppUser(firebaseUser);
  saveUserLocally(user);
  localStorage.setItem(LOCAL_TOKEN_KEY, firebaseUser.uid);
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

async function waitForFirebaseUser(): Promise<User | null> {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      resolve(firebaseUser ? persistFirebaseUser(firebaseUser) : null);
    });
  });
}

export const authService = {
  async getInitialSession(): Promise<{ user: User | null; token: string | null }> {
    if (auth.currentUser) {
      const user = persistFirebaseUser(auth.currentUser);
      return { user, token: user.id };
    }

    try {
      const firebaseUser = await waitForFirebaseUser();
      if (firebaseUser) {
        return { user: firebaseUser, token: firebaseUser.id };
      }
    } catch (error) {
      console.warn('getInitialSession Firebase fallback error:', error);
    }

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          const user: User = profile || {
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            phone: session.user.user_metadata?.phone || '',
            avatar: session.user.user_metadata?.avatar || fallbackAvatar,
            role: 'user',
            status: 'active',
            createdAt: session.user.created_at
          };
          return { user, token: session.access_token };
        }
      } catch (error) {
        console.warn('Supabase session check fallback:', error);
      }
    }

    const rawUser = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    const token = localStorage.getItem(LOCAL_TOKEN_KEY);
    if (rawUser && token) {
      try {
        return { user: JSON.parse(rawUser), token };
      } catch {
        return { user: null, token: null };
      }
    }

    return { user: null, token: null };
  },

  async login(_identifier?: string, _password?: string): Promise<{ user: User; token: string }> {
    const firebaseUser = await loginWithGoogle();
    const user = persistFirebaseUser(firebaseUser);
    return { user, token: user.id };
  },

  async register(): Promise<{ user: User; token: string }> {
    throw new Error('Registrasi manual dinonaktifkan. Gunakan Login dengan Google.');
  },

  async logout(): Promise<void> {
    await logoutUser();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase logout warning:', error);
      }
    }
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const rawUser = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    const current = rawUser ? JSON.parse(rawUser) : null;
    const updated = { ...(current || {}), ...data, id: userId } as User;

    if (isSupabaseConfigured && current?.email) {
      try {
        const { data: supabaseUser, error } = await supabase
          .from('users')
          .upsert({ ...updated, id: userId, email: updated.email || current.email })
          .select()
          .single();

        if (!error && supabaseUser) {
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(supabaseUser));
          saveUserLocally(supabaseUser as User);
          return supabaseUser as User;
        }
      } catch (error) {
        console.warn('Supabase profile sync warning:', error);
      }
    }

    saveUserLocally(updated);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  async requestPasswordReset(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Reset password tidak tersedia karena login menggunakan Google.' };
  },

  async resetPassword(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Reset password tidak tersedia karena login menggunakan Google.' };
  }
};
