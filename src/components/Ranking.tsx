import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Medal } from 'lucide-react';

interface RankItem {
  name: string;
  referral_count: number;
}

function maskName(name: string): string {
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
  }).join(' ');
}

export function Ranking() {
  const [ranking, setRanking] = useState<RankItem[]>([]);

  useEffect(() => {
    (supabase as any)
      .from('profiles')
      .select('name, referral_count')
      .gt('referral_count', 0)
      .order('referral_count', { ascending: false })
      .limit(10)
      .then(({ data }: { data: RankItem[] | null }) => {
        setRanking(data || []);
      });
  }, []);

  if (ranking.length === 0) return null;

  const icons = [
    <Crown key="1" className="h-5 w-5 text-gold" />,
    <Medal key="2" className="h-5 w-5 text-badge-locked" />,
    <Medal key="3" className="h-5 w-5 text-secondary" />,
  ];

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-soft border border-border">
      <h3 className="font-display text-lg font-bold mb-4 text-foreground flex items-center gap-2">
        <Crown className="h-5 w-5 text-gold" /> Top Influenciadoras
      </h3>
      <div className="space-y-3">
        {ranking.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 border border-border">
            <div className="w-8 h-8 flex items-center justify-center">
              {i < 3 ? icons[i] : <span className="text-sm font-bold text-muted-foreground">{i + 1}º</span>}
            </div>
            <span className="flex-1 font-body text-foreground">{maskName(item.name)}</span>
            <span className="font-display font-bold text-secondary">{item.referral_count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
