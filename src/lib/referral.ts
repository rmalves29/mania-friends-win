// Utilitários do Indique e Ganhe

/** Máscara (31) 99999-9999 */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const d = value.replace(/\D/g, '');
  return d.length === 10 || d.length === 11;
}

const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

async function ibgeFrequency(name: string, sexo: 'F' | 'M', signal: AbortSignal): Promise<number> {
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${encodeURIComponent(name)}?sexo=${sexo}`,
    { signal },
  );
  if (!res.ok) return 0;
  const data = (await res.json()) as { res?: { frequencia: number }[] }[];
  return (data?.[0]?.res ?? []).reduce((sum, r) => sum + (r.frequencia || 0), 0);
}

/**
 * Classifica o primeiro nome pela base do IBGE (Censo).
 * 'F' = feminino em 80%+ dos registros, 'M' = masculino em 80%+, '?' = ambíguo/desconhecido.
 */
export async function guessGender(fullName: string): Promise<'F' | 'M' | '?'> {
  const first = stripAccents(fullName.trim().split(/\s+/)[0] || '').toLowerCase();
  if (first.length < 2) return '?';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const [f, m] = await Promise.all([
      ibgeFrequency(first, 'F', ctrl.signal),
      ibgeFrequency(first, 'M', ctrl.signal),
    ]);
    const total = f + m;
    if (total === 0) return '?';
    if (f / total >= 0.8) return 'F';
    if (m / total >= 0.8) return 'M';
    return '?';
  } catch {
    return '?';
  } finally {
    clearTimeout(timer);
  }
}

export type ReferralStatus = 'pending' | 'joined' | 'review' | 'rejected' | 'left';

export const statusInfo: Record<ReferralStatus, { label: string; className: string }> = {
  joined: { label: 'Entrou no grupo ✓', className: 'bg-badge-unlocked/15 text-badge-unlocked' },
  pending: { label: 'Aguardando entrar no grupo', className: 'bg-gold/15 text-gold-foreground' },
  review: { label: 'Em análise', className: 'bg-secondary/25 text-foreground' },
  rejected: { label: 'Não contou', className: 'bg-muted text-muted-foreground' },
  left: { label: 'Saiu do grupo', className: 'bg-muted text-muted-foreground' },
};
