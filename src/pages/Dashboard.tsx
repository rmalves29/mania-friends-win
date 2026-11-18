import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

import { CollectiveGoal } from '@/components/CollectiveGoal';
import { ReferralLink } from '@/components/ReferralLink';
import { PrizeCards } from '@/components/PrizeCards';
import { Ranking } from '@/components/Ranking';
import { VipGroup } from '@/components/VipGroup';
import { NextPrize } from '@/components/NextPrize';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

const Dashboard = () => {
  const { user, profile, loading, signOut, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profileRetries, setProfileRetries] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Retry fetching profile if it's null after login (race condition)
  useEffect(() => {
    if (!loading && user && !profile && profileRetries < 5) {
      const timer = setTimeout(() => {
        refreshProfile();
        setProfileRetries(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, profile, profileRetries, refreshProfile]);

  // Realtime: refresh profile when referral_count changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshProfile]);

  // Refresh profile on tab focus
  useEffect(() => {
    const onFocus = () => { if (user) refreshProfile(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, refreshProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse-slow text-secondary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse-slow text-secondary" />
        <p className="text-muted-foreground font-body ml-3">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="glass sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <img src={logo} alt="Mania de Mulher" className="h-10" />
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="font-body text-xs rounded-full px-4">
                Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate('/'); }} className="rounded-full hover:bg-secondary/10">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <NextPrize />
        <ReferralLink />
        <PrizeCards />
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Ranking />
          <div className="space-y-8">
            <CollectiveGoal />
            <VipGroup />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-4">
        <p className="text-center text-xs text-muted-foreground font-body tracking-wide">
          © 2026 Mania de Mulher · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
