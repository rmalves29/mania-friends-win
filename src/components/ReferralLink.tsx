import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';

export function ReferralLink() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const link = `${window.location.origin}?ref=${profile.referral_code}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: '✅ Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🎁 Vem ganhar prêmios incríveis na Mania de Mulher! Use meu link: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="glass rounded-2xl p-7 shadow-elevated text-center hover-glow transition-all duration-300">
      <h3 className="font-display text-2xl font-bold mb-1.5 text-foreground">
        Convide amigos e <span className="text-secondary italic">Desbloqueie Cupons</span>
      </h3>
      <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">
        Compartilhe seu link e desbloqueie cupons exclusivos!
      </p>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-background/70 rounded-xl px-4 py-3.5 text-sm font-body text-muted-foreground truncate border border-border/50">
          {link}
        </div>
        <Button
          onClick={copyLink}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-body shrink-0 px-6 rounded-xl shadow-soft transition-all duration-300 hover:shadow-elevated"
        >
          <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground font-body tracking-wide">
        Compartilhe nas redes sociais ou envie diretamente para suas amigas
      </p>
    </div>
  );
}
