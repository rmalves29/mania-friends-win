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
    <div className="bg-gradient-card rounded-xl p-6 shadow-soft border border-border">
      <h3 className="font-display text-lg font-bold mb-2 text-foreground">Seu Link de Indicação</h3>
      <p className="text-sm text-muted-foreground font-body mb-4">
        Compartilhe e ganhe prêmios a cada amiga que se cadastrar!
      </p>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-card rounded-lg px-4 py-3 text-sm font-body text-muted-foreground truncate border border-border">
          {link}
        </div>
        <Button onClick={copyLink} variant="outline" size="icon" className="shrink-0">
          {copied ? <Check className="h-4 w-4 text-badge-unlocked" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={copyLink} variant="outline" className="font-body">
          <Copy className="mr-2 h-4 w-4" /> Copiar Link
        </Button>
        <Button onClick={shareWhatsApp} className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-primary-foreground font-body">
          <Share2 className="mr-2 h-4 w-4" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
