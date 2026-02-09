import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Unlock, Gift } from 'lucide-react';

interface Reward {
  id: string;
  milestone: number;
  title: string;
  description: string | null;
  coupon_code: string | null;
}

export function PrizeCards() {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    (supabase as any).from('rewards').select('*').order('sort_order').then(({ data }: { data: Reward[] | null }) => {
      setRewards(data || []);
    });
  }, []);

  const referralCount = profile?.referral_count || 0;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">🎁 Seus Prêmios</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const unlocked = referralCount >= reward.milestone;
          return (
            <div
              key={reward.id}
              className={`relative rounded-xl p-5 border transition-all duration-300 ${
                unlocked
                  ? 'bg-gradient-card border-badge-unlocked/30 shadow-soft'
                  : 'bg-muted/50 border-border opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${unlocked ? 'bg-badge-unlocked/20' : 'bg-badge-locked/20'}`}>
                  {unlocked ? (
                    <Unlock className="h-5 w-5 text-badge-unlocked" />
                  ) : (
                    <Lock className="h-5 w-5 text-badge-locked" />
                  )}
                </div>
                <span className={`text-xs font-bold font-body px-2 py-1 rounded-full ${
                  unlocked ? 'bg-badge-unlocked/20 text-badge-unlocked' : 'bg-badge-locked/20 text-badge-locked'
                }`}>
                  {reward.milestone} indicações
                </span>
              </div>

              <h4 className="font-display font-bold text-foreground">{reward.title}</h4>
              <p className="text-sm text-muted-foreground font-body mt-1">{reward.description}</p>

              {unlocked && reward.coupon_code && (
                <div className="mt-3 bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-secondary" />
                  <span className="font-body font-bold text-foreground tracking-wider">{reward.coupon_code}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
