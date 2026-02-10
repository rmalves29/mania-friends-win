import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Share2 } from 'lucide-react';

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
    <div className="bg-gradient-card rounded-xl p-6 shadow-soft border border-border text-center">
      <h3 className="font-display text-2xl font-bold mb-1 text-foreground">
        Convide amigos e <span className="text-secondary italic">Desbloqueie Cupons</span>
      </h3>
      <p className="text-sm text-muted-foreground font-body mb-5">
        Compartilhe seu link e desbloqueie cupons exclusivos!
      </p>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-card rounded-lg px-4 py-3 text-sm font-body text-muted-foreground truncate border border-border">
          {link}
        </div>
        <Button onClick={copyLink} className="bg-progress-bar hover:bg-progress-bar/90 text-primary-foreground font-body shrink-0 px-5">
          <Copy className="mr-2 h-4 w-4" /> Copiar
        </Button>
      </div>

      <p className="text-xs text-secondary font-body">
        Compartilhe este link nas redes sociais ou envie diretamente para seus amigos
      </p>
    </div>
  );
}
