import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Link2, Gift, MessageCircle } from 'lucide-react';

// Adaptado do componente "Referral Card" (21st.dev) para a identidade Mania de Mulher
export function ReferralLink() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const link = `${window.location.origin}?ref=${profile.referral_code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: '✅ Link copiado!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Segure o link e copie manualmente.', variant: 'destructive' });
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`💕 Amiga, entra no Grupo VIP da Mania de Mulher! Lá tem ofertas exclusivas. Se cadastra pelo meu link: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <section className="relative overflow-hidden glass rounded-3xl p-6 sm:p-8 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Decoração */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/25 blur-3xl" />
      <Gift className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-secondary/30 animate-float" />

      <div className="relative">
        <span className="inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold font-body uppercase tracking-wider text-foreground">
          Indique e ganhe
        </span>
        <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-foreground">
          Seu link de <span className="italic text-primary">indicação</span>
        </h3>

        <p className="mt-2 text-sm font-body text-muted-foreground">
          Este é o link que você divulga. Cada amiga que se cadastrar por ele <strong className="text-foreground">e entrar no Grupo VIP</strong> conta para os seus presentes.
        </p>

        <div className="mt-5" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-sm font-body text-muted-foreground">{link}</p>
          </div>
          <Button
            onClick={copyLink}
            className="h-12 shrink-0 rounded-xl px-6 font-body font-semibold shadow-soft"
          >
            <span key={copied ? 'ok' : 'copy'} className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </span>
          </Button>
        </div>

        <Button
          onClick={shareWhatsApp}
          className="mt-3 h-12 w-full rounded-xl font-body font-semibold text-white bg-[#25D366] hover:bg-[#1fb957] shadow-soft"
        >
          <MessageCircle className="mr-2 h-5 w-5" /> Enviar no WhatsApp
        </Button>
      </div>
    </section>
  );
}
