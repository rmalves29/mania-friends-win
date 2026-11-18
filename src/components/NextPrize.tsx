import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Gift, Sparkles } from 'lucide-react';

interface Reward {
  id: string;
  milestone: number;
  title: string;
}

// Card de progresso pessoal: mostra quantas indicações faltam para o próximo presente
export function NextPrize() {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    (supabase as any)
      .from('rewards')
      .select('id, milestone, title')
      .order('milestone')
      .then(({ data }: { data: Reward[] | null }) => setRewards(data || []));
  }, []);

  if (!profile) return null;

  const count = profile.referral_count || 0;
  const next = rewards.find((r) => r.milestone > count);
  const prev = [...rewards].reverse().find((r) => r.milestone <= count);
  const base = prev?.milestone ?? 0;
  const pct = next ? Math.min(((count - base) / (next.milestone - base)) * 100, 100) : 100;
  const unlocked = rewards.filter((r) => r.milestone <= count).length;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-foreground text-background p-6 sm:p-8 shadow-elevated animate-in fade-in zoom-in-95 duration-500">
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-body text-background/70">
            Olá, <span className="font-semibold text-background">{profile.name.split(' ')[0]}</span> 👋
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold tabular-nums">{count}</span>
            <span className="font-body text-background/70">{count === 1 ? 'indicação' : 'indicações'}</span>
          </div>
          <p className="mt-1 text-xs font-body text-background/60">
            {unlocked} de {rewards.length} presentes desbloqueados
          </p>
        </div>

        <div className="sm:w-1/2">
          {next ? (
            <>
              <p className="flex items-center gap-2 text-sm font-body font-semibold">
                <Gift className="h-4 w-4 text-secondary" />
                Faltam {next.milestone - count} para: {next.title}
              </p>
              <div className="mt-3 h-3 rounded-full bg-background/15 overflow-hidden">
                <div
                  className="h-full rounded-full animate-progress transition-all duration-1000"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, hsl(350 40% 75%), hsl(38 70% 60%))' }}
                />
              </div>
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm font-body font-semibold">
              <Sparkles className="h-4 w-4 text-gold" /> Você desbloqueou todos os presentes! 🎉
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
