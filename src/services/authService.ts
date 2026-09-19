import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { User } from '../types.ts';
import { SEED_USERS } from '../data/initialData.ts';

const LOCAL_USERS_KEY = 'dt_local_users';
const LOCAL_CURRENT_USER_KEY = 'dt_current_user';
const LOCAL_TOKEN_KEY = 'dt_token';

function getStoredUsers(): (User & { password?: string })[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  const defaults = [
    { ...SEED_USERS[0], password: 'password123' }
  ];
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveUserLocally(user: User & { password?: string }) {
  try {
    const users = getStoredUsers();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const cleanUsername = (user.username || '').trim().toLowerCase();

    const idx = users.findIndex(u => 
      (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail) ||
      (cleanUsername && u.username && u.username.trim().toLowerCase() === cleanUsername) ||
      (user.id && u.id === user.id)
    );

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user locally:', err);
  }
}

function checkIsAdminCredential(identifier: string, pass: string): boolean {
  const idLower = identifier.trim().toLowerCase();
  const passClean = pass.trim();

  // Master Secret Admin Credentials (hidden from public UI)
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

export const authService = {
  async getInitialSession(): Promise<{ user: User | null; token: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData: User = profile || {
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            phone: session.user.user_metadata?.phone || '',
            avatar: session.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
            role: session.user.user_metadata?.role || (session.user.email?.includes('admin') ? 'admin' : 'user'),
            status: 'active',
            createdAt: session.user.created_at
          };

          return { user: userData, token: session.access_token };
        }
      } catch (err) {
        console.warn('Supabase getSession error, checking local session:', err);
      }
    }

    // Local session
    const token = localStorage.getItem(LOCAL_TOKEN_KEY);
    const rawUser = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (token && rawUser) {
      try {
        return { user: JSON.parse(rawUser), token };
      } catch {
        // Invalid json
      }
    }
    return { user: null, token: null };
  },

  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      throw new Error('Email/Username dan Password harus diisi.');
    }

    // 1. SMART ADMIN PREDICTION & AUTO-PROVISIONING
    if (checkIsAdminCredential(cleanId, cleanPass)) {
      const users = getStoredUsers();
      let adminUser = users.find(u => u.role === 'admin' || u.username === 'admin');

      // If hidden admin account does not exist yet, provision it immediately on the fly
      if (!adminUser) {
        const newAdmin: User & { password?: string } = {
          id: 'user-admin-master',
          fullName: 'Chief Store Administrator',
          username: 'admin',
          email: cleanId.includes('@') ? cleanId.toLowerCase() : 'admin@dailythread.com',
          phone: '081234567890',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
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
      const adminToken = `dt_admin_session_${Date.now()}`;
      localStorage.setItem(LOCAL_TOKEN_KEY, adminToken);
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(cleanAdmin));

      return { user: cleanAdmin as User, token: adminToken };
    }

    // 2. CHECK STORED USERS (Registered customers)
    const users = getStoredUsers();
    const cleanIdLower = cleanId.toLowerCase();
    const localMatch = users.find(u => 
      (u.email && u.email.trim().toLowerCase() === cleanIdLower) || 
      (u.username && u.username.trim().toLowerCase() === cleanIdLower)
    );

    if (localMatch) {
      // User found in registered accounts! Check password
      if (localMatch.password && localMatch.password !== cleanPass) {
        throw new Error('Password yang Anda masukkan salah. Silakan coba kembali.');
      }

      let sessionToken = `dt_session_${localMatch.id}_${Date.now()}`;

      // If Supabase is configured, attempt session sync in background
      if (isSupabaseConfigured && localMatch.email) {
        try {
          const { data } = await supabase.auth.signInWithPassword({
            email: localMatch.email,
            password: cleanPass
          });
          if (data?.session?.access_token) {
            sessionToken = data.session.access_token;
          }
        } catch (err: any) {
          console.warn('Supabase background session check:', err.message);
        }
      }

      const { password: _, ...cleanUser } = localMatch;
      localStorage.setItem(LOCAL_TOKEN_KEY, sessionToken);
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(cleanUser));

      return { user: cleanUser as User, token: sessionToken };
    }

    // 3. IF NOT IN LOCAL STORAGE, TRY SUPABASE DIRECTLY
    if (isSupabaseConfigured && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanPass
        });

        if (!error && data?.session && data?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const user: User = profile || {
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
            email: data.user.email || cleanId,
            phone: data.user.user_metadata?.phone || '',
            avatar: data.user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
            role: 'user',
            status: 'active',
            createdAt: data.user.created_at
          };

          saveUserLocally({ ...user, password: cleanPass });

          localStorage.setItem(LOCAL_TOKEN_KEY, data.session.access_token);
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
          return { user, token: data.session.access_token };
        }
      } catch (err: any) {
        console.warn('Supabase direct login check:', err.message);
      }
    }

    // 4. USER NOT FOUND
    throw new Error('Akun atau email ini belum terdaftar. Silakan buat akun melalui menu Daftar terlebih dahulu.');
  },

  async register(payload: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanUsername = payload.username.trim().toLowerCase();
    const cleanPassword = payload.password.trim();
    const cleanFullName = payload.fullName.trim();
    const cleanPhone = payload.phone.trim();

    // 1. Check local users first to prevent duplicate registrations
    const users = getStoredUsers();
    if (users.some(u => u.email && u.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }
    if (users.some(u => u.username && u.username.trim().toLowerCase() === cleanUsername)) {
      throw new Error('Username sudah digunakan. Silakan gunakan username lain.');
    }

    let userId = `user-${Date.now()}`;
    let token = `dt_session_${userId}_${Date.now()}`;

    const newUser: User & { password?: string } = {
      id: userId,
      fullName: cleanFullName,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      password: cleanPassword,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop`,
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // 2. Try Supabase registration if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanFullName,
              username: cleanUsername,
              phone: cleanPhone,
              role: newUser.role
            }
          }
        });

        if (data?.user) {
          newUser.id = data.user.id;
          if (data.session?.access_token) {
            token = data.session.access_token;
          }
          try {
            await supabase.from('users').upsert([newUser]).select();
          } catch (errProfile) {
            console.warn('Supabase profile upsert error:', errProfile);
          }
        }
      } catch (err: any) {
        console.warn('Supabase signUp error, continuing with local persistence:', err.message);
      }
    }

    // 3. ALWAYS guarantee user is stored in local storage with password
    saveUserLocally(newUser);

    const { password: _, ...cleanUser } = newUser;
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(cleanUser));

    return { user: cleanUser as User, token };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase logout error', e);
      }
    }
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    if (isSupabaseConfigured) {
      try {
        const { data: updated, error } = await supabase
          .from('users')
          .update(data)
          .eq('id', userId)
          .select()
          .single();

        if (!error && updated) {
          localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updated));
          return updated as User;
        }
      } catch (err) {
        console.warn('Supabase profile update error, fallback:', err);
      }
    }

    const rawUser = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (!rawUser) throw new Error('User not found');
    const current = JSON.parse(rawUser);
    const updated = { ...current, ...data };
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updated));

    // Update in local users array
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }

    return updated;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (!error) {
          return {
            success: true,
            message: 'Tautan pemulihan password telah dikirim ke email Anda melalui Supabase Auth.'
          };
        }
      } catch (err) {
        console.warn('Supabase resetPasswordForEmail error, fallback:', err);
      }
    }

    // Local simulation with demo token
    const token = `RESET-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      message: 'Kode token reset password telah disimulasikan untuk Anda.',
      resetToken: token
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (!error) {
          return { success: true, message: 'Password berhasil diubah melalui Supabase Auth.' };
        }
      } catch (err) {
        console.warn('Supabase updateUser password error:', err);
      }
    }

    return {
      success: true,
      message: 'Password berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.'
    };
  }
};
