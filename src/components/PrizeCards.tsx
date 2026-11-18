import { useState } from 'react';
import { useMyRewards, useReferralStats } from '@/hooks/useReferralData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, Unlock, Copy, Check } from 'lucide-react';

// Presentes: cadeado fechado até bater a meta; aberto mostra o cupom para copiar
export function PrizeCards() {
  const { profile } = useAuth();
  const { data: rewards = [] } = useMyRewards();
  const { data: stats } = useReferralStats();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const joined = stats?.joined ?? profile?.referral_count ?? 0;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast({ title: '✅ Cupom copiado!', description: 'Use no carrinho da loja.' });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: 'Copie manualmente: ' + code });
    }
  };

  if (rewards.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground">🎁 Seus presentes</h3>
        <p className="text-sm font-body text-muted-foreground">
          Cada meta conta as amigas que <strong className="text-foreground">entraram no grupo</strong>.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const unlocked = reward.unlocked;
          const remaining = Math.max(reward.milestone - joined, 0);
          const pct = Math.min((joined / reward.milestone) * 100, 100);
          return (
            <div
              key={reward.id}
              className={`relative rounded-2xl p-5 transition-all duration-300 ${
                unlocked ? 'glass shadow-elevated ring-2 ring-badge-unlocked/40' : 'bg-muted/40 border border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${unlocked ? 'bg-badge-unlocked/15 animate-unlock' : 'bg-muted'}`}>
                  {unlocked ? <Unlock className="h-5 w-5 text-badge-unlocked" /> : <Lock className="h-5 w-5 text-badge-locked" />}
                </div>
                <span
                  className={`text-xs font-semibold font-body px-3 py-1.5 rounded-full ${
                    unlocked ? 'bg-badge-unlocked/15 text-badge-unlocked' : 'bg-muted text-foreground/60'
                  }`}
                >
                  {reward.milestone} {reward.milestone === 1 ? 'amiga' : 'amigas'}
                </span>
              </div>

              <h4 className="mt-4 font-display text-lg font-bold text-foreground">{reward.title}</h4>
              {reward.description && (
                <p className="mt-1 text-sm font-body text-foreground/65 leading-relaxed">{reward.description}</p>
              )}

              {unlocked && reward.coupon_code ? (
                <button
                  onClick={() => copy(reward.coupon_code!)}
                  className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border-2 border-dashed border-badge-unlocked/50 bg-background/80 px-4 py-3 text-left transition hover:bg-background"
                >
                  <span className="font-body font-bold tracking-widest text-foreground">{reward.coupon_code}</span>
                  <span className="flex items-center gap-1 text-xs font-body font-semibold text-badge-unlocked">
                    {copied === reward.coupon_code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === reward.coupon_code ? 'Copiado' : 'Copiar'}
                  </span>
                </button>
              ) : !unlocked ? (
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-progress-track overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs font-body text-muted-foreground">
                    Faltam {remaining} para liberar o cupom
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
