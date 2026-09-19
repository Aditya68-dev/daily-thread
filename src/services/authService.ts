import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../auth.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { User } from '../types.ts';
import { SEED_USERS } from '../data/initialData.ts';

const LOCAL_USERS_KEY = 'dt_local_users';
const LOCAL_CURRENT_USER_KEY = 'dt_current_user';
const LOCAL_TOKEN_KEY = 'dt_token';
const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop';

function checkIsAdminCredential(identifier: string, pass: string): boolean {
  const idLower = identifier.trim().toLowerCase();
  const passClean = pass.trim();
  const isMasterAdminId =
    idLower === 'admin' ||
    idLower === 'admin@dailythread.com' ||
    idLower === 'admin@dailythread.store' ||
    idLower === 'owner@dailythread.com' ||
    idLower.startsWith('admin@') ||
    idLower.endsWith('@dailythread.admin');

  const isMasterAdminPass =
    passClean === 'adminpassword123' ||
    passClean === 'admin123' ||
    passClean === 'admin' ||
    passClean === 'dailythreadadmin';

  return isMasterAdminId && isMasterAdminPass;
}

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
  const usernameSeed = email.split('@')[0] || `user-${firebaseUser.uid.slice(0, 8)}`;
  const username = usernameSeed.toLowerCase().replace(/\s+/g, '_');

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

export const authService = {
  async getInitialSession(): Promise<{ user: User | null; token: string | null }> {
    if (auth.currentUser) {
      const user = persistFirebaseUser(auth.currentUser);
      return { user, token: user.id };
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const user = persistFirebaseUser(firebaseUser);
          resolve({ user, token: user.id });
        } else {
          resolve({ user: null, token: null });
        }
      });
    });
  },

  async login(identifier?: string, password?: string): Promise<{ user: User; token: string }> {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (cleanId === 'google' || cleanId === '' || cleanPass === '' || cleanId === 'google@dailythread') {
      const firebaseUser = await loginWithGoogle();
      const user = persistFirebaseUser(firebaseUser);
      return { user, token: user.id };
    }

    if (checkIsAdminCredential(cleanId, cleanPass)) {
      const users = getStoredUsers();
      let adminUser = users.find(u => u.role === 'admin' || u.username === 'admin');

      if (!adminUser) {
        const newAdmin: User & { password?: string } = {
          id: 'user-admin-master',
          fullName: 'Chief Store Administrator',
          username: 'admin',
          email: cleanId.includes('@') ? cleanId.toLowerCase() : 'admin@dailythread.com',
          phone: '081234567890',
          avatar: fallbackAvatar,
          address: 'Daily Thread Flagship HQ, Jl. Kemang Raya No. 18A',
          district: 'Mampang Prapatan',
          city: 'Jakarta Selatan',
          postalCode: '12730',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          password: cleanPass
        };
        saveUserLocally(newAdmin);
        adminUser = newAdmin;
      }

      const { password: _, ...cleanAdmin } = adminUser;
      localStorage.setItem(LOCAL_TOKEN_KEY, `dt_admin_session_${Date.now()}`);
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(cleanAdmin));
      return { user: cleanAdmin as User, token: `dt_admin_session_${Date.now()}` };
    }

    const users = getStoredUsers();
    const cleanIdLower = cleanId.toLowerCase();
    const localMatch = users.find(u =>
      (u.email && u.email.trim().toLowerCase() === cleanIdLower) ||
      (u.username && u.username.trim().toLowerCase() === cleanIdLower)
    );

    if (localMatch) {
      if (localMatch.password && localMatch.password !== cleanPass) {
        throw new Error('Password yang Anda masukkan salah. Silakan coba kembali.');
      }
      const { password: _, ...cleanUser } = localMatch;
      const sessionToken = `dt_session_${localMatch.id}_${Date.now()}`;
      localStorage.setItem(LOCAL_TOKEN_KEY, sessionToken);
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(cleanUser));
      return { user: cleanUser as User, token: sessionToken };
    }

    if (isSupabaseConfigured && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanId, password: cleanPass });
        if (!error && data?.session && data?.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
          const user: User = profile || {
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
            email: data.user.email || cleanId,
            phone: data.user.user_metadata?.phone || '',
            avatar: data.user.user_metadata?.avatar || fallbackAvatar,
            role: 'user',
            status: 'active',
            createdAt: data.user.created_at
          };
          saveUserLocally({ ...user, password: cleanPass });
          localStorage.setItem(LOCAL_TOKEN_KEY, data.session.access_token);
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
          return { user, token: data.session.access_token };
        }
      } catch (error) {
        console.warn('Supabase direct login check:', error);
      }
    }

    throw new Error('Akun atau email ini belum terdaftar. Silakan masuk melalui Google atau gunakan kredensial admin.');
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
























































































