import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, RefreshCw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Adaptado do componente "Leaderboard Rankings" (21st.dev): pódio para o top 3 + lista com coroa e destaque da usuária logada

interface RankItem {
  name: string;
  referral_count: number;
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function maskName(name: string): string {
  return name
    .split(' ')
    .map((part, i) => (i === 0 || part.length <= 1 ? part : part[0] + '***'))
    .join(' ');
}

const crownColor = ['text-gold', 'text-slate-400', 'text-amber-700'];
// ordem visual do pódio: 2º, 1º, 3º
const podiumOrder = [1, 0, 2];
const podiumHeight = ['h-28', 'h-20', 'h-14'];

export function Ranking() {
  const { profile } = useAuth();
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await (supabase as any).rpc('get_ranking', { limit_count: 10 });
    setRanking(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const isMe = (item: RankItem) =>
    !!profile && item.name === profile.name && item.referral_count === profile.referral_count;

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <section className="glass rounded-3xl p-6 sm:p-8 shadow-elevated space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gold" /> Ranking
          </h3>
          <p className="text-sm text-muted-foreground font-body">Quem mais indicou até agora</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchRanking}
          disabled={loading}
          aria-label="Atualizar ranking"
          className="rounded-full shrink-0"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {loading && ranking.length === 0 && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      )}

      {ranking.length === 0 && !loading && (
        <p className="text-center text-muted-foreground font-body text-sm py-4">
          Nenhuma indicação ainda. Seja a primeira!
        </p>
      )}

      {/* Pódio */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 pt-2">
          {podiumOrder.map((idx) => {
            const item = top3[idx];
            if (!item) return <div key={idx} />;
            const me = isMe(item);
            return (
              <div
                key={idx}
                className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${idx * 120}ms`, animationDuration: '500ms' }}
              >
                <Crown className={cn('h-5 w-5 mb-1', crownColor[idx], idx === 0 && 'h-7 w-7 animate-float')} />
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full font-body font-bold bg-primary/15 text-primary ring-2',
                    idx === 0 ? 'h-16 w-16 text-lg ring-gold' : 'h-12 w-12 text-sm ring-secondary',
                    me && 'ring-4 ring-primary'
                  )}
                >
                  {getInitials(item.name)}
                </div>
                <p className="mt-2 max-w-full truncate text-center text-xs sm:text-sm font-semibold font-body text-foreground">
                  {me ? 'Você' : maskName(item.name).split(' ')[0]}
                </p>
                <p className="text-xs text-muted-foreground font-body tabular-nums">{item.referral_count} indic.</p>
                <div
                  className={cn(
                    'mt-2 w-full rounded-t-xl flex items-start justify-center pt-2 font-display font-bold text-xl',
                    podiumHeight[idx],
                    idx === 0 ? 'bg-gradient-to-b from-gold/40 to-gold/10 text-gold-foreground' : 'bg-gradient-to-b from-secondary/40 to-secondary/10 text-foreground'
                  )}
                >
                  {idx + 1}º
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista 4º em diante */}
      {rest.length > 0 && (
        <div role="list" className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50 overflow-hidden">
          {rest.map((item, i) => {
            const me = isMe(item);
            return (
              <div
                key={i}
                role="listitem"
                className={cn('flex items-center gap-3 px-4 py-3', me && 'bg-secondary/15')}
              >
                <span className="w-6 text-sm font-semibold tabular-nums text-muted-foreground font-body">{i + 4}</span>
                <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold font-body shrink-0">
                  {getInitials(item.name)}
                </div>
                <p className="flex-1 min-w-0 truncate font-body font-medium text-foreground">
                  {maskName(item.name)} {me && <span className="ml-1 text-xs font-semibold text-primary">(você)</span>}
                </p>
                <span className="font-display font-bold tabular-nums text-foreground">{item.referral_count}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
