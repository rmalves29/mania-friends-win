import { useAuth } from '@/hooks/useAuth';
import { useMyRewards, useReferralStats } from '@/hooks/useReferralData';
import { Gift, Sparkles, Send, UserCheck, Clock } from 'lucide-react';

// Topo do painel: indicadas x entraram no grupo + quanto falta para o próximo presente
export function NextPrize() {
  const { profile } = useAuth();
  const { data: stats } = useReferralStats();
  const { data: rewards = [] } = useMyRewards();

  if (!profile) return null;

  const joined = stats?.joined ?? profile.referral_count ?? 0;
  const sorted = [...rewards].sort((a, b) => a.milestone - b.milestone);
  const next = sorted.find((r) => r.milestone > joined);
  const prev = [...sorted].reverse().find((r) => r.milestone <= joined);
  const base = prev?.milestone ?? 0;
  const pct = next ? Math.min(((joined - base) / (next.milestone - base)) * 100, 100) : 100;

  const cards = [
    { icon: Send, label: 'Indicadas', value: stats?.total ?? 0, hint: 'se cadastraram pelo seu link' },
    { icon: UserCheck, label: 'Entraram no grupo', value: joined, hint: 'estas valem presentes', highlight: true },
    { icon: Clock, label: 'Aguardando', value: stats?.pending ?? 0, hint: 'ainda não entraram' },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-foreground text-background p-6 sm:p-8 shadow-elevated animate-in fade-in zoom-in-95 duration-500">
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative space-y-6">
        <p className="text-sm font-body text-background/70">
          Olá, <span className="font-semibold text-background">{profile.name.split(' ')[0]}</span> 👋 este é o seu resumo
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {cards.map(({ icon: Icon, label, value, hint, highlight }) => (
            <div
              key={label}
              className={`rounded-2xl p-3 sm:p-4 ${highlight ? 'bg-secondary text-secondary-foreground' : 'bg-background/10'}`}
            >
              <Icon className={`h-4 w-4 ${highlight ? '' : 'text-secondary'}`} />
              <p className="mt-2 font-display text-3xl sm:text-4xl font-bold tabular-nums">{value}</p>
              <p className="text-xs sm:text-sm font-body font-semibold leading-tight">{label}</p>
              <p className={`hidden sm:block text-xs font-body mt-0.5 ${highlight ? 'opacity-80' : 'text-background/60'}`}>{hint}</p>
            </div>
          ))}
        </div>

        {next ? (
          <div>
            <p className="flex items-center gap-2 text-sm font-body font-semibold">
              <Gift className="h-4 w-4 text-secondary" />
              Faltam {next.milestone - joined} {next.milestone - joined === 1 ? 'amiga entrar' : 'amigas entrarem'} no grupo para: {next.title}
            </p>
            <div className="mt-3 h-3 rounded-full bg-background/15 overflow-hidden">
              <div
                className="h-full rounded-full animate-progress transition-all duration-1000"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, hsl(350 40% 75%), hsl(38 70% 60%))' }}
              />
            </div>
          </div>
        ) : rewards.length > 0 ? (
          <p className="flex items-center gap-2 text-sm font-body font-semibold">
            <Sparkles className="h-4 w-4 text-gold" /> Você desbloqueou todos os presentes! 🎉
          </p>
        ) : null}
      </div>
    </section>
  );
}
