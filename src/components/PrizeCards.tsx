import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Gift, Unlock } from 'lucide-react';

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
    <div className="space-y-5">
      <h3 className="font-display text-xl font-bold text-foreground text-center">🎁 Seus Prêmios</h3>
      <div className="grid grid-cols-1 gap-4">
        {rewards.map((reward) => {
          const unlocked = referralCount >= reward.milestone;
          return (
            <div
              key={reward.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 hover-lift ${
                unlocked
                  ? 'glass shadow-elevated'
                  : 'bg-muted/40 opacity-70'
              }`}
              style={unlocked ? {
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(hsl(30 30% 97% / 0.6), hsl(30 30% 97% / 0.6)), linear-gradient(135deg, hsl(145 50% 45% / 0.3), hsl(350 30% 78% / 0.2))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              } : { border: '1px solid hsl(30 15% 90%)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${unlocked ? 'bg-badge-unlocked/15' : 'bg-muted'}`}>
                  {unlocked ? (
                    <Unlock className="h-5 w-5 text-badge-unlocked" />
                  ) : (
                    <Lock className="h-5 w-5 text-badge-locked" />
                  )}
                </div>
                <span className={`text-xs font-semibold font-body px-3 py-1.5 rounded-full ${
                  unlocked ? 'bg-badge-unlocked/15 text-badge-unlocked' : 'bg-muted text-foreground/60'
                }`}>
                  {reward.milestone} indicações
                </span>
              </div>

              <h4 className="font-display font-bold text-foreground text-lg">{reward.title}</h4>
              <p className="text-sm font-body mt-1.5 text-foreground/65 leading-relaxed">{reward.description}</p>

              {unlocked && reward.coupon_code && (
                <div className="mt-4 bg-background/80 rounded-xl px-4 py-3 flex items-center gap-3 shadow-soft">
                  <Gift className="h-4 w-4 text-secondary" />
                  <span className="font-body font-bold text-foreground tracking-widest text-sm">{reward.coupon_code}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
