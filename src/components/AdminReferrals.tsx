import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { statusInfo, type ReferralStatus } from '@/lib/referral';
import { Trophy, Check, X, UserCheck, Copy, Loader2, Webhook, RefreshCw } from 'lucide-react';

interface RankRow { id: string; name: string; whatsapp: string | null; joined: number; pending: number; rejected: number }
interface RefRow {
  id: string; name: string; whatsapp: string; gender: string; status: ReferralStatus;
  reject_reason: string | null; created_at: string; joined_at: string | null; referrer_id: string;
}

const sb = supabase as any;
const filters: { id: 'all' | ReferralStatus; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'review', label: 'Em análise' },
  { id: 'pending', label: 'Aguardando' },
  { id: 'joined', label: 'Entraram' },
  { id: 'rejected', label: 'Não contaram' },
  { id: 'left', label: 'Saíram' },
];

const fmtPhone = (p: string) => p.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');

export default function AdminReferrals() {
  const { toast } = useToast();
  const [ranking, setRanking] = useState<RankRow[]>([]);
  const [refs, setRefs] = useState<RefRow[]>([]);
  const [filter, setFilter] = useState<'all' | ReferralStatus>('all');
  const [search, setSearch] = useState('');
  const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');

  const load = async () => {
    const [rk, rf, tk] = await Promise.all([
      sb.rpc('admin_ranking'),
      sb.from('referrals').select('*').order('created_at', { ascending: false }).limit(1000),
      sb.from('app_secrets').select('value').eq('key', 'webhook_token').maybeSingle(),
    ]);
    setRanking((rk.data as RankRow[]) || []);
    setRefs((rf.data as RefRow[]) || []);
    setToken(tk.data?.value || '');
  };

  useEffect(() => { load(); }, []);

  const names = useMemo(() => Object.fromEntries(ranking.map((r) => [r.id, r.name])), [ranking]);
  const shown = refs.filter((r) =>
    (filter === 'all' || r.status === filter) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.whatsapp.includes(search.replace(/\D/g, '') || '@@')),
  );

  const setStatus = async (r: RefRow, status: ReferralStatus, reason: string | null = null) => {
    const { error } = await sb.from('referrals').update({
      status, reject_reason: reason, joined_at: status === 'joined' ? (r.joined_at || new Date().toISOString()) : r.joined_at,
    }).eq('id', r.id);
    if (error) toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    else load();
  };

  const markJoined = async (phones: string[]) => {
    setBusy(true);
    let matched = 0;
    for (const p of phones) {
      const { data } = await sb.rpc('mark_group_event', { _phone: p, _event: 'join' });
      if (data?.matched) matched++;
    }
    setBusy(false);
    toast({ title: `✅ ${matched} de ${phones.length} números encontrados nas indicações` });
    setBulk('');
    load();
  };

  const webhookUrl = token
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/group-webhook?token=${token}`
    : '';

  return (
    <div className="space-y-8">
      {/* Ranking (só admin) */}
      <section className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-gold" /> Ranking de indicadoras</h2>
          <Button size="icon" variant="ghost" onClick={load} aria-label="Atualizar"><RefreshCw className="h-4 w-4" /></Button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2 pr-2">#</th><th className="pr-2">Nome</th><th className="pr-2">WhatsApp</th><th className="pr-2 text-right">Entraram</th><th className="pr-2 text-right">Aguardando</th><th className="text-right">Não contaram</th></tr>
            </thead>
            <tbody>
              {ranking.filter((r) => r.joined + r.pending + r.rejected > 0).slice(0, 50).map((r, i) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                  <td className="pr-2 font-medium">{r.name}</td>
                  <td className="pr-2 text-muted-foreground">{r.whatsapp}</td>
                  <td className="pr-2 text-right font-bold">{r.joined}</td>
                  <td className="pr-2 text-right">{r.pending}</td>
                  <td className="text-right text-muted-foreground">{r.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ranking.every((r) => r.joined + r.pending + r.rejected === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma indicação ainda.</p>
          )}
        </div>
      </section>

      {/* Indicações */}
      <section className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-display text-lg font-bold">Indicações ({refs.length})</h2>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'outline'} onClick={() => setFilter(f.id)} className="font-body text-xs">
              {f.label} ({f.id === 'all' ? refs.length : refs.filter((r) => r.status === f.id).length})
            </Button>
          ))}
        </div>
        <Input placeholder="Buscar por nome ou WhatsApp" value={search} onChange={(e) => setSearch(e.target.value)} className="font-body" />
        <ul className="divide-y divide-border/60">
          {shown.map((r) => (
            <li key={r.id} className="py-3 flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-body font-medium">{r.name} <span className="text-xs text-muted-foreground">({r.gender === 'F' ? 'fem.' : r.gender === 'M' ? 'masc.' : 'nome incerto'})</span></p>
                <p className="text-xs text-muted-foreground font-body">
                  {fmtPhone(r.whatsapp)} · indicada por {names[r.referrer_id] || '—'} · {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  {r.reject_reason ? ` · ${r.reject_reason}` : ''}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-body font-semibold ${statusInfo[r.status].className}`}>{statusInfo[r.status].label}</span>
              {r.status !== 'joined' && (
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setStatus(r, 'joined')}>
                  <Check className="mr-1 h-3.5 w-3.5" /> {r.status === 'pending' ? 'Entrou' : 'Aprovar'}
                </Button>
              )}
              {r.status !== 'rejected' && (
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setStatus(r, 'rejected', 'Recusada pelo admin')}>
                  <X className="mr-1 h-3.5 w-3.5" /> Recusar
                </Button>
              )}
            </li>
          ))}
          {shown.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground font-body">Nada por aqui.</li>}
        </ul>
      </section>

      {/* Plano B: marcar entradas em lote */}
      <section className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><UserCheck className="h-5 w-5" /> Marcar quem entrou no grupo</h2>
        <p className="text-sm text-muted-foreground font-body">
          Cole os números que entraram no grupo (um por linha, com ou sem DDD 55). Use se o aviso automático não estiver ligado.
        </p>
        <Textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'31999999999\n(31) 98888-7777'} className="font-body" />
        <Button
          disabled={busy || !bulk.trim()}
          onClick={() => markJoined(bulk.split(/[\n,;]+/).map((s) => s.trim()).filter((s) => s.replace(/\D/g, '').length >= 10))}
          className="font-body"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Confirmar entradas
        </Button>
      </section>

      {/* Webhook */}
      <section className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><Webhook className="h-5 w-5" /> Aviso automático de entrada (webhook)</h2>
        <p className="text-sm text-muted-foreground font-body">
          Cadastre este endereço no Sendflow (ou na ferramenta do grupo) para os eventos de <strong>entrada</strong> e <strong>saída</strong> de participantes.
          Quando uma indicada entra, a indicação é confirmada sozinha.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={webhookUrl} className="font-mono text-xs" />
          <Button size="icon" variant="outline" disabled={!webhookUrl} onClick={() => { navigator.clipboard.writeText(webhookUrl); toast({ title: 'Endereço copiado' }); }}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-body">Não compartilhe este endereço: ele contém a chave de acesso.</p>
      </section>
    </div>
  );
}
