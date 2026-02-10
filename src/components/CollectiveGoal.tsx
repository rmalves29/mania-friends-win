import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Trophy, Users, Gift } from 'lucide-react';

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
    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5">
      {/* Badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 bg-progress-bar/10 text-progress-bar px-4 py-1.5 rounded-full text-sm font-bold font-body">
          {settings?.collective_goal_badge || '🏆 Meta Coletiva'}
        </span>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <h3 className="font-display text-2xl font-bold text-foreground">
          {settings?.collective_goal_title || 'Desbloqueie o SUPER CUPOM'}
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          {settings?.collective_goal_subtitle || 'Juntos, vamos atingir 1.000 indicações!'}
        </p>
      </div>

      {/* Counter */}
      <div className="bg-muted/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-progress-bar/15 p-2.5 rounded-xl">
            <Users className="h-6 w-6 text-progress-bar" />
          </div>
          <div className="text-center">
            <span className="font-display text-4xl font-bold text-foreground">{total}</span>
            <p className="text-sm text-muted-foreground font-body">
              de {goal.toLocaleString('pt-BR')} indicações
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="relative h-4 bg-progress-track rounded-full overflow-hidden">
            <div
              className="h-full bg-progress-bar rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-center text-sm font-bold text-muted-foreground font-body">
            {percentage.toFixed(1)}%
          </p>
        </div>

        {/* Reward Info */}
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-lg shrink-0">
            <Gift className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="font-body font-bold text-foreground text-sm">
              {settings?.collective_goal_reward_text || '50% de desconto em qualquer peça!'}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Faltam {remaining.toLocaleString('pt-BR')} indicações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
