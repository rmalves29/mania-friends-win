import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string, whatsapp: string, referredBy?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca o perfil; se a conta existe mas o perfil sumiu, recria automaticamente
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) console.error('Profile fetch error:', error);
      if (data) {
        setProfile(data as Profile);
        return;
      }
      if (error) {
        setProfile(null);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || authUser.id !== userId) {
        setProfile(null);
        return;
      }
      const meta = (authUser.user_metadata || {}) as Record<string, string>;
      const email = authUser.email || '';
      const { data: refCode } = await (supabase as any).rpc('generate_referral_code');
      const { data: created, error: insertError } = await (supabase as any)
        .from('profiles')
        .insert({
          id: userId,
          name: meta.name || email.split('@')[0],
          email,
          whatsapp: meta.whatsapp || null,
          referral_code: refCode || email.split('@')[0].toUpperCase().slice(0, 6) + Math.floor(Math.random() * 1000),
        })
        .select('*')
        .maybeSingle();
      if (insertError) console.error('Profile auto-create error:', insertError);
      setProfile((created as Profile) || null);
    } catch (err) {
      console.error('Profile fetch exception:', err);
    }
  };

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any).rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      if (error) console.error('Admin check error:', error);
      setIsAdmin(!!data);
    } catch (err) {
      console.error('Admin check exception:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as the sole source of truth
    // getSession() can hang due to navigator.locks issues
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Use setTimeout to avoid deadlock inside onAuthStateChange callback
        setTimeout(async () => {
          if (!mounted) return;
          await fetchProfile(currentUser.id);
          await checkAdmin(currentUser.id);
          if (mounted) setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Safety timeout: if onAuthStateChange never fires, stop loading
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, whatsapp: string, referredBy?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name, whatsapp } }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Erro ao criar conta');

    const { data: refCode } = await (supabase as any).rpc('generate_referral_code');

    // Use SECURITY DEFINER RPC to look up referrer (bypasses RLS)
    let referrerId: string | null = null;
    if (referredBy) {
      const { data: rid } = await (supabase as any).rpc('lookup_referrer_id', { _referral_code: referredBy });
      if (rid) referrerId = rid;
    }

    const { error: profileError } = await (supabase as any).from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      whatsapp,
      referral_code: refCode || email.split('@')[0].toUpperCase().slice(0, 6),
      referred_by: referrerId,
    });
    if (profileError) throw profileError;

    if (referrerId) {
      await (supabase as any).rpc('increment_referral_count', { referrer_id: referrerId });
    }

    // Fetch profile immediately after insert to avoid race condition
    await fetchProfile(authData.user.id);
    await checkAdmin(authData.user.id);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
