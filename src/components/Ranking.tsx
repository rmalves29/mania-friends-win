import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const parts = name.split(' ');
  return parts.map((part, i) => {
    if (i === 0) return part;
    if (part.length <= 1) return part;
    return part[0] + '***';
  }).join(' ');
}

const medalEmojis = ['🥇', '🥈', '🥉'];

export function Ranking() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .rpc('get_ranking', { limit_count: 10 });
    setRanking(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-gold" />
          Ranking de Indicações
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          Os maiores influenciadores da nossa comunidade
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRanking}
          disabled={loading}
          className="font-body text-xs gap-2 rounded-full px-5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {ranking.length === 0 && !loading && (
        <p className="text-center text-muted-foreground font-body text-sm py-4">
          Nenhuma indicação ainda. Seja o primeiro!
        </p>
      )}

      <div className="space-y-3">
        {ranking.map((item, i) => {
          const isTop3 = i < 3;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 hover-lift ${
                isTop3
                  ? 'glass shadow-soft'
                  : 'bg-card/50 border border-border/50'
              }`}
              style={isTop3 ? {
                border: '1px solid transparent',
                backgroundImage: `linear-gradient(hsl(30 30% 97% / 0.6), hsl(30 30% 97% / 0.6)), linear-gradient(135deg, hsl(20 20% 55% / 0.2), hsl(350 30% 78% / 0.15))`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              } : undefined}
            >
              {/* Position */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {isTop3 ? (
                  <span className="text-xl">{medalEmojis[i]}</span>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground font-body">{i + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold font-body shrink-0 ${
                  isTop3 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {getInitials(item.name)}
              </div>

              {/* Name + count label */}
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-foreground truncate">
                  {maskName(item.name)}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {item.referral_count} indicações
                </p>
              </div>

              {/* Count badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  isTop3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {item.referral_count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
