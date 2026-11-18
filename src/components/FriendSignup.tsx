import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { guessGender, isValidPhone, maskPhone } from '@/lib/referral';
import { Loader2, MessageCircle, CheckCircle2, Heart } from 'lucide-react';

interface Props {
  referralCode: string;
}

type Result = { kind: 'ok' } | { kind: 'already' } | { kind: 'blocked'; message: string };

// Página da amiga indicada: cadastra nome + WhatsApp e leva para o grupo VIP
export function FriendSignup({ referralCode }: Props) {
  const { data: settings } = useSettings();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const groupLink = settings?.whatsapp_link || '#';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().split(/\s+/).length < 2) {
      toast({ title: 'Digite seu nome e sobrenome', variant: 'destructive' });
      return;
    }
    if (!isValidPhone(phone)) {
      toast({ title: 'WhatsApp inválido', description: 'Use DDD + número, ex.: (31) 99999-9999', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const gender = await guessGender(name);
      const { data, error } = await (supabase as any).rpc('register_referral', {
        _referral_code: referralCode,
        _name: name.trim(),
        _whatsapp: phone,
        _gender: gender,
      });
      if (error) throw error;
      const res = data as { ok: boolean; error?: string; already?: boolean; status?: string };
      if (res.ok) {
        setResult({ kind: 'ok' });
      } else if (res.already) {
        setResult({ kind: 'already' });
      } else {
        setResult({ kind: 'blocked', message: res.error || 'Não foi possível concluir.' });
      }
    } catch {
      toast({ title: 'Erro ao enviar', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (result && result.kind !== 'blocked') {
    return (
      <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        <CheckCircle2 className="mx-auto h-14 w-14 text-badge-unlocked" />
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {result.kind === 'ok' ? 'Falta só um passo!' : 'Você já foi indicada 💕'}
          </h2>
          <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed">
            Entre agora no <strong className="text-foreground">Grupo VIP</strong> para receber as ofertas exclusivas.
            {result.kind === 'ok' && ' Sua amiga só ganha a indicação quando você entrar no grupo.'}
          </p>
        </div>
        <Button asChild className="h-14 w-full rounded-xl text-base font-body font-semibold text-white bg-[#25D366] hover:bg-[#1fb957] shadow-elevated">
          <a href={groupLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Entrar no Grupo VIP
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold font-body uppercase tracking-wider text-foreground">
          <Heart className="h-3.5 w-3.5" /> Você foi convidada
        </span>
        <h2 className="mt-3 font-display text-2xl font-bold text-foreground">Entre no Grupo VIP</h2>
        <p className="mt-1.5 text-sm font-body text-muted-foreground">
          Uma amiga te indicou para receber ofertas exclusivas da Mania de Mulher.
        </p>
      </div>

      {result?.kind === 'blocked' && (
        <p className="rounded-xl bg-muted px-4 py-3 text-center text-sm font-body text-foreground">{result.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="f-name" className="font-body text-sm">Nome e sobrenome</Label>
        <Input
          id="f-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          className="h-12 rounded-xl bg-background/70 font-body"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-phone" className="font-body text-sm">Seu WhatsApp (o mesmo que vai entrar no grupo)</Label>
        <Input
          id="f-phone"
          value={phone}
          onChange={(e) => setPhone(maskPhone(e.target.value))}
          placeholder="(31) 99999-9999"
          inputMode="tel"
          autoComplete="tel"
          className="h-12 rounded-xl bg-background/70 font-body"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-xl text-base font-body font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-glow"
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}
        {loading ? 'Enviando...' : 'QUERO ENTRAR NO GRUPO'}
      </Button>
      <p className="text-center text-xs font-body text-muted-foreground">Grupo exclusivo para mulheres 💕</p>
    </form>
  );
}
