import { useMyReferrals } from '@/hooks/useReferralData';
import { statusInfo } from '@/lib/referral';
import { Users } from 'lucide-react';

function maskName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p : p[0] + '.')).join(' ');
}

// Lista das amigas indicadas e a situação de cada uma
export function MyReferrals() {
  const { data: list = [], isLoading } = useMyReferrals();

  return (
    <section className="glass rounded-3xl p-6 sm:p-8 shadow-elevated">
      <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" /> Minhas indicações
      </h3>
      <p className="text-sm font-body text-muted-foreground">Acompanhe quem já entrou no grupo.</p>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-12 rounded-xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-background/60 px-4 py-6 text-center text-sm font-body text-muted-foreground">
          Nenhuma indicação ainda. Envie seu link para as amigas! 💌
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-background/50 overflow-hidden">
          {list.map((r) => {
            const info = statusInfo[r.status];
            return (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body font-medium text-foreground">{maskName(r.name)}</p>
                  <p className="text-xs font-body text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    {(r.status === 'rejected' || r.status === 'left') && r.reject_reason ? ` · ${r.reject_reason}` : ''}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-body font-semibold ${info.className}`}>
                  {info.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
