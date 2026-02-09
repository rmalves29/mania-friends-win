import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Trophy } from 'lucide-react';

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

  return (
    <div className="bg-progress-bar/10 border border-progress-bar/20 rounded-xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-progress-bar/20 p-2 rounded-lg">
          <Trophy className="h-6 w-6 text-progress-bar" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Desbloqueie o SUPER CUPOM</h3>
          <p className="text-sm text-muted-foreground font-body">Meta coletiva de indicações</p>
        </div>
      </div>

      <div className="relative h-6 bg-progress-track rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-progress-bar rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
          <span className="text-xs font-bold text-primary-foreground">{Math.round(percentage)}%</span>
        </div>
      </div>

      <p className="text-center text-sm font-body text-muted-foreground">
        <span className="font-bold text-progress-bar">{total}</span> de <span className="font-bold">{goal}</span> indicações
      </p>
    </div>
  );
}
