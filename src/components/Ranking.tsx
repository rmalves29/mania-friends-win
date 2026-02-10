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

const rowStyles = [
  'bg-[hsl(38,70%,90%)] border-[hsl(38,60%,70%)]',
  'bg-[hsl(38,30%,92%)] border-[hsl(38,20%,78%)]',
  'bg-[hsl(30,50%,90%)] border-[hsl(30,40%,72%)]',
];

const avatarStyles = [
  'bg-[hsl(30,60%,55%)] text-white',
  'bg-[hsl(0,0%,65%)] text-white',
  'bg-[hsl(25,60%,55%)] text-white',
];

const badgeStyles = [
  'bg-[hsl(30,60%,55%)] text-white',
  'bg-[hsl(0,0%,65%)] text-white',
  'bg-[hsl(25,60%,55%)] text-white',
];

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
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Trophy className="h-7 w-7 text-gold" />
          Ranking de Indicações
        </h3>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Os maiores influenciadores da nossa comunidade
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRanking}
          disabled={loading}
          className="font-body text-xs gap-2"
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
                isTop3
                  ? rowStyles[i]
                  : 'bg-card border-border'
              }`}
            >
              {/* Position */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {isTop3 ? (
                  <span className="text-xl">{medalEmojis[i]}</span>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground font-body">{i + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-body shrink-0 ${
                  isTop3 ? avatarStyles[i] : 'bg-muted text-muted-foreground'
                }`}
              >
                {getInitials(item.name)}
              </div>

              {/* Name + count label */}
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-foreground truncate">
                  {maskName(item.name)}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {item.referral_count} indicações
                </p>
              </div>

              {/* Count badge */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  isTop3 ? badgeStyles[i] : 'bg-muted text-muted-foreground'
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
