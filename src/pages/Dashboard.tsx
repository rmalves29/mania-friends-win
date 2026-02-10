import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import { CollectiveGoal } from '@/components/CollectiveGoal';
import { ReferralLink } from '@/components/ReferralLink';
import { PrizeCards } from '@/components/PrizeCards';
import { Ranking } from '@/components/Ranking';
import { VipGroup } from '@/components/VipGroup';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse-slow text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">Mania de Mulher</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="font-body text-xs">
                Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="text-center">
          <p className="text-muted-foreground font-body">Olá, <span className="font-bold text-foreground">{profile.name.split(' ')[0]}</span>! 👋</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Users className="h-4 w-4 text-secondary" />
            <span className="font-display text-2xl font-bold text-foreground">{profile.referral_count}</span>
            <span className="text-sm text-muted-foreground font-body">indicações</span>
          </div>
        </div>

        <CollectiveGoal />
        <ReferralLink />
        <PrizeCards />
        <Ranking />
        <VipGroup />
      </main>

      
    </div>
  );
};

export default Dashboard;
