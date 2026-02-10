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

  const fetchProfile = async (userId: string) => {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data as Profile | null);
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await (supabase as any).rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    setIsAdmin(!!data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        await checkAdmin(currentUser.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Ensure loading is resolved even if onAuthStateChange doesn't fire
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, whatsapp: string, referredBy?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Erro ao criar conta');

    const { data: refCode } = await (supabase as any).rpc('generate_referral_code');

    let referrerId: string | null = null;
    if (referredBy) {
      const { data: referrer } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('referral_code', referredBy)
        .maybeSingle();
      if (referrer) referrerId = referrer.id;
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
