import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../src/auth.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { User } from '../types.ts';
import { SEED_USERS } from '../data/initialData.ts';

const LOCAL_USERS_KEY = 'dt_local_users';
const LOCAL_CURRENT_USER_KEY = 'dt_current_user';
const LOCAL_TOKEN_KEY = 'dt_token';

const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

function localUsers(): (User & { password?: string })[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch { /* use seed */ }
  const defaults = [{ ...SEED_USERS[0], password: 'password123' }];
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveLocalUser(user: User) {
  const users = localUsers();
  const index = users.findIndex(item => item.id === user.id || item.email === user.email);
  if (index >= 0) users[index] = { ...users[index], ...user };
  else users.push(user);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function firebaseUserToAppUser(firebaseUser: any): User {
  const email = firebaseUser.email || '';
  const fullName = firebaseUser.displayName || email.split('@')[0] || 'User';
  const username = email.split('@')[0] || `user-${firebaseUser.uid.slice(0, 8)}`;
  return {
    id: firebaseUser.uid,
    fullName,
    username,
    email,
    phone: firebaseUser.phoneNumber || '',
    avatar: firebaseUser.photoURL || fallbackAvatar,
    role: 'user',
    status: 'active',
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString()
  };
}

function persistFirebaseUser(firebaseUser: any) {
  const user = firebaseUserToAppUser(firebaseUser);
  saveLocalUser(user);
  localStorage.setItem(LOCAL_TOKEN_KEY, firebaseUser.uid);
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

let firebaseListenerStarted = false;
function ensureFirebaseListener() {
  if (firebaseListenerStarted) return;
  firebaseListenerStarted = true;
  onAuthStateChanged(auth, firebaseUser => {
    if (firebaseUser) persistFirebaseUser(firebaseUser);
    else {
      localStorage.removeItem(LOCAL_TOKEN_KEY);
      localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    }
  });
}

export const authService = {
  async getInitialSession(): Promise<{ user: User | null; token: string | null }> {
    ensureFirebaseListener();
    if (auth.currentUser) {
      const user = persistFirebaseUser(auth.currentUser);
      return { user, token: auth.currentUser.uid };
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
            email: session.user.email || '', phone: session.user.user_metadata?.phone || '',
            avatar: session.user.user_metadata?.avatar || fallbackAvatar,
            role: 'user', status: 'active', createdAt: session.user.created_at
          };
          return { user, token: session.access_token };
        }
      } catch (error) { console.warn('Supabase session check failed:', error); }
    }
    const rawUser = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    const token = localStorage.getItem(LOCAL_TOKEN_KEY);
    return rawUser && token ? { user: JSON.parse(rawUser), token } : { user: null, token: null };
  },

  async login(): Promise<{ user: User; token: string }> {
    ensureFirebaseListener();
    const firebaseUser = await loginWithGoogle();
    const user = persistFirebaseUser(firebaseUser);
    return { user, token: firebaseUser.uid };
  },

  async register(): Promise<{ user: User; token: string }> {
    throw new Error('Registrasi manual dinonaktifkan. Gunakan Login dengan Google.');
  },

  async logout(): Promise<void> {
    await logoutUser();
    if (isSupabaseConfigured) {
      try { await supabase.auth.signOut(); } catch (error) { console.warn('Supabase logout error:', error); }
    }
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    if (isSupabaseConfigured) {
      try {
        const { data: updated, error } = await supabase.from('users').update(data).eq('id', userId).select().single();
        if (!error && updated) {
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updated));
          return updated as User;
        }
      } catch (error) { console.warn('Profile update error:', error); }
    }
    const current = JSON.parse(localStorage.getItem(LOCAL_CURRENT_USER_KEY) || '{}');
    const updated = { ...current, ...data, id: userId } as User;
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updated));
    saveLocalUser(updated);
    return updated;
  },

  async requestPasswordReset(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Reset password tidak tersedia karena login menggunakan Google.' };
  },

  async resetPassword(): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Reset password tidak tersedia karena login menggunakan Google.' };
  }
};
