import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Users, Gift } from 'lucide-react';

export function CollectiveGoal() {
  const { data: settings } = useSettings();
  const [total, setTotal] = useState(0);
  const goal = settings?.collective_goal || 1000;

  useEffect(() => {
    (supabase as any).rpc('get_total_referrals').then(({ data }: { data: number | null }) => {
      setTotal(data || 0);
    });
  }, []);

  const percentage = Math.min((total / goal) * 100, 100);
  const remaining = Math.max(goal - total, 0);

  return (
    <div className="glass rounded-2xl p-8 shadow-elevated space-y-6">
      {/* Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-semibold font-body tracking-wide">
          {settings?.collective_goal_badge || '🏆 Meta Coletiva'}
        </span>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h3 className="font-display text-2xl font-bold text-foreground">
          {settings?.collective_goal_title || 'Desbloqueie o SUPER CUPOM'}
        </h3>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {settings?.collective_goal_subtitle || 'Juntos, vamos atingir 1.000 indicações!'}
        </p>
      </div>

      {/* Counter */}
      <div className="bg-background/60 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <span className="font-display text-5xl font-bold text-foreground">{total}</span>
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              de {goal.toLocaleString('pt-BR')} indicações
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-progress-track rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-progress transition-all duration-1000 ease-out"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, hsl(20 20% 37%), hsl(350 30% 70%))',
              }}
            />
          </div>
          <p className="text-center text-sm font-semibold text-muted-foreground font-body">
            {percentage.toFixed(1)}%
          </p>
        </div>

        {/* Reward Info */}
        <div className="bg-background/80 rounded-xl px-5 py-4 flex items-center gap-4 shadow-soft">
          <div className="bg-secondary/15 p-2.5 rounded-xl shrink-0">
            <Gift className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="font-body font-semibold text-foreground text-sm">
              {settings?.collective_goal_reward_text || '50% de desconto em qualquer peça!'}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              Faltam {remaining.toLocaleString('pt-BR')} indicações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
